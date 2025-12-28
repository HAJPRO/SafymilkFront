<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from "../../../UI/utils/useToast";
import { printProductQR } from "../../../utils/printService";

// UI Komponentlar
import Button from '../../../UI/Button.vue';
import Input from "../../../UI/Input.vue";
import ExportDropdown from '../../../UI/ExportDropdown.vue';
import DataTable from "../../../UI/DataTable.vue"; 

// Modallar
import AddProductModal from "../../../components/Sale/products/AddProductModal.vue";
import DetailProductModal from "../../../components/Sale/products/DetailProductModal.vue";
import BarcodeScannerModal from "../../../components/BarcodeScaner/scaner.vue";

// Store
import { ProductsManagmentStore } from "../../../stores/Sale/products/product.store";

const { toast } = useToast();
const store = ProductsManagmentStore();
const { products, loading } = storeToRefs(store);

// --- 1. CONFIG & UTILS ---
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const formatPrice = (v) => new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(v || 0);

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  toast.info("Kode nusxalandi!");
};

// --- 2. STATE ---
const searchQuery = ref("");
const activeQuickFilter = ref("all"); 
const isStatsVisible = ref(false); 
const activeDropdown = ref(null);
const menuStyles = ref({ top: '0px', left: '0px' });
const isScannerOpen = ref(false);

// Analitika
const analytics = computed(() => {
  const all = products.value || [];
  let totalValue = 0, totalCost = 0, lowStock = 0;
  all.forEach(item => {
    const stock = Number(item.totalStock || 0);
    totalValue += (Number(item.salePrice || 0) * stock);
    totalCost += (Number(item.costPrice || 0) * stock);
    if (stock < 10) lowStock++;
  });
  const margin = totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0;
  return { totalValue, lowStock, margin, count: all.length };
});

const filteredProducts = computed(() => {
  let list = products.value || [];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(i => i.name?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q));
  }
  if (activeQuickFilter.value === 'lowStock') list = list.filter(i => i.totalStock < 10);
  return list;
});

const columns = [
  { key: 'code', label: 'Kod', width: '120px', fixed: 'left' },
  { key: 'name', label: 'Mahsulot tahlili', width: '280px' },
  { key: 'qr', label: 'Qr', width: '130px', align: 'center' },
  { key: 'costPrice', label: 'Tan Narxi', width: '130px', align: 'right' },
  { key: 'salePrice', label: 'Sotuv Narxi', width: '130px', align: 'right' },
  { key: 'totalStock', label: 'Ombor', width: '130px', align: 'center' },
  { key: 'margin', label: 'Rentabellik', width: '110px', align: 'center' },
  { key: 'amountPrice', label: 'Jami Qiymat', width: '150px', align: 'right' },
  { key: 'actions', label: '', width: '60px', fixed: 'right' }
];

// --- 3. FUNCTIONS ---
const toggleMenu = async (id) => {
  if (activeDropdown.value === id) { activeDropdown.value = null; return; }
  activeDropdown.value = id;
  await nextTick();
  const trigger = document.getElementById(`trigger-${id}`);
  if (trigger) {
    const rect = trigger.getBoundingClientRect();
    menuStyles.value = { 
      top: `${rect.bottom + window.scrollY + 5}px`, 
      left: `${rect.left - 160}px` 
    };
  }
};

const handleAction = (act, row) => {
  activeDropdown.value = null;
  if (act === 'view') store.GetOne(row._id);
  else if (act === 'edit') store.openEditModal(row._id);
  else if (act === 'delete') store.DeleteById(row._id);
};

const handleGlobalScan = async (code) => {
  if (!code) return;
  const scannedCode = String(code).trim().toLowerCase();
  isScannerOpen.value = false;

  const product = products.value.find(p => String(p.code || "").toLowerCase() === scannedCode);

  if (product) {
    toast.success(`Mahsulot topildi: ${product.name}`);
    setTimeout(() => store.openEditModal(product._id), 400);
  } else {
    toast.info("Bu kode bazada yo'q.");
    setTimeout(() => store.openAddModal(scannedCode), 500);
  }
};

onMounted(() => {
  store.GetAll();
  window.addEventListener('scroll', () => activeDropdown.value = null, true);
});
</script>

<template>
  <AddProductModal class="z-[200]" />
  <DetailProductModal class="z-[200]" />
  <BarcodeScannerModal v-model="isScannerOpen" @detected="handleGlobalScan" @close="isScannerOpen = false" class="z-[210]" />

  <div class="h-screen flex flex-col gap-3 p-3 md:p-5 bg-transparent dark:bg-slate-900 overflow-hidden font-sans relative">
    
    <transition name="premium-slide">
      <div v-if="isStatsVisible" class="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 flex-none z-10 overflow-x-auto no-scrollbar pb-4 pt-1 px-1">
        <div v-for="(card, i) in [
          { id: 'all', label: 'Jami assortiment', val: analytics.count, icon: 'fa-layer-group', color: 'indigo' },
          { id: 'margin', label: 'Oʻrtacha Marja', val: analytics.margin.toFixed(1) + '%', icon: 'fa-chart-pie', color: 'emerald' },
          { id: 'lowStock', label: 'Kritik Qoldiq', val: analytics.lowStock, icon: 'fa-triangle-exclamation', color: 'rose' },
          { id: 'total', label: 'Aktiv Qiymati', val: formatPrice(analytics.totalValue), icon: 'fa-vault', color: 'amber' }
        ]" :key="i" @click="activeQuickFilter = activeQuickFilter === card.id ? 'all' : card.id"
        class="min-w-[170px] md:min-w-0 group relative cursor-pointer">
          <div class="h-full p-5 md:p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm transition-all group-hover:-translate-y-1.5"
               :class="activeQuickFilter === card.id ? `ring-2 ring-${card.color}-500 shadow-lg` : ''">
            <div :class="`bg-${card.color}-50 text-${card.color}-600 w-10 h-10 rounded-2xl flex items-center justify-center mb-4`"><i :class="['fa-solid', card.icon, 'text-lg']"></i></div>
            <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{{ card.label }}</h4>
            <div class="text-lg md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{{ card.val }}</div>
          </div>
        </div>
      </div>
    </transition>

    <div class="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl">
      <div class="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center gap-4">
        <div class="relative flex-1 w-full order-2 md:order-1">
          <i class="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input v-model="searchQuery" type="text" placeholder="Qidirish..." class="w-full h-11 pl-10 pr-4 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
        </div>
        <div class="flex items-center gap-2 order-1 md:order-2">
          <button @click="isStatsVisible = !isStatsVisible" class="h-10 px-4 rounded-xl border flex items-center gap-2 bg-white dark:bg-slate-800 text-xs font-bold uppercase tracking-widest"><i class="fa-solid fa-chart-pie"></i> Analitika</button>
          <ExportDropdown @select="store.handleExcelExport({ payload: filteredProducts })" class="!h-10" />
          <button @click="isScannerOpen = true" class="h-10 w-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-indigo-600 transition-all"><i class="fas fa-qrcode text-lg"></i></button>
          <button @click="store.openAddModal()" class="h-10 px-6 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 active:scale-95 transition-all">+ Yangi</button>
        </div>
      </div>
    </div>

    <div class="flex-grow overflow-hidden bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-slate-200/60 shadow-sm relative">
   <DataTable :items="filteredProducts" :columns="columns" :loading="loading" class="h-full">
  
  <template #code="{ row }">
    <div class="flex flex-col cursor-pointer group/code" @click="copyToClipboard(row.code)">
      <div class="flex items-center gap-1.5">
        <span class="font-mono text-[12px] font-black text-slate-700 dark:text-slate-200 tracking-tight group-hover/code:text-indigo-600 transition-colors">
          {{ row.code }}
        </span>
        <i class="fa-regular fa-copy text-[10px] opacity-0 group-hover/code:opacity-100 text-slate-400"></i>
      </div>
      <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">Kod</span>
    </div>
  </template>

  <template #name="{ row }">
    <div class="flex items-center gap-3 py-1.5 text-left group">
      <div class="relative flex-shrink-0">
        <img :src="row.image || '/no-image.png'" 
             class="w-11 h-11 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm transition-transform duration-300 group-hover:scale-105">
        <div v-if="row.totalStock < 10" class="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
      </div>
      <div class="flex flex-col min-w-0">
        <span class="font-black text-slate-800 dark:text-slate-100 text-[13px] truncate leading-tight group-hover:text-indigo-600 transition-colors">
          {{ row.name }}
        </span>
        <span class="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md uppercase tracking-wider w-fit mt-1">
          {{ row.category || 'Kategoriyasiz' }}
        </span>
      </div>
    </div>
  </template>

  <template #qr="{ row }">
    <div v-if="row.qr" class="flex justify-center shrink-0">
      <div class="relative group" @click.stop="printProductQR(row)">
        <div class="relative p-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 group-hover:border-indigo-500 group-hover:ring-4 group-hover:ring-indigo-500/10 cursor-pointer w-11 h-11">
          <img :src="row.qr" alt="QR" class="w-full h-full object-contain group-hover:scale-90 transition-transform" />
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1.5px] rounded-lg transition-all">
            <i class="fa-solid fa-print text-indigo-600 text-[10px]"></i>
          </div>
        </div>

        <div class="absolute invisible group-hover:visible z-[9999] left-full ml-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300">
          <div class="p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transform transition-all duration-300 origin-left scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 flex flex-col items-center min-w-[210px]">
            <div class="bg-white p-2 rounded-2xl mb-3 border border-slate-100 shadow-inner">
              <img :src="row.qr" class="w-36 h-36 object-contain" />
            </div>
            <div class="text-center w-full px-1">
              <p class="text-[11px] font-black text-slate-800 dark:text-white uppercase truncate mb-1">{{ row.name }}</p>
              <div class="flex items-center justify-center gap-2 mb-2">
                <span class="text-[10px] font-bold text-indigo-500 font-mono tracking-tighter">#{{ row.code }}</span>
                <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{{ formatPrice(row.salePrice) }}</span>
              </div>
              <div class="pt-2 border-t border-slate-100 dark:border-slate-700 w-full">
                <span class="text-[8px] font-black text-slate-400 uppercase flex items-center justify-center gap-1">
                  <i class="fa-solid fa-hand-pointer text-indigo-400"></i> Pechat uchun bosing
                </span>
              </div>
            </div>
            <div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-700 rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <template #costPrice="{ row }">
    <div class="flex flex-col items-end">
      <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ formatPrice(row.costPrice) }}</span>
      <span class="text-[8px] font-black text-slate-300 uppercase">Kiruvchi</span>
    </div>
  </template>

  <template #salePrice="{ row }">
    <div class="flex flex-col items-end">
      <span class="text-[13px] font-black text-slate-900 dark:text-white leading-none">{{ formatPrice(row.salePrice) }}</span>
      <div v-if="row.salePrice > row.costPrice" class="flex items-center text-[8px] font-black text-emerald-500 mt-1 uppercase">
        <i class="fa-solid fa-arrow-up-long mr-1"></i>
        {{ formatPrice(row.salePrice - row.costPrice) }} Foyda
      </div>
    </div>
  </template>

  <template #totalStock="{ row }">
    <div class="flex flex-col items-center gap-1.5 min-w-[100px]">
      <div class="flex justify-between w-full px-1">
        <span class="text-[10px] font-black" :class="row.totalStock < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-600 dark:text-slate-300'">
          {{ row.totalStock }} <span class="text-[8px] opacity-60">{{ row.unit }}</span>
        </span>
        <span class="text-[9px] font-bold text-slate-400 tracking-tighter uppercase">Omborda</span>
      </div>
      <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-[1px]">
        <div :style="{ width: Math.min((row.totalStock / 100) * 100, 100) + '%' }" 
             class="h-full rounded-full transition-all duration-700"
             :class="row.totalStock < 10 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-400'">
        </div>
      </div>
    </div>
  </template>

  <template #margin="{ row }">
    <div v-if="row.salePrice > 0" 
         class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black text-[11px] shadow-sm border"
         :class="(((row.salePrice - row.costPrice) / row.salePrice) * 100) > 30 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100/50' 
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-100/50'">
      <i class="fa-solid fa-chart-line text-[9px]"></i>
      {{ (((row.salePrice - row.costPrice) / row.salePrice) * 100).toFixed(0) }}%
    </div>
  </template>

  <template #amountPrice="{ row }">
    <div class="flex flex-col items-end pr-2">
      <span class="text-[13px] font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
        {{ formatPrice(row.salePrice * row.totalStock) }}
      </span>
      <div class="w-10 h-0.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1"></div>
    </div>
  </template>

  <template #actions="{ row }">
    <div class="relative flex justify-center row-action-wrapper">
      <button :id="`trigger-${row._id}`" @click.stop="toggleMenu(row._id)" 
              class="w-9 h-9 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-600 transition-all active:scale-90 flex items-center justify-center border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/30">
        <i class="fa-solid fa-ellipsis-v text-xs"></i>
      </button>
      
      <Teleport to="body">
        <transition name="dropdown-pop">
          <div v-if="activeDropdown === row._id" 
               class="fixed z-[9999] w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_70px_rgba(0,0,0,0.15)] border border-slate-200/50 dark:border-slate-700/50 p-2.5" 
               :style="menuStyles">
            
            <div class="text-[9px] font-black text-slate-400 px-4 py-2 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 mb-1.5 text-center">Tizim Boshqaruvi</div>

            <button v-for="btn in [
              { label: 'Toʻliq tahlil', act: 'view', icon: 'fa-chart-pie', col: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
              { label: 'Tahrirlash', act: 'edit', icon: 'fa-pen-to-square', col: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
              { label: 'Oʻchirish', act: 'delete', icon: 'fa-trash-can', col: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' }
            ]" :key="btn.act" @click.stop="handleAction(btn.act, row)" 
            class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all group/item text-left mb-1 last:mb-0">
              <div :class="btn.col" class="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                <i :class="['fa-solid', btn.icon, 'text-[11px]']"></i>
              </div>
              <span class="text-[12px] font-bold text-slate-600 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white">{{ btn.label }}</span>
            </button>
          </div>
        </transition>
      </Teleport>
    </div>
  </template>

</DataTable>
    </div>
  </div>
</template>

<style scoped>
.h-screen { height: 100dvh; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Premium Animations */
.premium-slide-enter-active { transition: all 0.4s ease-out; }
.premium-slide-enter-from { opacity: 0; transform: translateY(-10px); }

.dropdown-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1.2); }
.dropdown-pop-enter-from { opacity: 0; transform: scale(0.8) translateY(-10px); }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.dark ::-webkit-scrollbar-thumb { background: #334155; }
</style>