<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useToast } from "../../../UI/utils/useToast";

// --- 🟢 UI KOMPONENTLAR ---
import Button from '../../../UI/Button.vue';
import Input from "../../../UI/Input.vue";
import Select from '../../../UI/Select.vue'; 
import ExportDropdown from '../../../UI/ExportDropdown.vue';
import DataTable from "../../../UI/DataTable.vue"; 
import BarcodeScannerModal from "../../../components/BarcodeScaner/scaner.vue";

// --- 🟢 STORE ---
import { SupplyInputboundStore } from "../../../stores/Supply/inbound/inputbound.store.js";

const { toast } = useToast();
const router = useRouter();
const store = SupplyInputboundStore();

/** * 🛠 MUHIM TUZATISH: 
 * 'document' nomini 'inboundDocs' ga o'zgartiramiz. 
 * Bu brauzerning global 'document' obyekti bilan to'qnashuvni oldini oladi.
 */
const { document: inboundDocs, loading } = storeToRefs(store);

// --- 🟢 STATE & FILTERS ---
const searchText = ref('');
const isFilterVisible = ref(false);
const isScannerOpen = ref(false);
const isDateDropdownOpen = ref(false);
const dateDropdownRef = ref(null);
const activeDropdown = ref(null);

const filters = ref({
  counterparty: '',
  branch: '',
  labStatus: '',
  startDate: '',
  endDate: ''
});

// --- 🟢 DINAMIK OPTIONLAR ---
const counterpartyOptions = computed(() => {
  const map = new Map();
  const list = Array.isArray(inboundDocs.value) ? inboundDocs.value : [];
  list.forEach(d => {
    if (d.counterparty) {
      map.set(d.counterparty._id, { label: d.counterparty.fullname, value: d.counterparty._id });
    }
  });
  return Array.from(map.values());
});

const branchOptions = computed(() => {
  const map = new Map();
  const list = Array.isArray(inboundDocs.value) ? inboundDocs.value : [];
  list.forEach(d => {
    if (d.branchId) {
      map.set(d.branchId._id, { label: d.branchId.name, value: d.branchId._id });
    }
  });
  return Array.from(map.values());
});

const labStatusOptions = [
  { label: 'Qabul qilingan', value: 'Accepted', icon: 'fa-solid fa-circle-check text-emerald-500' },
  { label: 'Rad etilgan', value: 'Rejected', icon: 'fa-solid fa-circle-xmark text-rose-500' },
  { label: 'Shartli qabul', value: 'Conditional', icon: 'fa-solid fa-circle-exclamation text-amber-500' }
];

// --- 🟢 FILTRLASH MANTIQI ---
const filteredDocs = computed(() => {
  const list = Array.isArray(inboundDocs.value) ? inboundDocs.value : [];
  return list.filter(doc => {
    const matchesSearch = !searchText.value || 
      doc.code?.toLowerCase().includes(searchText.value.toLowerCase()) ||
      doc.counterparty?.fullname?.toLowerCase().includes(searchText.value.toLowerCase());

    const matchesCounterparty = !filters.value.counterparty || doc.counterparty?._id === filters.value.counterparty;
    const matchesBranch = !filters.value.branch || doc.branchId?._id === filters.value.branch;
    const matchesLab = !filters.value.labStatus || doc.items?.some(i => i.labStatus === filters.value.labStatus);

    let matchesDate = true;
    if (filters.value.startDate || filters.value.endDate) {
      const docDate = new Date(doc.createdAt);
      if (filters.value.startDate && docDate < new Date(filters.value.startDate)) matchesDate = false;
      if (filters.value.endDate) {
        const end = new Date(filters.value.endDate);
        end.setHours(23, 59, 59);
        if (docDate > end) matchesDate = false;
      }
    }
    return matchesSearch && matchesCounterparty && matchesBranch && matchesLab && matchesDate;
  });
});

// --- 🟢 ANALYTIKS ---
const analytics = computed(() => {
  const list = filteredDocs.value;
  let totalSum = 0, rejectedCount = 0, avgFat = 0;
  list.forEach(doc => {
    totalSum += Number(doc.totalAmount || 0);
    if (doc.items?.[0]) {
      avgFat += Number(doc.items[0].fat || 0);
      if (doc.items[0].labStatus === 'Rejected') rejectedCount++;
    }
  });
  return { 
    count: list.length, 
    totalSum, 
    rejectedCount, 
    avgFat: list.length > 0 ? (avgFat / list.length).toFixed(1) : 0 
  };
});

// --- 🟢 METODLAR ---
const formatPrice = (v) => new Intl.NumberFormat('uz-UZ').format(v || 0);
const formatDate = (d) => new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });

const resetFilters = () => {
  filters.value = { counterparty: '', branch: '', labStatus: '', startDate: '', endDate: '' };
};

const handleClickOutsideDate = (event) => {
  if (dateDropdownRef.value && !dateDropdownRef.value.contains(event.target)) {
    isDateDropdownOpen.value = false;
  }
};

onMounted(() => {
  // Endi bu yerda xato bo'lmaydi, chunki 'document' global obyektga ishora qilmoqda
  window.document.addEventListener('click', handleClickOutsideDate);
  store.GetAll();
});

onBeforeUnmount(() => {
  window.document.removeEventListener('click', handleClickOutsideDate);
});

const columns = [
  { key: 'code', label: 'Partiya kodi', width: '140px', fixed: 'left', sortable: true },
  { key: 'author', label: 'Yetkazib beruvchi', width: '220px', sortable: true },
  { key: 'counterparty', label: `Ta'minotchi`, width: '220px', sortable: true },
  { key: 'labAnalysis', label: 'Lab. Tahlili', width: '280px', align: 'center' },
  { key: 'totalAmount', label: 'Summa', width: '160px', align: 'right', sortable: true },
  { key: 'labStatus', label: 'Xulosa', width: '130px', align: 'center' },
  { key: 'actions', label: '', width: '60px', fixed: 'right' }
];
</script>

<template>
  <div class="h-screen flex flex-col p-2 bg-slate-50 dark:bg-[#0F172A] overflow-hidden font-sans">
    
    <header class="flex-none flex items-center justify-between gap-2 mb-2 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-2 flex-1">
        <div class="relative w-full max-w-md group">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs transition-colors group-focus-within:text-indigo-500"></i>
          <input v-model="searchText" placeholder="Lot ID yoki fermer nomi..." class="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
        </div>
        <button @click="isFilterVisible = !isFilterVisible" 
          :class="isFilterVisible ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'"
          class="flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all hover:bg-slate-50">
          <i class="fa-solid fa-filter"></i> Filtrlar
        </button>
      </div>
      <div class="flex items-center gap-2">
        <ExportDropdown @select="store.exportToExcel" />
     <Button 
  variant="primary" 
  size="sm" 
  @click="router.push({ name: 'Kirim' })"
>
  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
  
  <div class="flex items-center gap-3 relative z-10">
    <i class="fa-solid fa-plus text-base md:text-lg group-hover:rotate-12 transition-transform duration-500"></i>
    
    <span class="hidden md:block font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">
      Kirim
    </span>
  </div>
</Button>
      </div>
    </header>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      <div v-for="(card, i) in [
        { label: 'Partiyalar', val: analytics.count, icon: 'fa-boxes-stacked', col: 'text-indigo-600 bg-indigo-50' },
        { label: 'Oʻrtacha Yogʻ', val: analytics.avgFat + '%', icon: 'fa-droplet', col: 'text-blue-600 bg-blue-50' },
        { label: 'Rad etilgan', val: analytics.rejectedCount, icon: 'fa-flask-vial', col: 'text-rose-600 bg-rose-50' },
        { label: 'Jami Summa', val: formatPrice(analytics.totalSum), icon: 'fa-wallet', col: 'text-emerald-600 bg-emerald-50' }
      ]" :key="i" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 transition-all hover:shadow-md">
        <div :class="[card.col, 'w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-black/5']">
          <i :class="['fa-solid', card.icon]"></i>
        </div>
        <div class="min-w-0">
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{{ card.label }}</p>
          <p class="text-sm md:text-base font-black text-slate-800 dark:text-slate-100 truncate tracking-tighter">{{ card.val }}</p>
        </div>
      </div>
    </div>

    <transition name="filter-slide">
      <div v-if="isFilterVisible" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-2 shadow-xl z-20">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
          <div class="lg:col-span-3">
            <label class="filter-label">Yetkazib beruvchi</label>
            <Select v-model="filters.counterparty" :options="counterpartyOptions" placeholder="Fermerni tanlang" searchable clearable />
          </div>
          <div class="lg:col-span-3">
            <label class="filter-label">Qabul qiluvchi filial</label>
            <Select v-model="filters.branch" :options="branchOptions" placeholder="Zavodni tanlang" searchable clearable />
          </div>
          <div class="lg:col-span-3">
            <label class="filter-label">Laboratoriya xulosasi</label>
            <Select v-model="filters.labStatus" :options="labStatusOptions" placeholder="Barchasi" clearable />
          </div>
          <div class="lg:col-span-3 relative" ref="dateDropdownRef">
            <label class="filter-label">Vaqt oralig'i</label>
            <div class="flex items-center gap-2">
              <div @click.stop="isDateDropdownOpen = !isDateDropdownOpen" 
                   class="flex-1 flex items-center justify-between px-4 h-[42px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl cursor-pointer transition-all hover:border-indigo-500">
                <div class="flex items-center gap-2 truncate">
                  <i class="fa-solid fa-calendar-range text-indigo-500 text-xs"></i>
                  <span class="text-[11px] font-bold dark:text-slate-200 truncate">
                    {{ filters.startDate ? `${filters.startDate} — ${filters.endDate || '...'}` : 'Sanani tanlang' }}
                  </span>
                </div>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-400" :class="{'rotate-180': isDateDropdownOpen}"></i>
              </div>
              <button @click="resetFilters" class="w-10 h-[42px] flex items-center justify-center bg-rose-50 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                <i class="fa-solid fa-rotate-left text-xs"></i>
              </button>
            </div>
            <transition name="dropdown-pop">
              <div v-if="isDateDropdownOpen" class="absolute top-full right-0 mt-2 w-full min-w-[280px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] p-4">
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="space-y-1">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Dan</span>
                    <input type="date" v-model="filters.startDate" class="w-full px-2 py-2 text-[11px] font-bold bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-lg outline-none" />
                  </div>
                  <div class="space-y-1">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Gacha</span>
                    <input type="date" v-model="filters.endDate" class="w-full px-2 py-2 text-[11px] font-bold bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-lg outline-none" />
                  </div>
                </div>
                <Button @click="isDateDropdownOpen = false" variant="primary" size="sm" class="w-full !rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">Saralash</Button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </transition>

    <main class="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative">
      <DataTable :items="filteredDocs" :columns="columns" :loading="loading" class="h-full">
        <template #code="{ row }">
          <div class="flex flex-col ml-2 group">
            <span class="font-mono text-[13px] font-black text-indigo-600 dark:text-indigo-400">#{{ row.code }}</span>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{{ formatDate(row.createdAt) }}</span>
          </div>
        </template>
        <template #counterparty="{ row }">
          <div class="flex items-center gap-3 py-1">
            <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700">
              <i class="fa-solid fa-location-arrow"></i>
            </div>
            <div class="flex flex-col min-w-0 text-left">
              <span class="font-bold text-slate-800 dark:text-slate-200 text-[13px] truncate leading-tight">{{ row.counterparty?.fullname || '—' }}</span>
              <span class="text-[10px] text-slate-400 font-medium mt-0.5 tracking-tight">{{ row.counterparty?.type || 'Aloqa yo\'q' }}</span>
              <span class="text-[10px] text-slate-400 font-medium mt-0.5 tracking-tight">{{ row.counterparty?.code || 'Aloqa yo\'q' }}</span>
            </div>
          </div>
        </template>
        <template #author="{ row }">
          <div class="flex items-center gap-3 py-1">
            <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700">
              <i class="fa-solid fa-location-arrow"></i>
            </div>
            <div class="flex flex-col min-w-0 text-left">
              <span class="font-bold text-slate-800 dark:text-slate-200 text-[13px] truncate leading-tight">{{ row.counterparty?.fullname || '—' }}</span>
              <span class="text-[10px] text-slate-400 font-medium mt-0.5 tracking-tight">{{ row.counterparty?.type || 'Aloqa yo\'q' }}</span>
              <span class="text-[10px] text-slate-400 font-medium mt-0.5 tracking-tight">{{ row.counterparty?.code || 'Aloqa yo\'q' }}</span>
            </div>
          </div>
        </template>
        <template #labAnalysis="{ row }">
          <div v-if="row.items?.[0]" class="flex justify-center gap-1.5">
            <div v-for="spec in [
              { val: row.items[0].fat + '%', lbl: 'Yog\'', col: 'text-blue-600 bg-blue-50 border-blue-100' },
              { val: row.items[0].density, lbl: 'Zich', col: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
              { val: row.items[0].acidity + '°', lbl: 'Kisl', col: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
            ]" :key="spec.lbl" :class="[spec.col, 'flex flex-col items-center px-2 py-1 rounded-xl border min-w-[55px] shadow-sm transition-transform hover:scale-105']">
              <span class="text-[11px] font-black">{{ spec.val }}</span>
              <span class="text-[7px] font-bold uppercase tracking-tighter opacity-60">{{ spec.lbl }}</span>
            </div>
          </div>
        </template>
        <template #totalAmount="{ row }">
          <div class="flex flex-col items-end pr-4">
            <span class="font-mono font-black text-slate-900 dark:text-white text-[14px] tracking-tighter">{{ formatPrice(row.totalAmount) }}</span>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">UZS</span>
          </div>
        </template>
        <template #labStatus="{ row }">
          <div class="flex justify-center">
            <div :class="{
              'bg-emerald-50 text-emerald-700 border-emerald-100': row.items[0]?.labStatus === 'Accepted',
              'bg-rose-50 text-rose-700 border-rose-100': row.items[0]?.labStatus === 'Rejected',
              'bg-amber-50 text-amber-700 border-amber-100': row.items[0]?.labStatus === 'Conditional'
            }" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm transition-all">
              <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              {{ row.items[0]?.labStatus || 'Noma\'lum' }}
            </div>
          </div>
        </template>
        <template #actions="{ row }">
          <div class="flex justify-center">
            <button @click.stop="activeDropdown = activeDropdown === row._id ? null : row._id" 
                    class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-indigo-600">
              <i class="fa-solid fa-ellipsis-vertical text-[14px]"></i>
            </button>
          </div>
        </template>
      </DataTable>
    </main>
  </div>
</template>

<style scoped>
.filter-label { @apply text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center; }
.filter-slide-enter-active, .filter-slide-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); max-height: 500px; }
.filter-slide-enter-from, .filter-slide-leave-to { max-height: 0; opacity: 0; transform: translateY(-10px); overflow: hidden; }
.dropdown-pop-enter-active, .dropdown-pop-leave-active { transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
.dropdown-pop-enter-from, .dropdown-pop-leave-to { opacity: 0; transform: translateY(-10px) scale(0.95); }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>