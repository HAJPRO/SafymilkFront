<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import moment from "moment-timezone";
// Store nomi o'zgardi: Inbound/Supply yo'nalishiga
// import { InboundManagementStore } from "../../../stores/Supply/inbound.store";

// --- UI COMPONENTS ---
import BaseModal from "../../../UI/Modal.vue";
import DataTable from "../../../UI/DataTable.vue";
import Button from "../../../UI/Button.vue";
import Select from "../../../UI/Select.vue";
import Badge from "../../../UI/Badge.vue";
import ExportDropdown from "../../../UI/ExportDropdown.vue";

// const store_inbound = InboundManagementStore();
const { detail_modal, counterpartyInboundsById } = storeToRefs(store_inbound);

const expandedRows = ref([]);
const isFilterVisible = ref(false); 
const isDateDropdownOpen = ref(false);
const dateDropdownRef = ref(null);

const filters = ref({
  collector: '', // Sut yig'uvchi (agent)
  quality: '',   // Sifat darajasi
  startDate: '',
  endDate: ''
});

// --- 🟢 DINAMIK OPTIONS ---
const collectorOptions = computed(() => {
  const map = new Map();
  map.set('all', { label: "Barcha qabul qiluvchilar", value: "" });
  (counterpartyInboundsById.value || []).forEach(s => { 
    if(s.author?._id) map.set(s.author._id, { label: s.author.fullname, value: s.author._id })
  });
  return Array.from(map.values());
});

// --- 🟢 FILTRLASH MANTIQI ---
const filteredInbounds = computed(() => {
  const data = counterpartyInboundsById.value || [];
  return data.filter(item => {
    const matchesCollector = !filters.value.collector || item.author?._id === filters.value.collector;
    let matchesDate = true;
    if (filters.value.startDate || filters.value.endDate) {
      const dateMoment = moment(item.date);
      if (filters.value.startDate && dateMoment.isBefore(moment(filters.value.startDate).startOf('day'))) matchesDate = false;
      if (filters.value.endDate && dateMoment.isAfter(moment(filters.value.endDate).endOf('day'))) matchesDate = false;
    }
    return matchesCollector && matchesDate;
  });
});

// --- 🟢 ANALITIKA (Sut biznesi uchun) ---
const stats = computed(() => {
  const data = filteredInbounds.value;
  const totalLiters = data.reduce((a, b) => a + Number(b.totalQuantity), 0);
  const totalCash = data.reduce((a, b) => a + Number(b.totalAmount), 0);
  return {
    totalLiters,
    totalCash,
    avgFat: data.length > 0 ? (data.reduce((a, b) => a + Number(b.fatContent || 0), 0) / data.length).toFixed(1) : 0,
    count: data.length
  };
});

const formatPrice = (p) => new Intl.NumberFormat("uz-UZ").format(p || 0);

const columns = [
  { key: 'docNumber', label: 'Hujjat №', width: '130px', fixed: 'left' },
  { key: 'author.fullname', label: 'Qabul qildi', width: '200px' },
  { key: 'date', label: 'Sana', width: '150px', align: 'center' },
  { key: 'totalQuantity', label: 'Hajm (Litr)', width: '140px', align: 'right' },
  { key: 'fatContent', label: 'Yog\'lilik %', width: '120px', align: 'center' },
  { key: 'totalAmount', label: 'Jami Summa', width: '160px', align: 'right' },
  { key: 'actions', label: '', width: '60px', align: 'center' }
];
</script>

<template>
  <BaseModal v-model="detail_modal" width="max-w-[98vw]" class="premium-modal">
    
    <template #header>
      <div class="flex items-center justify-between w-full px-4 py-2">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-xl rotate-3">
            <i class="fa-solid fa-truck-ramp-box text-2xl"></i>
          </div>
          <div class="flex flex-col text-left">
            <span class="text-[10px] font-black uppercase text-sky-500 tracking-[0.3em]">Supply Analytics</span>
            <h2 class="text-2xl font-black text-slate-800 dark:text-white uppercase">
              {{ counterpartyInboundsById?.[0]?.supplierId?.fullname || 'Yetkazib beruvchi tarixi' }}
            </h2>
          </div>
        </div>
        <Button @click="detail_modal = false" variant="light" class="!rounded-full !w-11 !h-11">
            <i class="fa-solid fa-xmark"></i>
        </Button>
      </div>
    </template>

    <div class="space-y-6 p-4 bg-[#f8fafc]/50 dark:bg-slate-950/50">
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="stat-card">
          <div class="stat-icon bg-blue-50 text-blue-600"><i class="fa-solid fa-droplet"></i></div>
          <p class="stat-label">Jami Qabul (Litr)</p>
          <h3 class="stat-value">{{ stats.totalLiters.toLocaleString() }} <small>L</small></h3>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-emerald-50 text-emerald-600"><i class="fa-solid fa-money-bill-wave"></i></div>
          <p class="stat-label">Umumiy Hisob-kitob</p>
          <h3 class="stat-value">{{ formatPrice(stats.totalCash) }} <small>sum</small></h3>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-amber-50 text-amber-600"><i class="fa-solid fa-flask-vial"></i></div>
          <p class="stat-label">O'rtacha yog'lilik</p>
          <h3 class="stat-value">{{ stats.avgFat }} <small>%</small></h3>
        </div>

        <div class="stat-card bg-slate-900 text-white">
          <p class="stat-label !text-slate-400">Topshirishlar soni</p>
          <h3 class="stat-value text-white">{{ stats.count }} <small>marta</small></h3>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
        <div class="px-8 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <Button @click="isFilterVisible = !isFilterVisible" :variant="isFilterVisible ? 'primary' : 'light'" class="!rounded-2xl">
            <i class="fa-solid fa-sliders mr-2"></i> Filtr
          </Button>
          <ExportDropdown title="Hisobotni yuklash" />
        </div>

        <transition name="filter-slide">
          <div v-if="isFilterVisible" class="p-8 grid grid-cols-12 gap-6">
            <div class="col-span-4 text-left">
              <label class="form-label">Qabul qiluvchi agent</label>
              <Select v-model="filters.collector" :options="collectorOptions" class="custom-select" />
            </div>
            <div class="col-span-5 text-left">
              <label class="form-label">Sana oralig'i</label>
              <div class="flex gap-2">
                <input type="date" v-model="filters.startDate" class="date-input">
                <input type="date" v-model="filters.endDate" class="date-input">
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden">
        <DataTable :items="filteredInbounds" :columns="columns">
          
          <template #docNumber="{ row }">
            <div class="text-left ml-4">
              <span class="font-black text-slate-900 dark:text-white">#{{ row.docNumber }}</span>
              <p class="text-[9px] text-slate-400">ID: {{ row._id.slice(-6) }}</p>
            </div>
          </template>

          <template #totalQuantity="{ row }">
            <div class="text-right px-4">
              <span class="text-lg font-black text-sky-600">{{ row.totalQuantity }}</span>
              <span class="ml-1 text-xs text-slate-400 font-bold">L</span>
            </div>
          </template>

          <template #fatContent="{ row }">
            <Badge :variant="row.fatContent >= 3.6 ? 'emerald' : 'amber'" outline>
              {{ row.fatContent }}% Yog'
            </Badge>
          </template>

          <template #totalAmount="{ row }">
            <div class="text-right px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
              {{ formatPrice(row.totalAmount) }}
            </div>
          </template>

        </DataTable>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.stat-card { @apply p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg text-left; }
.stat-icon { @apply w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl; }
.stat-label { @apply text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1; }
.stat-value { @apply text-2xl font-black tracking-tighter; }
.stat-value small { @apply text-xs font-medium opacity-50; }

.form-label { @apply text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block; }
.date-input { @apply flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500/20; }

.filter-slide-enter-active, .filter-slide-leave-active { transition: all 0.4s ease; max-height: 200px; overflow: hidden; }
.filter-slide-enter-from, .filter-slide-leave-to { max-height: 0; opacity: 0; }
</style>