<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from "../../../UI/utils/useToast";
const { toast } = useToast();
// UI Komponentlar
import Button from '../../../UI/Button.vue';
import Input from "../../../UI/Input.vue";
import ExportDropdown from '../../../UI/ExportDropdown.vue';
import DataTable from "../../../UI/DataTable.vue"; 

// Modallar
import AddProductModal from "../../../components/Sale/products/AddProductModal.vue";
import DetailProductModal from "../../../components/Sale/products/DetailProductModal.vue";
import BarcodeScannerModal from "../../../components/BarcodeScaner/scaner.vue"; // Yo'lni to'g'rilang
// Store
import { ProductsManagmentStore } from "../../../stores/Sale/products/product.store";

const store = ProductsManagmentStore();
const { products, loading } = storeToRefs(store);

// --- 1. CONFIG & UTILS ---
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const getImageUrl = (path) => path ? (path.startsWith("http") ? path : `${API_URL}/${path}`) : "/no-image.png";
const formatPrice = (v) => new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(v || 0);

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  toast.info( "Artikul nusxalandi!" );
};

// --- 2. STATE ---
const searchQuery = ref("");
const activeQuickFilter = ref("all"); 
const isStatsVisible = ref(false); 
const activeDropdown = ref(null);
const menuStyles = ref({ top: '0px', left: '0px' });

// Analitika
const analytics = computed(() => {
  const all = products.value || [];
  let totalValue = 0, totalCost = 0, lowStock = 0, active = 0;
  all.forEach(item => {
    const stock = Number(item.totalStock || 0);
    totalValue += (Number(item.salePrice || 0) * stock);
    totalCost += (Number(item.costPrice || 0) * stock);
    if (stock < 10) lowStock++;
    if (item.status === 'active') active++;
  });
  const margin = totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0;
  return { totalValue, lowStock, active, margin, count: all.length };
});

const filteredProducts = computed(() => {
  let list = products.value || [];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(i => i.name?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q));
  }
  if (activeQuickFilter.value === 'lowStock') list = list.filter(i => i.totalStock < 10);
  if (activeQuickFilter.value === 'active') list = list.filter(i => i.status === 'active');
  return list;
});

const columns = [
  { key: 'code', label: 'Artikul', width: '120px', fixed: 'left' },
  { key: 'name', label: 'Mahsulot tahlili', width: '280px' },
  { key: 'costPrice', label: 'Tan Narxi', width: '130px', align: 'right' },
  { key: 'salePrice', label: 'Sotuv Narxi', width: '130px', align: 'right' },
  { key: 'totalStock', label: 'Ombor', width: '130px', align: 'center' },
  // Yangi qo'shilgan analitik ustunlar
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
    menuStyles.value = { top: `${rect.bottom + window.scrollY + 5}px`, left: `${rect.left - 170}px` };
  }
};

const handleAction = (act, row) => {
  activeDropdown.value = null;
  if (act === 'view') store.GetOne(row._id);
  else if (act === 'edit') store.openEditModal(row._id);
  else if (act === 'delete') store.DeleteById(row._id);
};
// State (Sizda allaqachon bor)
const isScannerOpen = ref(false);

// Skaner natija berganda ishlaydigan funksiya
const handleGlobalScan = async (code) => {
  isScannerOpen.value = false; // Skanerni yopamiz
  
  // Mahsulotni bazadan qidirish
  const product = products.value.find(p => p.code === code);
  
  if (product) {
    toast.success(`${product.name} topildi!`);
    store.GetOne(product._id); // Mahsulot bor bo'lsa, detalini ochadi
  } else {
    toast.info("Yangi mahsulot. Ma'lumotlarni kiriting.");
    store.openAddModal(code); // Mahsulot yo'q bo'lsa, qo'shish modalini shu kod bilan ochadi
  }
};
onMounted(() => {
  store.GetAll();
  window.addEventListener('scroll', () => activeDropdown.value = null, true);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.row-action-wrapper') && !e.target.closest('.teleported-menu')) activeDropdown.value = null;
  });
});
</script>

<template>
  <AddProductModal class="z-[110]" />
  <DetailProductModal class="z-[110]" />
 <BarcodeScannerModal 
    :isOpen="isScannerOpen" 
    @close="isScannerOpen = false" 
    @detected="handleGlobalScan" 
  />
  <div class="h-screen flex flex-col gap-3 p-3 md:p-5 bg-transparent dark:bg-slate-900 overflow-hidden font-sans relative">
    
   <transition name="premium-slide">
  <div v-if="isStatsVisible" 
       class="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 flex-none z-10 overflow-x-auto no-scrollbar pb-4 md:pb-2 pt-1 px-1">
    
    <div v-for="(card, i) in [
      { id: 'all', label: 'Jami assortiment', val: analytics.count, unit: 'tur', icon: 'fa-layer-group', color: 'indigo', desc: 'Umumiy mahsulotlar' },
      { id: 'margin', label: 'Oʻrtacha Marja', val: analytics.margin.toFixed(1) + '%', icon: 'fa-chart-pie', color: 'emerald', desc: 'Biznes rentabelligi' },
      { id: 'lowStock', label: 'Kritik Qoldiq', val: analytics.lowStock, unit: 'ta', icon: 'fa-triangle-exclamation', color: 'rose', pulse: analytics.lowStock > 0, desc: 'Tugayotgan tovarlar' },
      { id: 'total', label: 'Aktiv Qiymati', val: formatPrice(analytics.totalValue), icon: 'fa-vault', color: 'amber', desc: 'Ombordagi jami mablagʻ' }
    ]" 
    :key="i" 
    @click="activeQuickFilter = activeQuickFilter === card.id ? 'all' : card.id"
    class="min-w-[170px] md:min-w-0 group relative cursor-pointer transition-all duration-500 isolation-auto"
    >
      <div 
        class="h-full p-5 md:p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] group-hover:-translate-y-1.5"
        :class="activeQuickFilter === card.id ? `ring-2 ring-${card.color}-500 dark:ring-${card.color}-400 shadow-${card.color}-100/50 dark:shadow-none` : ''"
      >
        <div class="flex items-start justify-between mb-4 md:mb-5">
          <div 
            :class="[
              `bg-${card.color}-50 text-${card.color}-600 dark:bg-${card.color}-950/30 dark:text-${card.color}-400`,
              card.pulse ? 'animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]' : ''
            ]" 
            class="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
          >
            <i :class="['fa-solid', card.icon, 'text-lg md:text-xl']"></i>
          </div>
          
          <div v-if="activeQuickFilter === card.id" class="flex h-2 w-2">
            <span :class="`animate-ping absolute inline-flex h-2 w-2 rounded-full bg-${card.color}-400 opacity-75`"></span>
            <span :class="`relative inline-flex rounded-full h-2 w-2 bg-${card.color}-500`"></span>
          </div>
        </div>

        <div class="space-y-1 md:space-y-2">
          <h4 class="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] leading-none">
            {{ card.label }}
          </h4>
          
          <div class="flex items-baseline gap-1">
            <span class="text-lg md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {{ card.val }}
            </span>
            <span v-if="card.unit" class="text-[10px] md:text-xs font-bold text-slate-400 uppercase">{{ card.unit }}</span>
          </div>
          
          <p class="hidden md:block text-[9px] font-medium text-slate-400 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {{ card.desc }}
          </p>
        </div>

        <div :class="`bg-${card.color}-500/5`" class="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      </div>
    </div>
  </div>
</transition>

    <div class="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 md:py-3">
  <div class="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center gap-4">
    
    <div class="relative group flex-1 w-full order-2 md:order-1">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        <i class="fa-solid fa-search text-sm"></i>
      </div>
      <input 
        v-model="searchQuery" 
        type="text"
        placeholder="Mahsulot nomi, artikul yoki shtrix-kod orqali qidiring..." 
        class="w-full h-11 pl-10 pr-12 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all outline-none text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm"
      />
      <div class="hidden lg:flex absolute inset-y-0 right-3 items-center">
        <kbd class="px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md">
          /
        </kbd>
      </div>
    </div>

    <div class="flex items-center justify-between md:justify-center w-full md:w-auto gap-2 order-1 md:order-2">
      

      <div class="flex items-center gap-2">
        <button @click="isStatsVisible = !isStatsVisible" 
          :class="isStatsVisible ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400'"
          class="h-10 w-10 md:w-auto md:px-4 rounded-xl border flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm">
          <i class="fa-solid fa-chart-pie text-[15px]"></i>
          <span class="hidden xl:inline text-xs font-bold uppercase tracking-widest">Analitika</span>
        </button>

        <ExportDropdown @select="store.handleExcelExport({ payload: filteredProducts })" class="!h-10" />

        <div class="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <button @click="isScannerOpen = true" 
          class="h-10 w-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all active:scale-95">
          <i class="fas fa-qrcode text-lg"></i>
        </button>

        <button @click="store.openAddModal()" 
          class="h-10 px-4 md:px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-95">
          <i class="fas fa-plus"></i>
          <span class="hidden sm:inline">Yangi</span>
        </button>
      </div>

    </div>
  </div>
</div>

   <div class="flex-grow overflow-hidden bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl md:rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative">
  <DataTable :items="filteredProducts" :columns="columns" :loading="loading" class="analyt-table h-full">
    
    <template #code="{ row }">
      <div class="flex items-center gap-3 group/code">
        <div class="w-1 h-5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover/code:bg-indigo-500 transition-all duration-300"></div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="font-mono text-[12px] md:text-[13px] font-bold text-slate-600 dark:text-slate-300 tracking-tight">
              {{ row.code }}
            </span>
            <button @click.stop="copyToClipboard(row.code)" 
                    class="opacity-0 group-hover/code:opacity-100 p-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-400 transition-all">
              <i class="fa-regular fa-copy text-[10px]"></i>
            </button>
          </div>
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Artikul</span>
        </div>
      </div>
    </template>

    <template #name="{ row }">
      <div class="flex items-center gap-3 md:gap-4 py-1.5 text-left group">
        <div class="relative flex-shrink-0">
          <div class="absolute inset-0 bg-indigo-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <img :src="row.image" 
               class="hidden xs:block w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm transition-transform duration-500 group-hover:scale-105">
        </div>
        <div class="flex flex-col min-w-0">
          <span class="font-black text-slate-800 dark:text-slate-100 text-xs md:text-sm truncate leading-tight mb-0.5">
            {{ row.name }}
          </span>
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-widest">
              {{ row.category || 'Boʻlimsiz' }}
            </span>
            <span v-if="row.status === 'active'" class="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
          </div>
        </div>
      </div>
    </template>

    <template #costPrice="{ row }">
      <div class="flex flex-col items-end px-2">
        <span class="text-[12px] md:text-[13px] font-black text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20 px-2 py-0.5 rounded-lg border border-yellow-100/50">
          {{ formatPrice(row.costPrice) }}
        </span>
        <span class="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Xarajat</span>
      </div>
    </template>

    <template #salePrice="{ row }">
      <div class="flex flex-col items-end px-2">
        <span class="text-[12px] md:text-[13px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100/50">
          {{ formatPrice(row.salePrice) }}
        </span>
        <span class="text-[8px] font-black text-emerald-500/60 uppercase mt-0.5">Sotuv</span>
      </div>
    </template>

    <template #totalStock="{ row }">
      <div class="w-full max-w-[130px] mx-auto space-y-1.5">
        <div class="flex justify-between items-end px-1">
          <span :class="row.totalStock < 10 ? 'text-rose-500 font-black italic' : 'text-slate-700 dark:text-slate-300 font-bold'" class="text-[11px]">
            {{ row.totalStock }} <span class="text-[9px] opacity-50 uppercase">{{ row.unit }}</span>
          </span>
          <span class="text-[10px] font-black text-slate-400">{{ Math.min(row.totalStock, 100) }}%</span>
        </div>
        <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-[1px]">
           <div :style="{ width: Math.min(row.totalStock, 100) + '%' }" 
                :class="row.totalStock < 10 
                  ? 'bg-gradient-to-r from-rose-500 to-orange-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]' 
                  : 'bg-gradient-to-r from-indigo-500 to-blue-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'" 
                class="h-full rounded-full transition-all duration-1000">
           </div>
        </div>
      </div>
    </template>

    <template #margin="{ row }">
      <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-emerald-600 border border-slate-100 dark:border-slate-800 font-black text-[11px] shadow-sm">
        <i class="fa-solid fa-arrow-trend-up text-[10px]"></i>
        {{ row.salePrice > 0 ? (((row.salePrice - row.costPrice) / row.salePrice) * 100).toFixed(0) : 0 }}%
      </div>
    </template>

    <template #amountPrice="{ row }">
      <div class="flex flex-col items-end pr-2">
        <span class="text-[13px] md:text-[14px] font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
          {{ formatPrice(row.salePrice * row.totalStock) }}
        </span>
        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Aktiv Qiymati</span>
      </div>
    </template>

    <template #actions="{ row }">
      <div class="relative flex justify-center row-action-wrapper">
        <button :id="`trigger-${row._id}`" @click.stop="toggleMenu(row._id)" 
                class="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 transition-all active:scale-90">
          <i class="fa-solid fa-ellipsis-v text-sm md:text-base"></i>
        </button>
        
        <Teleport to="body">
          <transition name="dropdown-pop">
            <div v-if="activeDropdown === row._id" 
                 class="fixed teleported-menu w-48 md:w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl md:rounded-[2rem] shadow-[0_20px_70px_rgba(0,0,0,0.15)] border border-slate-200/50 dark:border-slate-700/50 p-2.5 z-[9999] isolation-auto" 
                 :style="menuStyles">
              
              <div class="text-[9px] font-black text-slate-400 px-4 py-2 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 mb-1.5 text-center">
                Boshqaruv
              </div>

              <button v-for="btn in [
                { label: 'Analitika', act: 'view', icon: 'fa-chart-line', col: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
                { label: 'Tahrirlash', act: 'edit', icon: 'fa-pen-nib', col: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
                { label: 'O\'chirish', act: 'delete', icon: 'fa-trash-can', col: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' }
              ]" :key="btn.act" @click.stop="handleAction(btn.act, row)" 
              class="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group/item text-left">
                <div :class="btn.col" class="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                  <i :class="['fa-solid', btn.icon, 'text-[11px]']"></i>
                </div>
                <span class="text-[12px] font-bold text-slate-600 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white">
                  {{ btn.label }}
                </span>
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

/* Har bir elementning balandligini standartlashtirish */
:deep(.el-input__wrapper) { height: 40px !important; }
button, .h-10 { height: 40px !important; }

/* Premium Animations */
.premium-slide-enter-active { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.premium-slide-leave-active { transition: all 0.3s ease-in; }
.premium-slide-enter-from { opacity: 0; transform: scale(0.98) translateY(-10px); }

.dropdown-pop-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1.2); }
.dropdown-pop-enter-from { opacity: 0; transform: scale(0.8) translateY(-10px); }

.analyt-table :deep(tbody tr) { animation: premiumFadeIn 0.5s ease-out forwards; opacity: 0; }
@keyframes premiumFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* Scrollbar dark mode optimization */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.dark ::-webkit-scrollbar-thumb { background: #334155; }
</style>