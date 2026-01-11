<script setup>
import { ref, onMounted, computed, nextTick, inject } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from "../../../UI/utils/useToast";
import { printProductQR } from "../../../utils/printService";
import Swal from 'sweetalert2';

// UI Komponentlar
import Button from '../../../UI/Button.vue';
import Input from "../../../UI/Input.vue";
import ExportDropdown from '../../../UI/ExportDropdown.vue';
import DataTable from "../../../UI/DataTable.vue"; 
import ActionMenu from '../../../UI/ActionMenu.vue';

// Modallar (Xomashyo uchun moslashtirilgan bo'lishi kerak)
// import AddRawMaterialModal from "./AddAccessoryModal.vue";
// import DetailRawMaterialModal from "../../../components/Supply/raw-material/DetailRawMaterialModal.vue";
import BarcodeScannerModal from "../../../components/BarcodeScaner/scaner.vue";

// Store
import {AccessoriesStore } from "../../../stores/Supply/accessories/accessory.store";
import AddAccessoryModal from "./AddAccessoryModal.vue";

const { toast } = useToast();
const store = AccessoriesStore();
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



const confirm = inject('confirm');
const handleAction = async (act, row) => {
  if (act === 'edit') {
    store.openAddModal(row);
  } 
  else if (act === 'delete') {
    const ok = await confirm({
      title: "O'chirishni tasdiqlaysizmi?",
      message: `${row.name} xomashyosini bazadan o'chirish ombor qoldig'iga ta'sir qilishi mumkin.`,
      confirmText: "Ha, O'chirilsin",
      variant: 'danger'
    });
    if (ok) {
      const success = await store.DeleteById(row._id);
    }
  }
};

const getMenuItems = (row) => [
  { 
    label: 'Lab. Tahlili', 
    icon: 'fa-solid fa-flask-vial', 
    onClick: () => { 
      selectedIds.value = [row._id]; 
      isLabModalOpen.value = true; 
    } 
  },
  { 
    label: 'Tahrirlash', 
    icon: 'fa-solid fa-pen-to-square', 
    // handleAction funksiyasini to'g'ridan-to'g'ri chaqiramiz
    onClick: () => handleAction('edit', row) 
  },
  { 
    label: "O'chirish", 
    icon: 'fa-solid fa-trash-can', 
    variant: 'danger', 
    // BU YERDA: 'this' o'chirildi va parametrlar tartibi to'g'rilandi
    onClick: () => handleAction('delete', row)  
  }
];
onMounted(() => {
  store.GetAll();
  window.addEventListener('scroll', () => activeDropdown.value = null, true);
});
</script>

<template>
  <div>
     <AddAccessoryModal/>
  <BarcodeScannerModal v-model="isScannerOpen" @detected="(c) => searchQuery = c" class="z-[210]" />
<RawmaterialModal/>
  <div class="h-screen flex flex-col gap-3 p-3 md:p-5 bg-transparent dark:bg-slate-900 overflow-hidden font-sans relative">
    
    <transition name="premium-slide">
  <div v-if="isStatsVisible" class="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 flex-none z-10 overflow-x-auto no-scrollbar p-4">
    <div v-for="(card, i) in [
      { 
        id: 'all', 
        label: 'Xomashyo turlari', 
        val: analytics.count, 
        unit: 'ta tur',
        icon: 'fa-boxes-stacked', 
        color: 'indigo',
        desc: 'Umumiy katalog hajmi'
      },
      { 
        id: 'volume', 
        label: 'Suyuqlik hajmi', 
        val: analytics.totalVolume, 
        unit: 'Litr',
        icon: 'fa-droplet', 
        color: 'blue',
        desc: 'Sut va suyuq xomashyo'
      },
      { 
        id: 'lowStock', 
        label: 'Kritik qoldiq', 
        val: analytics.lowStockCount, 
        unit: 'pozitsiya',
        icon: 'fa-triangle-exclamation', 
        color: 'rose',
        desc: 'Zaxira 50 tadan kam'
      },
      { 
        id: 'total', 
        label: 'Ombor balansi', 
        val: formatPrice(analytics.totalValue), 
        unit: 'so\'m',
        icon: 'fa-money-bill-trend-up', 
        color: 'emerald',
        desc: 'Jami xarid qiymati'
      }
    ]" :key="i" 
    @click="activeQuickFilter = activeQuickFilter === card.id ? 'all' : card.id"
    class="min-w-[200px] md:min-w-0 group relative cursor-pointer">
      
      <div class="h-full p-5 md:p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:bg-white dark:group-hover:bg-slate-900"
           :class="activeQuickFilter === card.id ? `ring-2 ring-offset-4 dark:ring-offset-slate-950 ring-${card.color}-500 shadow-lg` : ''">
        
        <div class="flex justify-between items-start mb-4">
          <div :class="`bg-${card.color}-50 dark:bg-${card.color}-500/10 text-${card.color}-600 dark:text-${card.color}-400 w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-${card.color}-100 dark:border-${card.color}-500/20`">
            <i :class="['fa-solid', card.icon, 'text-xl']"></i>
          </div>
          
          <div v-if="card.id === 'lowStock' && card.val > 0" class="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
            DIQQAT
          </div>
        </div>

        <h4 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] leading-none mb-2">
          {{ card.label }}
        </h4>
        
        <div class="flex items-baseline gap-1">
          <div class="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
            {{ card.val }}
          </div>
          <span v-if="card.unit && card.id !== 'total'" class="text-[10px] font-bold text-slate-400 lowercase">
            {{ card.unit }}
          </span>
        </div>

        <p class="text-[9px] font-medium text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {{ card.desc }}
        </p>
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
        <button 
          @click="copyToClipboard(row.code)"
          class="flex flex-col text-left group/code focus:outline-none"
          title="Nusxa olish uchun bosing"
        >
          <div class="flex items-center gap-1.5">
            <span class="font-mono text-[12px] font-black text-slate-700 dark:text-slate-200 group-hover/code:text-indigo-600 transition-colors">
              #{{ row.code }}
            </span>
            <i class="fa-solid fa-copy text-[10px] opacity-0 group-hover/code:opacity-100 text-indigo-400 transition-all"></i>
          </div>
          <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">Xarid ID</span>
        </button>
      </template>

      <template #name="{ row }">
        <div class="flex items-center gap-3 py-1.5 text-left group">
          <div class="relative flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center border border-slate-200/60 dark:border-slate-700 shadow-sm transition-all group-hover:shadow-md group-hover:scale-105 overflow-hidden">
              <img 
                v-if="row.image"
                :src="row.image" 
                :alt="row.name" 
                class="w-full h-full object-cover"
                @error="(e) => e.target.src = '/default-placeholder.png'" 
              >
              <div v-else class="flex flex-col items-center">
                <i class="fa-solid fa-box-open text-lg text-slate-400 dark:text-slate-500"></i>
              </div>
            </div>

            <div 
              v-if="row.totalStock < 50" 
              class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center z-10 shadow-sm"
            >
              <i class="fa-solid fa-exclamation text-[8px] text-white animate-pulse"></i>
            </div>
          </div>

          <div class="flex flex-col min-w-0">
            <span class="font-black text-slate-800 dark:text-slate-100 text-[13px] truncate leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
              {{ row.name }}
            </span>
            
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-100/50 dark:border-indigo-500/20 uppercase tracking-wider">
                {{ row.type }}
              </span>
              
              <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 italic">
                / {{ row.unit }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <template #costPrice="{ row }">
        <div class="flex flex-col items-end">
          <div class="flex items-center gap-1">
            <span class="text-[13px] font-black text-slate-800 dark:text-slate-100 tabular-nums">
              {{ formatPrice(row.costPrice) }}
            </span>
          </div>
          <span class="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">Birlik narxi</span>
        </div>
      </template>

      <template #totalStock="{ row }">
        <div class="flex flex-col items-center gap-1.5 min-w-[110px] px-2">
          <div class="flex justify-between w-full items-baseline px-0.5">
            <span class="text-[11px] font-black tabular-nums" :class="row.totalStock < 50 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'">
              {{ row.totalStock.toLocaleString() }}
            </span>
            <span class="text-[8px] font-bold text-slate-400 uppercase">{{ row.unit }}</span>
          </div>
          
          <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <div :style="{ width: Math.min((row.totalStock / 500) * 100, 100) + '%' }" 
                 class="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                 :class="[
                   row.totalStock < 50 ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 
                   row.totalStock < 150 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                   'bg-gradient-to-r from-emerald-600 to-emerald-400'
                 ]">
            </div>
          </div>
        </div>
      </template>

      <template #amountPrice="{ row }">
        <div class="flex flex-col items-end pr-3">
          <div class="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
            <span class="text-[13px] font-black text-emerald-700 dark:text-emerald-400 tabular-nums tracking-tight">
              {{ formatPrice(row.costPrice * row.totalStock) }}
            </span>
          </div>
          <span class="text-[8px] font-black text-slate-400 uppercase mt-1">Balans qiymati</span>
        </div>
      </template>

      <template #qr="{ row }">
        <div v-if="row.qr" class="flex justify-center" @click.stop="printProductQR(row)">
          <button class="relative group p-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all shadow-sm active:scale-90 w-11 h-11 flex items-center justify-center">
            <img :src="row.qr" class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-indigo-600/90 backdrop-blur-[2px] rounded-lg transition-all duration-300">
              <i class="fa-solid fa-print text-white text-[12px]"></i>
            </div>
          </button>
        </div>
      </template>

      <template #actions="{ row }">
        <ActionMenu :row-id="row._id" :items="getMenuItems(row)" />
      </template>
    </DataTable>
    </div>
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