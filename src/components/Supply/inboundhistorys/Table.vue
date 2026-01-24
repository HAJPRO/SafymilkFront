<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import debounce from "lodash/debounce";
import { useToast } from "../../../UI/utils/useToast";

// --- 🟢 UI KOMPONENTLAR ---
import Button from '../../../UI/Button.vue';
import Select from '../../../UI/Select.vue'; 
import ExportDropdown from '../../../UI/ExportDropdown.vue';
import DataTable from "../../../UI/DataTable.vue"; 
import ActionMenu from '../../../UI/ActionMenu.vue';
import LaboratoryModal from "./LaboratoryModal.vue";

// --- 🟢 STORE ---
import { SupplyInputboundStore } from "../../../stores/Supply/inbound/inputbound.store";

const { toast } = useToast();
const router = useRouter();
const store = SupplyInputboundStore();

// Store-dan ma'lumotlarni olish
const { document: inboundDocs, loading } = storeToRefs(store);

// --- 🟢 STATE & FILTERS ---
const searchText = ref('');
const isFilterVisible = ref(false);
const isDateDropdownOpen = ref(false);
const dateDropdownRef = ref(null);
const selectedIds = ref([]); 
const isLabModalOpen = ref(false);

// Pagination State
const page = ref(1);
const limit = ref(15);

const filters = reactive({
  counterparty: '',
  branch: '',
  labStatus: '',
  startDate: '',
  endDate: ''
});

// --- 🟢 SERVERGA SO'ROV YUBORISH ---
const fetchInbounds = () => {
  const params = {
    page: page.value,
    limit: limit.value,
    search: searchText.value,
    ...filters
  };
  Object.keys(params).forEach(k => !params[k] && delete params[k]);
  store.GetAll(params);
};

// --- 🟢 WATCHERS ---
watch([filters, page, limit], () => fetchInbounds(), { deep: true });
watch(searchText, debounce(() => { page.value = 1; fetchInbounds(); }, 500));

// --- 🟢 DATA HANDLING ---
const docsList = computed(() => {
  if (!inboundDocs.value) return [];
  if (inboundDocs.value.docs && Array.isArray(inboundDocs.value.docs)) return inboundDocs.value.docs;
  return Array.isArray(inboundDocs.value) ? inboundDocs.value : [];
});

// Modal uchun tanlangan obyektlarni ajratib olish
const selectedDocsForModal = computed(() => {
  return docsList.value.filter(d => selectedIds.value.includes(d._id));
});

// --- 🟢 DINAMIK OPTIONLAR ---
const counterpartyOptions = computed(() => {
  const map = new Map();
  docsList.value.forEach(d => { 
    if (d.counterparty) map.set(d.counterparty._id, { label: d.counterparty.fullname, value: d.counterparty._id }); 
  });
  return Array.from(map.values());
});

const branchOptions = computed(() => {
  const map = new Map();
  docsList.value.forEach(d => { 
    if (d.branchId) map.set(d.branchId._id, { label: d.branchId.name, value: d.branchId._id }); 
  });
  return Array.from(map.values());
});

const labStatusOptions = [
  { label: 'Qabul qilingan', value: 'Accepted' },
  { label: 'Rad etilgan', value: 'Rejected' },
  { label: 'Shartli qabul', value: 'Conditional' }
];

// --- 🟢 ANALYTIKS ---
const analytics = computed(() => {
  const list = docsList.value;
  let totalSum = 0, rejectedCount = 0, avgFat = 0;
  
  list.forEach(doc => {
    totalSum += Number(doc.totalAmount || 0);
    if (doc.items?.[0]) {
      avgFat += Number(doc.items[0].fat || 0);
      if (doc.items.some(i => i.labStatus === 'Rejected')) rejectedCount++;
    }
  });
  
  return { 
    count: inboundDocs.value?.totalDocs || list.length, 
    totalSum, 
    rejectedCount,
    avgFat: list.length > 0 ? (avgFat / list.length).toFixed(1) : 0 
  };
});

// --- 🟢 METODLAR ---
const formatPrice = (v) => new Intl.NumberFormat('uz-UZ').format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const resetFilters = () => {
  Object.assign(filters, { counterparty: '', branch: '', labStatus: '', startDate: '', endDate: '' });
  searchText.value = '';
  page.value = 1;
};

const getMenuItems = (row) => [
  { label: 'Lab. Tahlili', icon: 'fa-solid fa-flask-vial', onClick: () => { selectedIds.value = [row._id]; isLabModalOpen.value = true; } },
  { label: 'Tahrirlash', icon: 'fa-solid fa-pen-to-square', onClick: () => console.log("Edit", row._id) },
  { label: "O'chirish", icon: 'fa-solid fa-trash-can', variant: 'danger', onClick: () => console.log("Delete", row._id) }
];

const handleClickOutside = (event) => {
  if (dateDropdownRef.value && !dateDropdownRef.value.contains(event.target)) isDateDropdownOpen.value = false;
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
  fetchInbounds();
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});

const columns = [
  { key: 'checkbox', label: '', width: '50px', fixed: 'left' },
  { key: 'code', label: 'Partiya kodi', width: '150px', fixed: 'left', sortable: true },
  { key: 'author', label: 'Yetkazib beruvchi', width: '220px' },
  { key: 'receivedBy', label: 'Mas\'ul shaxs', width: '200px' },
  { key: 'items', label: 'Mahsulotlar', width: '320px', align: 'center' },
  { key: 'totalAmount', label: 'Summa', width: '160px', align: 'right', sortable: true },
  { key: 'labStatus', label: 'Holat', width: '140px', align: 'center' },
  { key: 'actions', label: '', width: '60px', fixed: 'right' }
];
</script>

<template>
  <div class="h-screen flex flex-col p-3 bg-transparent overflow-hidden font-sans">
    
    <LaboratoryModal 
      :isOpen="isLabModalOpen"
      :selected-items="selectedDocsForModal"
      @update:isOpen="isLabModalOpen = $event"
      @confirm="() => { fetchInbounds(); selectedIds = []; }"
    />

    <header class="flex-none flex items-center justify-between gap-3 mb-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-3 flex-1">
        <div class="relative w-full max-w-md group">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs transition-colors group-focus-within:text-indigo-500"></i>
          <input v-model="searchText" placeholder="Qidiruv..." class="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
        </div>
        
     <Button 
      @click="isFilterVisible = !isFilterVisible" 
      :variant="isFilterVisible ? 'primary' : 'secondary'"
      size="sm"
    >
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-sliders text-xs transition-transform duration-500" :class="isFilterVisible ? 'rotate-180' : 'group-hover:rotate-12'"></i>
        <span class="hidden md:block font-black text-[10px] uppercase tracking-[0.15em]">Filtrlar</span>
      </div>

      <span 
        v-if="Object.values(filters).some(v => v)" 
        class="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-bounce"
      >
        {{ Object.values(filters).filter(v => v).length }}
      </span>
    </Button>

      <transition name="dropdown-pop">
  <Button 
    v-if="selectedIds.length > 0" 
    @click="isLabModalOpen = true" 
    variant="primary" 
    size="sm"
  >
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    
    <div class="flex items-center gap-2.5 relative z-10">
      <i class="fa-solid fa-flask-vial text-base group-hover:rotate-12 transition-transform duration-300"></i>
      
      <div class="flex items-center gap-1">
        <span class="text-sm font-black tracking-tighter">{{ selectedIds.length }}</span>
      </div>
    </div>
  </Button>
</transition>
      </div>

      <div class="flex items-center gap-2">
        <ExportDropdown @select="store.exportToExcel" label="Excel" icon="fa-solid fa-file-excel" />
        <!-- <Button variant="primary" @click="router.push({ name: 'Kirim' })" size="sm" left-icon="fa-solid fa-plus"></Button> -->
      </div>
    </header>

    <transition name="filter-slide">
      <div v-if="isFilterVisible" class="flex-none mb-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-end">
            
            <div class="lg:col-span-3 space-y-2">
              <label class="filter-label"><i class="fa-solid fa-truck-field mr-2 text-indigo-500"></i>Ta'minotchi</label>
              <Select v-model="filters.counterparty" :options="counterpartyOptions" placeholder="Barchasi" searchable clearable class="!rounded-xl" />
            </div>

            <div class="lg:col-span-3 space-y-2">
              <label class="filter-label"><i class="fa-solid fa-building-user mr-2 text-blue-500"></i>Filial</label>
              <Select v-model="filters.branch" :options="branchOptions" placeholder="Barchasi" searchable clearable class="!rounded-xl" />
            </div>

            <div class="lg:col-span-2 space-y-2">
              <label class="filter-label"><i class="fa-solid fa-microscope mr-2 text-emerald-500"></i>Xulosa</label>
              <Select v-model="filters.labStatus" :options="labStatusOptions" placeholder="Barchasi" clearable class="!rounded-xl" />
            </div>

            <div class="lg:col-span-3 space-y-2 relative" ref="dateDropdownRef">
              <label class="filter-label"><i class="fa-solid fa-calendar-range mr-2 text-rose-500"></i>Vaqt oralig'i</label>
              <div @click.stop="isDateDropdownOpen = !isDateDropdownOpen" 
                class="flex items-center justify-between px-4 h-[42px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl cursor-pointer transition-all hover:border-indigo-500">
                <div class="flex items-center gap-2 truncate">
                  <span class="text-[11px] font-bold dark:text-slate-200">
                    {{ filters.startDate ? `${filters.startDate} — ${filters.endDate || '...'}` : 'Sanani tanlang' }}
                  </span>
                </div>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform" :class="{'rotate-180': isDateDropdownOpen}"></i>
              </div>

              <transition name="dropdown-pop">
                <div v-if="isDateDropdownOpen" class="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 p-4 ring-1 ring-black/5">
                  <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="space-y-1.5">
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dan</span>
                      <input type="date" v-model="filters.startDate" class="filter-date-input" />
                    </div>
                    <div class="space-y-1.5">
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gacha</span>
                      <input type="date" v-model="filters.endDate" class="filter-date-input" />
                    </div>
                  </div>
                  <Button @click="isDateDropdownOpen = false" variant="primary" size="sm" class="w-full !rounded-xl text-[10px] font-black uppercase tracking-widest">Saralash</Button>
                </div>
              </transition>
            </div>

            <div class="lg:col-span-1">
              <button @click="resetFilters" class="w-full h-[42px] flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 dark:border-rose-500/20">
                <i class="fa-solid fa-rotate-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="isFilterVisible" class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div v-for="(card, i) in [
        { label: 'Jami Partiyalar', val: analytics.count, icon: 'fa-boxes-stacked', col: 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10' },
        { label: 'Oʻrtacha Yogʻ', val: analytics.avgFat + '%', icon: 'fa-droplet', col: 'text-blue-600 bg-blue-50/50 dark:bg-blue-500/10' },
        { label: 'Rad etilgan', val: analytics.rejectedCount, icon: 'fa-flask-vial', col: 'text-rose-600 bg-rose-50/50 dark:bg-rose-500/10' },
        { label: 'Jami Summa', val: formatPrice(analytics.totalSum), icon: 'fa-wallet', col: 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/10' }
      ]" :key="i" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-all">
        <div :class="[card.col, 'w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white dark:border-slate-700/50']"><i :class="['fa-solid', card.icon]"></i></div>
        <div class="min-w-0">
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{{ card.label }}</p>
          <p class="text-sm md:text-lg font-black text-slate-800 dark:text-slate-100 truncate tracking-tight">{{ card.val }}</p>
        </div>
      </div>
    </div>

    <main class="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative flex flex-col transition-all duration-500">
      <DataTable :items="docsList" 
        :columns="columns" 
        :loading="loading"
        :total-items="totalDocsCount" 
        :items-per-page="limit"
        @page-change="(p) => page = p"
        @size-change="(s) => { limit = s; page = 1; }"
          class="flex-1">
        
        <template #checkbox="{ row }">
          <div class="flex items-center justify-center h-full relative group">
            <div v-if="row.status === 'Completed'" class="relative flex items-center justify-center">
              <input type="checkbox" v-model="selectedIds" :value="row._id" class="peer w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-indigo-600 bg-white dark:bg-slate-800 cursor-pointer transition-all appearance-none z-10 checked:border-indigo-600">
              <i class="fa-solid fa-check absolute text-[10px] text-white scale-0 peer-checked:scale-100 transition-transform z-20 pointer-events-none"></i>
            </div>
            <div v-else class="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800/50 group/lock">
              <i class="fa-solid fa-shield-halved text-[11px] text-slate-300"></i>
            </div>
          </div>
        </template>

        <template #code="{ row }">
          <div class="flex flex-col ml-2 group">
            <span class="font-mono text-[13px] font-black text-indigo-600 dark:text-indigo-400">#{{ row.code }}</span>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{{ formatDate(row.createdAt) }}</span>
          </div>
        </template>

        <template #author="{ row }">
          <div class="flex items-center gap-3 py-1">
            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm"><i class="fa-solid fa-user"></i></div>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-slate-800 dark:text-slate-200 text-[13px] truncate leading-tight">{{ row.counterparty?.fullname || '—' }}</span>
              <span class="text-[10px] text-slate-400 font-medium mt-0.5 tracking-tight">{{ row.branchId?.name || 'Filial' }}</span>
            </div>
          </div>
        </template>
         <template #receivedBy="{ row }">
          <div class="flex items-center gap-3 py-1">
            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm"><i class="fa-solid fa-user"></i></div>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-slate-800 dark:text-slate-200 text-[13px] truncate leading-tight">{{ row.receivedBy?.fullname || '—' }}</span>
              <span class="text-[10px] text-slate-400 font-medium mt-0.5 tracking-tight">{{ row.branchId?.name || 'Filial' }}</span>
            </div>
          </div>
        </template>

  <template #items="{ row }">
  <div v-if="row.items?.length" class="flex flex-col gap-2 py-1 px-1 max-h-[200px] overflow-y-auto custom-scroll pr-2">
    <div 
      v-for="(item, idx) in row.items" 
      :key="item._id || idx" 
      class="group relative bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-xl p-2 transition-all duration-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:shadow-indigo-500/5"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-500 shadow-sm transition-colors group-hover:bg-indigo-500 group-hover:text-white">
              <i class="fa-solid fa-box-open text-xs"></i>
            </div>
            <div class="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[8px] font-black flex items-center justify-center border border-white dark:border-slate-900 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-400 transition-all">
              {{ idx + 1 }}
            </div>
          </div>
          
          <div class="flex flex-col min-w-0">
            <span class="text-[12px] font-black text-slate-700 dark:text-slate-100 uppercase tracking-tight leading-none mb-1.5 truncate">
              {{ item.name }}
            </span>
            <div class="flex items-center gap-2">
               <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatPrice(item.costPrice) }} <span class="text-[8px] opacity-70">so'm</span>
              </span>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col items-end shrink-0 ml-4">
          <div class="flex items-baseline gap-1">
            <span class="text-[14px] font-black text-slate-900 dark:text-white">{{ item.qty }}</span>
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{{ item.unit }}</span>
          </div>
          <div 
            v-if="item.labStatus"
            :class="{
              'text-emerald-500': item.labStatus === 'Accepted',
              'text-rose-500': item.labStatus === 'Rejected',
              'text-amber-500': item.labStatus === 'Conditional'
            }"
            class="text-[8px] font-black uppercase tracking-widest mt-0.5 flex items-center gap-1"
          >
            <i class="fa-solid fa-circle text-[4px]"></i>
            {{ item.labStatus }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col items-center justify-center py-6 opacity-40">
    <i class="fa-solid fa-box-archive text-2xl mb-2"></i>
    <span class="text-[10px] font-bold uppercase tracking-[0.2em]">Bo'sh</span>
  </div>
</template>

      <template #totalAmount="{ row }">
  <div class="flex flex-col items-end pr-4 group/amount">
    <div class="flex items-center gap-1.5">
      <span 
        class="font-mono font-black text-[15px] tracking-tighter transition-colors duration-300"
        :class="row.totalAmount > 0 ? 'text-slate-900 dark:text-white group-hover/amount:text-indigo-600' : 'text-slate-400'"
      >
        {{ formatPrice(row.totalAmount) }}
      </span>
      
      <span class="text-[10px] font-black text-indigo-500/50 dark:text-indigo-400/30 group-hover/amount:text-indigo-500 transition-colors">
        <i class="fa-solid fa-mulla"></i> </span>
    </div>

    <div class="flex items-center gap-1 mt-1">
      <span class="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" v-if="row.totalAmount > 0"></span>
      <span class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        UZS <span class="text-[8px] opacity-50 ml-0.5 font-bold">VALYUTA</span>
      </span>
    </div>
  </div>
</template>

        <template #labStatus="{ row }">
          <div class="flex justify-center">
            <div :class="{
              'bg-emerald-50 text-emerald-700 border-emerald-100': row.items?.[0]?.labStatus === 'Accepted',
              'bg-rose-50 text-rose-700 border-rose-100': row.items?.[0]?.labStatus === 'Rejected',
              'bg-amber-50 text-amber-700 border-amber-100': row.items?.[0]?.labStatus === 'Conditional',
              'bg-slate-50 text-slate-500': !row.items?.[0]?.labStatus
            }" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              {{ row.items?.[0]?.labStatus || 'Pending' }}
            </div>
          </div>
        </template>

        <template #actions="{ row }">
          <ActionMenu :row-id="row._id" :items="getMenuItems(row)" />
        </template>
      </DataTable>

    
    </main>
  </div>
</template>

<style scoped>
/* Scrollbar va Animatsiyalar (Siz yozganingizdek) */
.custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.1); border-radius: 10px; }
.custom-scroll:hover::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); }

.filter-label { @apply text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 flex items-center; }
.filter-date-input { @apply w-full px-2 py-2 text-[11px] font-bold bg-slate-50 dark:bg-slate-900 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all; }

.filter-slide-enter-active, .filter-slide-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); max-height: 500px; }
.filter-slide-enter-from, .filter-slide-leave-to { max-height: 0; opacity: 0; transform: translateY(-20px); overflow: hidden; }

.dropdown-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dropdown-pop-enter-from { opacity: 0; transform: scale(0.9) translateY(10px); }
</style>