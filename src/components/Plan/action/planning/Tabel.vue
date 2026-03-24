<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useToast } from "../../../../UI/utils/useToast";
import {ActionMenu,DataTable,Select,Button,ExportDropdown} from '../../../../UI/UI';
import {PlanActionPlanningStore} from "../../../../stores/index.store"


// --- 🟢 STORE ---
import { LaboaratoryAnaliticStore } from "../../../../stores/Laboratory/analitic/analitic.store";

const { toast } = useToast();
const router = useRouter();
const store = LaboaratoryAnaliticStore();
const store_plan = PlanActionPlanningStore();

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
  { key: 'totalAmount', label: 'Umumiy Qiymat', width: '200px', align: 'right' }, // Yangi ustun
  { key: 'status', label: 'Status', width: '140px', align: 'center' },
  { key: 'actions', label: '', width: '60px', fixed: 'right' }
];

// Har bir row uchun o'rtacha ko'rsatkichni hisoblovchi yordamchi funksiya
const getPlannedAverage = (batches, field) => {
  if (!batches || batches.length === 0) return 0;
  let totalQty = 0;
  let weightedSum = 0;

  batches.forEach(batch => {
    batch.items?.forEach(item => {
      weightedSum += (item[field] || 0) * (item.qty || 0);
      totalQty += (item.qty || 0);
    });
  });

  return totalQty > 0 ? Number((weightedSum / totalQty).toFixed(2)) : 0;
};
</script>

<template>
  <div class="h-screen flex flex-col p-1 bg-transparent dark:bg-transparent overflow-hidden font-sans transition-all duration-500">
    
    <header class="flex-none flex items-center justify-between gap-3 mb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
      <div class="flex items-center gap-3 flex-1">
        <div class="relative w-full max-w-md group">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-indigo-500"></i>
          <input v-model="searchText" placeholder="Batch kodi yoki ta'minotchi..." class="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
        </div>
        
        <Button @click="isFilterVisible = !isFilterVisible" :variant="(isFilterVisible || activeFiltersCount > 0) ? 'primary' : 'secondary'" size="sm" class="relative">
          <i class="fa-solid fa-sliders mr-2"></i>
          <span v-if="activeFiltersCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center border border-white">{{ activeFiltersCount }}</span>
        </Button>
      </div>

      <div class="flex items-center gap-2">
        <Button @click="store_plan.ActionModal({action:1,title:''})" variant="primary" left-icon="fas fa-plus" size="sm">Rejalashtirish</Button>
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
      <DataTable :items="analyticsData" :columns="columns" :loading="loading" class="h-full">
        
        <template #checkbox="{ row }">
          <input type="checkbox" v-model="selectedIds" :value="row._id" class="w-5 h-5 rounded-lg border-2 text-indigo-600 bg-white dark:bg-slate-800 cursor-pointer appearance-none checked:bg-indigo-600 checked:border-indigo-600 transition-all">
        </template>

    <template #code="{ row }">
  <div class="relative group pl-3 py-2 border-l-2 border-transparent hover:border-indigo-500 transition-all">
    <div class="flex flex-col">
      <div class="flex items-center gap-1.5 mb-1">
        <div class="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <span class="text-[7px] font-black">{{ row.author?.fullname?.[0] || 'S' }}</span>
        </div>
        <span class="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em]">{{ row.author?.fullname || 'System' }}</span>
      </div>
      
      <div class="flex items-baseline gap-2">
        <span class="text-[16px] font-black text-slate-900 dark:text-white font-mono tracking-tighter">
          {{ row.partyNumber || row._id.slice(-5).toUpperCase() }}
        </span>
        <div class="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase">
          Live
        </div>
      </div>
      
      <span class="text-[9px] font-medium text-slate-400 mt-1 italic">
        {{ formatDate(row.createdAt) }}
      </span>
    </div>
  </div>
</template>

   <template #counterparty="{ row }">
  <div class="custom-scroll-container flex flex-col gap-4 py-3 pr-2 max-h-[220px] overflow-y-auto min-w-[380px]">
    
    <div v-for="(batch, bIdx) in row.inboundBatchIds" :key="batch._id" 
         class="group flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
      
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <i class="fa-solid fa-user-tie text-[12px]"></i>
          </div>
          <div class="flex flex-col">
            <span class="text-[13px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none mb-1">
              {{ batch.counterparty?.fullname || 'Noma\'lum Fermer' }}
            </span>
            <span class="text-[9px] font-mono font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/20 uppercase tracking-tighter w-fit">
              {{ batch.code }}
            </span>
          </div>
        </div>
        
        <div class="flex flex-col items-end">
          <span class="text-[13px] font-black text-emerald-600 dark:text-emerald-400 leading-none">
            {{ batch.items?.reduce((sum, item) => sum + (item.qty * item.costPrice), 0).toLocaleString() }}
          </span>
          <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Batch Total (UZS)</span>
        </div>
      </div>

      <div class="grid gap-3">
        <div v-for="item in batch.items" :key="item._id" 
             class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 overflow-hidden">
          
          <div class="flex items-start justify-between mb-3">
            <div class="flex flex-col">
              <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">{{ item.name }}</span>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-[10px] font-bold text-slate-400">{{ item.qty.toLocaleString() }} {{ item.unit }}</span>
                <span class="text-[10px] text-slate-300">×</span>
                <span class="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 rounded">{{ item.costPrice.toLocaleString() }}</span>
              </div>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-[11px] font-black text-slate-900 dark:text-white">
                {{ (item.qty * item.costPrice).toLocaleString() }}
              </span>
              <span class="text-[7px] font-bold text-slate-400 uppercase">Item Total</span>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-1.5">
            <div v-for="metric in [
              { label: 'Yog\'', val: item.fat + '%', color: 'text-blue-600', bg: 'bg-blue-50/50' },
              { label: 'Temp', val: item.temp + '°', color: 'text-orange-500', bg: 'bg-orange-50/50' },
              { label: 'Zich', val: item.density, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
              { label: 'Kisl', val: item.acidity + '°', color: 'text-rose-500', bg: 'bg-rose-50/50' }
            ]" :key="metric.label" 
            :class="[metric.bg, 'flex flex-col items-center py-1 rounded-lg border border-transparent dark:bg-slate-800']">
              <span :class="[metric.color, 'text-[10px] font-black']">{{ metric.val }}</span>
              <span class="text-[7px] font-bold text-slate-400 uppercase">{{ metric.label }}</span>
            </div>
          </div>

          <div v-if="item.labStatus === 'Accepted'" class="mt-2 flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Verified Quality
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<template #labResults="{ row }">
  <div class="flex items-center gap-2 py-2 min-w-[290px]">
    
    <div v-for="spec in [
      { 
        lbl: 'Yog\'', 
        actual: row.results?.fat || 0, 
        planned: getPlannedAverage(row.inboundBatchIds, 'fat'), 
        unit: '%',
        col: 'blue'
      },
      { 
        lbl: 'Zich', 
        actual: row.results?.density || 0, 
        planned: getPlannedAverage(row.inboundBatchIds, 'density'), 
        unit: '',
        col: 'indigo'
      },
      { 
        lbl: 'Kisl', 
        actual: row.results?.acidity || 0, 
        planned: getPlannedAverage(row.inboundBatchIds, 'acidity'), 
        unit: '°',
        col: 'emerald'
      }
    ]" :key="spec.lbl" 
    class="relative flex flex-col items-center justify-between w-[92px] p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md hover:border-indigo-300">
      
      <span class="text-[7px] font-black uppercase text-slate-400 tracking-[0.15em] mb-1.5">{{ spec.lbl }}</span>

      <div class="flex flex-col items-center mb-1">
        <span :class="[
          'text-[15px] font-black tracking-tighter',
          `text-${spec.col}-600 dark:text-${spec.col}-400`
        ]">
          {{ spec.actual }}{{ spec.unit }}
        </span>
      </div>

      <div class="w-full pt-1.5 border-t border-slate-50 dark:border-slate-800/50 flex flex-col items-center">
        <div class="flex items-center gap-1">
          <span class="text-[8px] font-bold text-slate-400">AVG: {{ spec.planned }}</span>
          
          <template v-if="(spec.actual - spec.planned) !== 0">
            <i :class="[
              'fa-solid text-[7px]',
              spec.actual > spec.planned ? 'fa-caret-up text-emerald-500' : 'fa-caret-down text-rose-500'
            ]"></i>
            <span :class="[
              'text-[8px] font-black',
              spec.actual > spec.planned ? 'text-emerald-500' : 'text-rose-500'
            ]">
              {{ Math.abs((spec.actual - spec.planned).toFixed(1)) }}
            </span>
          </template>
          <i v-else class="fa-solid fa-check text-[7px] text-emerald-400"></i>
        </div>
      </div>

      <div v-if="spec.actual < spec.planned" 
           class="absolute -top-1 -right-1 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
      </div>
    </div>

  </div>
</template>

      
<template #totalAmount="{ row }">
  <div class="custom-scroll-container flex flex-col gap-3 py-3 px-1 max-h-[350px] overflow-y-auto overflow-x-hidden w-full max-w-[240px]">
    
    <div class="relative">
      <div class="absolute -top-2 -right-2 w-16 h-16 bg-indigo-500/5 rounded-full blur-2xl -z-10"></div>
      
      <div class="relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 p-3.5 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-700 w-full box-border">
        
        <div class="flex flex-col gap-3.5">
          
          <div class="flex justify-between items-center border-b border-white/5 pb-2.5">
            <div class="flex flex-col min-w-0"> <span class="text-[7px] font-black text-slate-500 uppercase tracking-widest">Umumiy hajm</span>
              <div class="flex items-baseline gap-1 truncate">
                <span class="text-[15px] font-black text-white tracking-tighter">
                  {{ row.inboundBatchIds?.reduce((acc, b) => acc + b.items?.reduce((s, i) => s + i.qty, 0), 0).toLocaleString() }}
                </span>
                <span class="text-[8px] font-bold text-indigo-400 uppercase font-mono tracking-tighter shrink-0">L</span>
              </div>
            </div>
            <div class="w-7 h-7 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10">
              <i class="fa-solid fa-droplet text-indigo-400 text-[10px]"></i>
            </div>
          </div>

          <div class="flex flex-col min-w-0">
            <span class="text-[7px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-0.5">Jami To'lov</span>
            <div class="flex items-baseline gap-1 truncate">
              <span class="text-[20px] font-black text-white tracking-tighter leading-none">
                {{ 
                  row.inboundBatchIds?.reduce((total, batch) => 
                    total + (batch.items?.reduce((sum, item) => sum + (item.qty * item.costPrice), 0) || 0), 0
                  ).toLocaleString() 
                }}
              </span>
              <span class="text-[9px] font-bold text-white/40 uppercase font-mono tracking-tighter shrink-0">uzs</span>
            </div>
          </div>

          <div class="bg-white/5 rounded-xl p-2.5 border border-white/5 w-full box-border">
            <div class="flex justify-between items-center mb-1">
              <span class="text-[7px] font-bold text-slate-500 uppercase">O'rtacha narx</span>
              <i class="fa-solid fa-chart-line text-[8px] text-emerald-400"></i>
            </div>
            <div class="flex items-baseline gap-1 truncate">
              <span class="text-[13px] font-black text-emerald-400 tracking-tight">
                {{ 
                  Math.round(
                    row.inboundBatchIds?.reduce((total, batch) => total + batch.items?.reduce((sum, item) => sum + (item.qty * item.costPrice), 0), 0) /
                    (row.inboundBatchIds?.reduce((acc, b) => acc + b.items?.reduce((s, i) => s + i.qty, 0), 0) || 1)
                  ).toLocaleString() 
                }}
              </span>
              <span class="text-[7px] font-black text-emerald-400/50 uppercase font-mono tracking-tighter shrink-0">uzs/L</span>
            </div>
            
            <div class="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full w-[65%]"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
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

    <!-- <DetailModal 
      v-model:is-open="isDetailOpen" 
      :data="selectedAnalysis" 
    /> -->

  </div>
</template>

<style scoped>
.filter-label { @apply text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1.5 flex items-center; }
.filter-date-input { @apply w-full px-2 py-2 text-[11px] font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all; }

.filter-slide-enter-active, .filter-slide-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); max-height: 500px; }
.filter-slide-enter-from, .filter-slide-leave-to { max-height: 0; opacity: 0; transform: translateY(-10px); overflow: hidden; }
.dropdown-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dropdown-pop-enter-from { opacity: 0; transform: scale(0.9) translateY(10px); }

/* 1. Asosiy konteyner */
.custom-scroll-container {
  /* Firefox uchun */
  scrollbar-width: thin;
  scrollbar-color: rgba(203, 213, 225, 0.4) transparent;
  
  /* Silliq scroll va mobil uchun optimizatsiya */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* 2. Chrome, Edge va Safari uchun (Webkit) */
.custom-scroll-container::-webkit-scrollbar {
  width: 2px; /* Juda ingichka kenglik */
  height: 2px; /* Gorizontal scroll uchun */
}

.custom-scroll-container::-webkit-scrollbar-track {
  background: transparent; /* Yo'lakcha butunlay shaffof */
}

.custom-scroll-container::-webkit-scrollbar-thumb {
  /* Odatiy holatda deyarli ko'rinmaydi */
  background: rgba(203, 213, 225, 0.4); 
  border-radius: 40px;
  transition: background 0.3s ease;
}

/* Dark mode uchun */
.dark .custom-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.5);
}

/* 3. Faqat konteyner ustiga kelganda scrollbar aniqroq ko'rinadi */
.custom-scroll-container:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.8);
}

.dark .custom-scroll-container:hover::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.9);
}

/* 4. Kartochkalar uchun Micro-Interactions */
.group {
  will-change: transform; /* Brauzerni animatsiyaga tayyorlaydi */
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.group:hover {
  transform: translateY(-2px);
  /* Hoverda biroz soya qo'shish professionalroq ko'rinadi */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 
              0 4px 6px -2px rgba(0, 0, 0, 0.02);
}

/* Oxirgi element pastga yopishib qolmasligi uchun */
.custom-scroll-container > div:last-child {
  margin-bottom: 8px;
}
</style>