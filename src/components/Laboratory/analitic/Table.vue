<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useToast } from "../../../UI/utils/useToast";

// --- 🟢 UI KOMPONENTLAR ---
import Button from '../../../UI/Button.vue';
import Select from '../../../UI/Select.vue'; 
import ExportDropdown from '../../../UI/ExportDropdown.vue';
import DataTable from "../../../UI/DataTable.vue"; 
import ActionMenu from '../../../UI/ActionMenu.vue';

// --- 🔵 MODAL KOMPONENTI (Siz yaratgan detal ko'rinishi) ---
import DetailModal from "./DetailModal.vue"; 

// --- 🟢 STORE ---
import { LaboaratoryAnaliticStore } from "../../../stores/Laboratory/analitic/analitic.store";

const { toast } = useToast();
const router = useRouter();
const store = LaboaratoryAnaliticStore();

const { analyticsData, loading } = storeToRefs(store);

// --- 🟢 STATE & FILTERS ---
const searchText = ref('');
const isFilterVisible = ref(false);
const isDateDropdownOpen = ref(false);
const dateDropdownRef = ref(null);
const selectedIds = ref([]); 

// Modal uchun state
const isDetailOpen = ref(false);
const selectedAnalysis = ref(null);

const initialFilters = {
  counterparty: '',
  labStatus: '',
  startDate: '',
  endDate: ''
};

const filters = ref({ ...initialFilters });

// --- 🔵 MODALNI OCHISH FUNKSIYASI ---
const openDetail = (row) => {
  selectedAnalysis.value = row;
  isDetailOpen.value = true;
};

// Faol filtrlar soni
const activeFiltersCount = computed(() => {
  return Object.keys(filters.value).filter(key => filters.value[key] !== initialFilters[key]).length;
});

// --- 🟢 STATUS MAPPING ---
const statusMap = {
  'Accepted': { label: 'Qabul qilindi', class: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' },
  'Rejected': { label: 'Rad etildi', class: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400' },
  'Pending': { label: 'Analizda', class: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400' }
};

// --- 🟢 METODLAR ---
const setQuickDate = (range) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (range === 'today') {
    filters.value.startDate = today;
    filters.value.endDate = today;
  } else if (range === 'week') {
    const lastWeek = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
    filters.value.startDate = lastWeek;
    filters.value.endDate = today;
  }
  isDateDropdownOpen.value = false;
};

const resetFilters = () => {
  filters.value = { ...initialFilters };
  searchText.value = '';
};

// --- 🟢 DINAMIK OPTIONLAR ---
const counterpartyOptions = computed(() => {
  const map = new Map();
  analyticsData.value.forEach(d => { 
    const cp = d.inboundBatchIds?.[0]?.counterparty;
    if (cp) {
      const id = typeof cp === 'object' ? cp._id : cp;
      const name = typeof cp === 'object' ? cp.fullname : `Ta'minotchi #${id.slice(-4)}`;
      map.set(id, { label: name, value: id });
    }
  });
  return Array.from(map.values());
});

const labStatusOptions = [
  { label: 'Qabul qilingan', value: 'Accepted' },
  { label: 'Rad etilgan', value: 'Rejected' },
  { label: 'Jarayonda', value: 'Pending' }
];

// --- 🟢 FILTRLASH MANTIQI ---
const filteredDocs = computed(() => {
  return analyticsData.value.filter(doc => {
    const firstBatch = doc.inboundBatchIds?.[0] || {};
    const cpName = firstBatch.counterparty?.fullname || '';
    const batchCode = firstBatch.code || '';

    const matchesSearch = !searchText.value || 
      batchCode.toLowerCase().includes(searchText.value.toLowerCase()) ||
      cpName.toLowerCase().includes(searchText.value.toLowerCase());
    
    const cpId = typeof firstBatch.counterparty === 'object' ? firstBatch.counterparty._id : firstBatch.counterparty;
    const matchesCounterparty = !filters.value.counterparty || cpId === filters.value.counterparty;
    const matchesLab = !filters.value.labStatus || doc.status === filters.value.labStatus;

    let matchesDate = true;
    if (filters.value.startDate || filters.value.endDate) {
      const docDate = new Date(doc.createdAt).setHours(0,0,0,0);
      if (filters.value.startDate && docDate < new Date(filters.value.startDate).setHours(0,0,0,0)) matchesDate = false;
      if (filters.value.endDate && docDate > new Date(filters.value.endDate).setHours(0,0,0,0)) matchesDate = false;
    }
    return matchesSearch && matchesCounterparty && matchesLab && matchesDate;
  });
});

const analytics = computed(() => {
  const list = filteredDocs.value;
  let totalVolume = 0, rejectedCount = 0, totalFat = 0;
  list.forEach(doc => {
    doc.inboundBatchIds?.forEach(batch => {
      batch.items?.forEach(item => totalVolume += Number(item.qty || 0));
    });
    totalFat += Number(doc.results?.fat || 0);
    if (doc.status === 'Rejected') rejectedCount++;
  });
  return { 
    count: list.length, 
    totalVolume: totalVolume.toLocaleString(), 
    rejectedCount, 
    avgFat: list.length > 0 ? (totalFat / list.length).toFixed(1) : 0 
  };
});

const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }) : '—';

const getMenuItems = (row) => [
  { label: 'Batafsil ko\'rish', icon: 'fa-solid fa-eye', onClick: () => openDetail(row) },
  { label: 'Tahrirlash', icon: 'fa-solid fa-pen-to-square', onClick: () => router.push(`/laboratory/edit/${row._id}`) },
  { label: "O'chirish", icon: 'fa-solid fa-trash-can', variant: 'danger', onClick: () => store.Delete(row._id) }
];

const handleClickOutside = (event) => {
  if (dateDropdownRef.value && !dateDropdownRef.value.contains(event.target)) isDateDropdownOpen.value = false;
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
  store.GetAll(); 
});

onBeforeUnmount(() => window.removeEventListener('click', handleClickOutside));

const columns = [
  { key: 'checkbox', label: '', width: '50px', fixed: 'left' },
  { key: 'code', label: 'Tahlil ID / Sana', width: '160px', fixed: 'left', sortable: true },
  { key: 'counterparty', label: 'Asosiy Ta\'minotchi', width: '220px', sortable: true },
  { key: 'labResults', label: 'Laboratoriya Natijalari', width: '300px', align: 'center' },
  { key: 'volume', label: 'Hajm (Litr)', width: '130px', align: 'right' },
  { key: 'status', label: 'Status', width: '140px', align: 'center' },
  { key: 'actions', label: '', width: '60px', fixed: 'right' }
];
</script>

<template>
  <div class="h-screen flex flex-col p-3 bg-slate-50/50 dark:bg-[#0b1120] overflow-hidden font-sans transition-all duration-500">
    
    <header class="flex-none flex items-center justify-between gap-3 mb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
      <div class="flex items-center gap-3 flex-1">
        <div class="relative w-full max-w-md group">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-indigo-500"></i>
          <input v-model="searchText" placeholder="Batch kodi yoki ta'minotchi..." class="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
        </div>
        
        <Button @click="isFilterVisible = !isFilterVisible" :variant="(isFilterVisible || activeFiltersCount > 0) ? 'primary' : 'secondary'" size="sm" class="relative">
          <i class="fa-solid fa-sliders mr-2"></i>
          <span class="hidden md:inline">Saralash</span>
          <span v-if="activeFiltersCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center border border-white">{{ activeFiltersCount }}</span>
        </Button>
      </div>

      <div class="flex items-center gap-2">
        <ExportDropdown @select="store.exportToExcel" label="Excel" icon="fa-solid fa-file-excel" />
      </div>
    </header>

    <transition name="filter-slide">
      <div v-if="isFilterVisible" class="flex-none mb-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/5">
          <div class="flex items-center justify-between mb-3 px-1">
             <span class="text-[11px] font-black uppercase text-indigo-600 tracking-wider">Filtrlar paneli</span>
             <button @click="resetFilters" class="text-[10px] font-bold text-rose-500 hover:underline">Filtrlarni tozalash</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-end">
            <div class="lg:col-span-4 space-y-2">
              <label class="filter-label">Ta'minotchi</label>
              <Select v-model="filters.counterparty" :options="counterpartyOptions" placeholder="Barchasi" searchable clearable />
            </div>
            <div class="lg:col-span-3 space-y-2">
              <label class="filter-label">Analiz Holati</label>
              <Select v-model="filters.labStatus" :options="labStatusOptions" placeholder="Barchasi" clearable />
            </div>
            <div class="lg:col-span-5 space-y-2 relative" ref="dateDropdownRef">
              <label class="filter-label">Sana oralig'i</label>
              <div class="flex gap-2">
                <div @click.stop="isDateDropdownOpen = !isDateDropdownOpen" class="flex-1 flex items-center justify-between px-4 h-[42px] bg-slate-50 dark:bg-slate-800 border rounded-xl cursor-pointer">
                  <span class="text-[11px] font-bold">{{ filters.startDate || '...' }} — {{ filters.endDate || '...' }}</span>
                  <i class="fa-solid fa-calendar text-slate-400"></i>
                </div>
                <div class="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                  <button @click="setQuickDate('today')" class="px-2 text-[9px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all">Bugun</button>
                  <button @click="setQuickDate('week')" class="px-2 text-[9px] font-black uppercase hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all">Hafta</button>
                </div>
              </div>
              <transition name="dropdown-pop">
                <div v-if="isDateDropdownOpen" class="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 border p-4 rounded-2xl shadow-2xl z-50">
                  <div class="grid grid-cols-2 gap-3 mb-4">
                    <input type="date" v-model="filters.startDate" class="filter-date-input" />
                    <input type="date" v-model="filters.endDate" class="filter-date-input" />
                  </div>
                  <Button @click="isDateDropdownOpen = false" variant="primary" size="sm" class="w-full">Qo'llash</Button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="isFilterVisible" class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div v-for="(card, i) in [
        { label: 'Tahlillar soni', val: analytics.count, icon: 'fa-microscope', col: 'text-indigo-600 bg-indigo-50' },
        { label: 'Oʻrtacha Yogʻ', val: analytics.avgFat + '%', icon: 'fa-droplet', col: 'text-blue-600 bg-blue-50' },
        { label: 'Rad etilgan', val: analytics.rejectedCount, icon: 'fa-xmark-circle', col: 'text-rose-600 bg-rose-50' },
        { label: 'Umumiy Hajm', val: analytics.totalVolume + ' L', icon: 'fa-weight-hanging', col: 'text-emerald-600 bg-emerald-50' }
      ]" :key="i" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-center gap-4 shadow-sm">
        <div :class="[card.col, 'w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm dark:bg-slate-800']"><i :class="['fa-solid', card.icon]"></i></div>
        <div>
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ card.label }}</p>
          <p class="text-lg font-black text-slate-800 dark:text-slate-100">{{ card.val }}</p>
        </div>
      </div>
    </div>

    <main class="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm relative transition-all duration-500">
      <DataTable :items="filteredDocs" :columns="columns" :loading="loading" class="h-full">
        
        <template #checkbox="{ row }">
          <input type="checkbox" v-model="selectedIds" :value="row._id" class="w-5 h-5 rounded-lg border-2 text-indigo-600 bg-white dark:bg-slate-800 cursor-pointer appearance-none checked:bg-indigo-600 checked:border-indigo-600 transition-all">
        </template>

        <template #code="{ row }">
          <div class="flex flex-col ml-2">
            <span class="font-mono text-[13px] font-black text-indigo-600 dark:text-indigo-400 uppercase">#{{ row._id.slice(-6) }}</span>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{{ formatDate(row.createdAt) }}</span>
          </div>
        </template>

        <template #counterparty="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-200 dark:border-white/5"><i class="fa-solid fa-cow"></i></div>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-slate-800 dark:text-slate-200 text-[13px] truncate">
                {{ row.inboundBatchIds?.[0]?.counterparty?.fullname || 'Fermer #' + row._id.slice(-4) }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium tracking-tight">Kodi: {{ row.inboundBatchIds?.[0]?.code || 'Noma\'lum' }}</span>
            </div>
          </div>
        </template>

        <template #labResults="{ row }">
          <div class="flex items-center justify-center gap-1.5 py-1">
            <div v-for="spec in [
              { val: (row.results?.fat || 0) + '%', lbl: 'Yog\'', icon: 'fa-droplet', col: 'text-blue-600 border-blue-100/50' },
              { val: row.results?.density || 0, lbl: 'Zich', icon: 'fa-compass', col: 'text-indigo-600 border-indigo-100/50' },
              { val: (row.results?.acidity || 0) + '°', lbl: 'Kisl', icon: 'fa-vial', col: 'text-emerald-600 border-emerald-100/50' }
            ]" :key="spec.lbl" class="flex flex-col items-center justify-center w-[54px] h-[54px] rounded-xl border bg-slate-50 dark:bg-slate-800/50" :class="spec.col">
              <span class="text-[11px] font-black tracking-tighter">{{ spec.val }}</span>
              <span class="text-[8px] font-bold uppercase opacity-60">{{ spec.lbl }}</span>
            </div>
          </div>
        </template>

        <template #volume="{ row }">
          <div class="flex flex-col items-end pr-4">
            <span class="font-mono font-black text-slate-900 dark:text-white text-[14px] tracking-tighter">
              {{ row.inboundBatchIds?.reduce((acc, b) => acc + b.items.reduce((s, i) => s + i.qty, 0), 0) }}
            </span>
            <span class="text-[9px] font-bold text-slate-400 uppercase">LITR</span>
          </div>
        </template>

        <template #status="{ row }">
          <div class="flex justify-center">
            <div v-if="statusMap[row.status]" :class="statusMap[row.status].class" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              {{ statusMap[row.status].label }}
            </div>
            <div v-else class="text-[10px] text-slate-400 italic">Noma'lum</div>
          </div>
        </template>

        <template #actions="{ row }">
          <ActionMenu :row-id="row._id" :items="getMenuItems(row)" />
        </template>
      </DataTable>
    </main>

    <DetailModal 
      v-model:is-open="isDetailOpen" 
      :data="selectedAnalysis" 
    />

  </div>
</template>

<style scoped>
.filter-label { @apply text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center; }
.filter-date-input { @apply w-full px-2 py-2 text-[11px] font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all; }

.filter-slide-enter-active, .filter-slide-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); max-height: 500px; }
.filter-slide-enter-from, .filter-slide-leave-to { max-height: 0; opacity: 0; transform: translateY(-10px); overflow: hidden; }
.dropdown-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dropdown-pop-enter-from { opacity: 0; transform: scale(0.9) translateY(10px); }
</style>