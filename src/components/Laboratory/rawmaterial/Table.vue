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

// Modallar (Xomashyo uchun moslashtirilgan bo'lishi kerak)
// import AddRawMaterialModal from "./RawmaterialModal.vue";
// import DetailRawMaterialModal from "../../../components/Supply/raw-material/DetailRawMaterialModal.vue";
import BarcodeScannerModal from "../../../components/BarcodeScaner/scaner.vue";

// Store
import {RawMaterialsStore } from "../../../stores/Supply/rawmaterial/rawmaterial.store.js";

const { toast } = useToast();
const store = RawMaterialsStore();
const { materials, loading } = storeToRefs(store);

// --- 1. CONFIG & UTILS ---
const formatPrice = (v) => new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(v || 0);

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  toast.info("Xomashyo kodi nusxalandi!");
};

// --- 2. STATE ---
const searchQuery = ref("");
const activeQuickFilter = ref("all"); 
const isStatsVisible = ref(false); 
const activeDropdown = ref(null);
const menuStyles = ref({ top: '0px', left: '0px' });
const isScannerOpen = ref(false);

// Xomashyo Analitikasi
const analytics = computed(() => {
  const all = materials.value || [];
  let totalVolume = 0, totalValue = 0, lowStock = 0, avgFat = 0;
  
  all.forEach(item => {
    const stock = Number(item.totalStock || 0);
    totalVolume += stock;
    totalValue += (Number(item.costPrice || 0) * stock);
    avgFat += Number(item.fatContent || 0);
    if (stock < 50) lowStock++; // Xomashyo uchun kritik chegara odatda yuqori (masalan 50 litr)
  });
  
  return { 
    totalValue, 
    lowStock, 
    count: all.length, 
    totalVolume,
    avgFat: all.length > 0 ? (avgFat / all.length).toFixed(1) : 0 
  };
});

const filteredMaterials = computed(() => {
  let list = materials.value || [];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(i => i.name?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q));
  }
  if (activeQuickFilter.value === 'lowStock') list = list.filter(i => i.totalStock < 50);
  return list;
});

const columns = [
  { key: 'code', label: 'Lot ID', width: '100px', fixed: 'left' },
  { key: 'name', label: 'Xomashyo va Sifat', width: '280px' },
  { key: 'qr', label: 'QR Yorliq', width: '120px', align: 'center' },
  { key: 'quality', label: 'Sifat ko\'rsatkichlari', width: '160px', align: 'center' },
  { key: 'costPrice', label: 'Xarid Narxi (L/Kg)', width: '150px', align: 'right' },
  { key: 'totalStock', label: 'Ombor Qoldig\'i', width: '140px', align: 'center' },
  { key: 'amountPrice', label: 'Balans Qiymati', width: '160px', align: 'right' },
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
  if (act === 'view') store.GetById(row._id);
  else if (act === 'edit') store.openEditModal(row._id);
  else if (act === 'delete') store.DeleteById(row._id);
};

onMounted(() => {
  store.GetAll();
  window.addEventListener('scroll', () => activeDropdown.value = null, true);
});
</script>

<template>
  <!-- <AddRawMaterialModal class="z-[200]" /> -->
  <!-- <DetailRawMaterialModal class="z-[200]" /> -->
  <BarcodeScannerModal v-model="isScannerOpen" @detected="(c) => searchQuery = c" class="z-[210]" />

  <div class="h-screen flex flex-col gap-3 p-3 md:p-5 bg-transparent dark:bg-slate-900 overflow-hidden font-sans relative">
    
    <transition name="premium-slide">
      <div v-if="isStatsVisible" class="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 flex-none z-10 overflow-x-auto no-scrollbar pb-4 pt-1 px-1">
        <div v-for="(card, i) in [
          { id: 'all', label: 'Xomashyo turlari', val: analytics.count, icon: 'fa-boxes-stacked', color: 'indigo' },
          { id: 'fat', label: 'Oʻrtacha Yogʻlilik', val: analytics.avgFat + '%', icon: 'fa-droplet', color: 'blue' },
          { id: 'lowStock', label: 'Kritik Qoldiq (L/Kg)', val: analytics.lowStock, icon: 'fa-flask-vial', color: 'rose' },
          { id: 'total', label: 'Ombor Balansi', val: formatPrice(analytics.totalValue), icon: 'fa-money-bill-trend-up', color: 'amber' }
        ]" :key="i" @click="activeQuickFilter = activeQuickFilter === card.id ? 'all' : card.id"
        class="min-w-[180px] md:min-w-0 group relative cursor-pointer">
          <div class="h-full p-5 md:p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm transition-all group-hover:-translate-y-1.5"
               :class="activeQuickFilter === card.id ? `ring-2 ring-${card.color}-500 shadow-lg` : ''">
            <div :class="`bg-${card.color}-50 text-${card.color}-600 w-10 h-10 rounded-2xl flex items-center justify-center mb-4`"><i :class="['fa-solid', card.icon, 'text-lg']"></i></div>
            <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{{ card.label }}</h4>
            <div class="text-lg md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{{ card.val }}</div>
          </div>
        </div>
      </div>
    </transition>

    <div class="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl px-1 xs:px-4 md:px-2 transition-all rounded-xl xs:py-2">
      <div class="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center gap-3">
        <div class="flex items-center justify-between md:justify-end gap-2 order-1 md:order-2 md:flex-1">
          <div class="flex items-center gap-2">
            <ExportDropdown @select="store.handleExcelExport({ payload: filteredMaterials })" label="Yuklab olish" 
  icon="fa-solid fa-file-excel" 
  size="md" />
            <Button @click="isStatsVisible = !isStatsVisible" :variant="isStatsVisible ? 'primary' : 'secondary'" left-icon="fa-solid fa-chart-column" size="sm" />
            <Button @click="isScannerOpen = true" variant="secondary" left-icon="fas fa-qrcode" size="sm" />
            <Button @click="store.openAddModal()" variant="primary" left-icon="fas fa-plus" size="sm">Xomashyo</Button>
          </div>
        </div>

        <div class="w-full md:max-w-[400px] lg:max-w-[800px] order-2 md:order-1 mt-4">
          <Input v-model="searchQuery" placeholder="Xomashyo nomi yoki ID orqali qidirish..." icon-pre="fa-solid fa-magnifying-glass" rounded="rounded-2xl" clearable class="premium-search-input" />
        </div>
      </div>
    </div>

    <div class="flex-grow overflow-hidden bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-sm relative border border-slate-200/50 dark:border-slate-800/50">
      <DataTable :items="filteredMaterials" :columns="columns" :loading="loading" class="h-full">
        
        <template #code="{ row }">
          <div class="flex flex-col cursor-pointer group/code" @click="copyToClipboard(row.code)">
            <span class="font-mono text-[12px] font-black text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">#{{ row.code }}</span>
            <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">Xarid ID</span>
          </div>
        </template>

     <template #name="{ row }">
  <div class="flex items-center gap-3 py-1.5 text-left group">
    <div class="relative flex-shrink-0">
      <div class="w-11 h-11 bg-blue-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-slate-700 shadow-sm transition-all group-hover:scale-105 overflow-hidden">
        
        <img 
          v-if="row.image"
          :src="row.image" 
          :alt="row.name" 
          class="w-full h-full object-cover"
          @error="(e) => e.target.style.display = 'none'"
        >
        
        <i v-else class="fa-solid fa-droplet text-lg text-blue-500"></i>
        
      </div>

      <div 
        v-if="row.totalStock < 50" 
        class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse shadow-sm"
        title="Zaxira kam!"
      ></div>
    </div>

    <div class="flex flex-col min-w-0">
      <span class="font-black text-slate-800 dark:text-slate-100 text-[13px] truncate leading-tight group-hover:text-indigo-600 transition-colors uppercase">
        {{ row.name }}
      </span>
      
      <div class="flex items-center gap-2 mt-1">
        <span class="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md uppercase tracking-wider w-fit">
          {{ row.type || 'Sut mahsuloti' }}
        </span>
        
        <span v-if="row.totalStock < 10" class="text-[8px] text-rose-600 font-extrabold animate-bounce">
          TUGAYAPTI!
        </span>
      </div>
    </div>
  </div>
</template>

        <template #qr="{ row }">
          <div v-if="row.qr" class="flex justify-center" @click.stop="printProductQR(row)">
            <div class="relative group p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer w-10 h-10">
              <img :src="row.qr" class="w-full h-full object-contain" />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[1px] rounded-lg transition-all">
                <i class="fa-solid fa-print text-indigo-600 text-[10px]"></i>
              </div>
            </div>
          </div>
        </template>

        <template #quality="{ row }">
          <div class="flex flex-col items-center gap-1">
            <div class="flex gap-2">
              <span class="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800">
                F: {{ row.fatContent }}%
              </span>
              <span class="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-800">
                D: {{ row.density }}
              </span>
            </div>
            <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Yog'lilik / Zichlik</span>
          </div>
        </template>

        <template #costPrice="{ row }">
          <div class="flex flex-col items-end">
            <span class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-none">{{ formatPrice(row.costPrice) }}</span>
            <span class="text-[8px] font-bold text-slate-400 uppercase mt-1">O'rtacha xarid</span>
          </div>
        </template>

        <template #totalStock="{ row }">
          <div class="flex flex-col items-center gap-1.5 min-w-[100px]">
            <span class="text-[11px] font-black" :class="row.totalStock < 50 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'">
              {{ row.totalStock.toLocaleString() }} <span class="text-[8px] opacity-60 uppercase">{{ row.unit }}</span>
            </span>
            <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-[1px]">
              <div :style="{ width: Math.min((row.totalStock / 500) * 100, 100) + '%' }" 
                   class="h-full rounded-full transition-all duration-700 shadow-sm"
                   :class="row.totalStock < 50 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'">
              </div>
            </div>
          </div>
        </template>

        <template #amountPrice="{ row }">
          <div class="flex flex-col items-end pr-2">
            <span class="text-[13px] font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {{ formatPrice(row.costPrice * row.totalStock) }}
            </span>
            <span class="text-[8px] font-black text-slate-400 uppercase">Jami qiymat</span>
          </div>
        </template>

        <template #actions="{ row }">
          <div class="relative flex justify-center row-action-wrapper">
            <button :id="`trigger-${row._id}`" @click.stop="toggleMenu(row._id)" 
                    class="w-9 h-9 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all active:scale-90 flex items-center justify-center border border-transparent hover:border-indigo-100">
              <i class="fa-solid fa-ellipsis-v text-xs"></i>
            </button>
            <Teleport to="body">
              <transition name="dropdown-pop">
                <div v-if="activeDropdown === row._id" class="fixed z-[9999] w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_70px_rgba(0,0,0,0.15)] border border-slate-200/50 dark:border-slate-700/50 p-2.5" :style="menuStyles">
                  <div class="text-[9px] font-black text-slate-400 px-4 py-2 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 mb-1.5 text-center">Boshqaruv</div>
                  <button v-for="btn in [
                    { label: 'Laboratoriya tahlili', act: 'view', icon: 'fa-flask-vial', col: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
                    { label: 'Tahrirlash', act: 'edit', icon: 'fa-pen-to-square', col: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
                    { label: 'Oʻchirish', act: 'delete', icon: 'fa-trash-can', col: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' }
                  ]" :key="btn.act" @click.stop="handleAction(btn.act, row)" class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all group/item text-left mb-1 last:mb-0">
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

.premium-slide-enter-active { transition: all 0.4s ease-out; }
.premium-slide-enter-from { opacity: 0; transform: translateY(-10px); }

.dropdown-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1.2); }
.dropdown-pop-enter-from { opacity: 0; transform: scale(0.8) translateY(-10px); }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.dark ::-webkit-scrollbar-thumb { background: #334155; }

.premium-search-input :deep(input) {
  @apply h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent 
         focus:ring-4 focus:ring-indigo-500/10 transition-all !important;
}

@media (max-width: 768px) {
  .order-2 { margin-top: 0.25rem; }
}
</style>