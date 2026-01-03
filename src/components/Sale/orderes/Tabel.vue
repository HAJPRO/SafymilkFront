<script setup>
// --- CORE IMPORTS ---
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useToast } from "../../../UI/utils/useToast";
const { toast } = useToast();


// --- STORES ---
import { OrderManagmentStore } from '../../../stores/Sale/orders/orders.store';
import { SaleposManagmentStore } from '../../../stores/Sale/salepos/salepos.store';

// --- UI COMPONENTS ---
import AddOrderModal from './AddOrderModal.vue';
import DataTable from '../../../UI/DataTable.vue';
import Button from '../../../UI/Button.vue';
import Select from '../../../UI/Select.vue'; 
import ExportDropdown from '../../../UI/ExportDropdown.vue';
import Modal from '../../../UI/Modal.vue'; 
import ActionMenu from '../../../UI/ActionMenu.vue'; 

// --- INITIALIZATION ---
const store_orders = OrderManagmentStore();
const store_salepos = SaleposManagmentStore();
const { sales } = storeToRefs(store_salepos);

// --- STATE ---
const searchText = ref('');
const selectedIds = ref([]);
const activeDropdown = ref(null);
const isDetailModalOpen = ref(false);
const selectedOrder = ref(null);

// --- 🟢 FILTRLAR STATE ---
const isFilterVisible = ref(false);
const filters = ref({
  author: '',
  customer: '',
  driver: '',
  startDate: '',
  endDate: '',
  status : ""
});

// --- 🟢 SELECT OPTIONS ---
const authorOptions = computed(() => {
  const map = new Map();
  sales.value.forEach(s => { if(s.author) map.set(s.author._id, { label: s.author.fullname, value: s.author._id })});
  return Array.from(map.values());
});

const customerOptions = computed(() => {
  const map = new Map();
  sales.value.forEach(s => { if(s.customerId) map.set(s.customerId._id, { label: s.customerId.fullname, value: s.customerId._id })});
  return Array.from(map.values());
});
const statusOptions = computed(() => {
  // 1. Barcha mavjud statuslarni yig'ish (takrorlanishlarsiz)
  const uniqueStatuses = [...new Set(sales.value.map(s => s.status))].filter(Boolean);

  // 2. Har bir status uchun UI konfiguratsiyasini (ikonka va h.k.) biriktirish
  const statusConfig = {
    'Yangi': { icon: 'fa-solid fa-star text-emerald-500' },
    'Yetkazib berilmoqda': { icon: 'fa-solid fa-truck-fast text-amber-500' },
    'Yetkazib berildi': { icon: 'fa-solid fa-circle-check text-blue-500' },
    'Bekor qilindi': { icon: 'fa-solid fa-circle-xmark text-rose-500' }
  };

  return uniqueStatuses.map(status => ({
    label: status,
    value: status,
    // Agar konfiguratsiyada bo'lsa ikonkasini qo'shamiz
    icon: statusConfig[status]?.icon || 'fa-solid fa-circle-dot text-slate-400'
  }));
});

const driverOptions = computed(() => {
  const map = new Map();
  sales.value.forEach(s => { if(s.driverId) map.set(s.driverId._id, { label: s.driverId.fullname, value: s.driverId._id })});
  return Array.from(map.values());
});

// --- 🟢 DINAMIK FILTRLASH MANTIQI ---
const filteredSales = computed(() => {
  return sales.value.filter(sale => {
    // 1. Qidiruv matni bo'yicha filtr
    const matchesSearch = !searchText.value || 
      sale.orderNumber.toLowerCase().includes(searchText.value.toLowerCase()) ||
      sale.customerId?.fullname?.toLowerCase().includes(searchText.value.toLowerCase()) ||
      sale.author?.fullname?.toLowerCase().includes(searchText.value.toLowerCase());

    // 2. Select filtrlar (ID bo'yicha)
    const matchesAuthor = !filters.value.author || sale.author?._id === filters.value.author;
    const matchesCustomer = !filters.value.customer || sale.customerId?._id === filters.value.customer;
    const matchesDriver = !filters.value.driver || sale.driverId?._id === filters.value.driver;
    
    // 🟢 3. Status bo'yicha filtr (YANGI)
    const matchesStatus = !filters.value.status || sale.status === filters.value.status;

    // 4. Vaqt oralig'i bo'yicha filtr
    let matchesDate = true;
    if (filters.value.startDate || filters.value.endDate) {
      const saleDate = new Date(sale.date);
      if (filters.value.startDate) {
        const start = new Date(filters.value.startDate);
        if (saleDate < start) matchesDate = false;
      }
      if (filters.value.endDate) {
        const end = new Date(filters.value.endDate);
        end.setHours(23, 59, 59);
        if (saleDate > end) matchesDate = false;
      }
    }

    // Barcha shartlar bajarilishi kerak (AND mantiqi)
    return matchesSearch && 
           matchesAuthor && 
           matchesCustomer && 
           matchesDriver && 
           matchesStatus && // 🟢
           matchesDate;
  });
});

// --- CONFIGURATION ---
const columns = [
  // Buyurtma ustuniga footerLabel qo'shildi
  { key: 'orderNumber', label: 'Buyurtma', width: '130px', fixed: 'left', sortable: true, footerLabel: 'JAMI HISOB:' },
  { key: 'author.fullname', label: 'Sotuvchi', width: '130px', sortable: true },
  { key: 'customerId.fullname', label: 'Mijoz', width: '220px', sortable: true },
  { key: 'driverId.fullname', label: 'Haydovchi', width: '160px' },
  { key: 'paymentType', label: 'To\'lov', width: '110px', align: 'center' },
  { key: 'date', label: 'Vaqt', width: '130px', align: 'center', sortable: true },
  // totalAmount ustunida showSum: true jami summani chiqaradi
  { key: 'totalAmount', label: 'Summa', width: '150px', align: 'right', sortable: true, showSum: true },
  { key: 'status', label: 'Holat', width: '150px', align: 'center' },
  { key: 'actions', label: '', width: '50px', fixed: 'right', align: 'center' }
  
];

const itemColumns = [
  { key: 'name', label: 'Mahsulot nomi' },
  { key: 'quantity', label: 'Miqdor', width: '100px', align: 'center' },
  { key: 'salePrice', label: 'Narx', width: '120px', align: 'right' },
  { key: 'total', label: 'Jami', width: '130px', align: 'right' }
];

const rowActions = [
  { label: "Batafsil", action: 'view', icon: "fa-solid fa-eye", colorClass: "text-indigo-500 bg-indigo-50" },
  { label: "Tahrir", action: 'edit', icon: "fa-solid fa-pen", colorClass: "text-amber-500 bg-amber-50" },
  { label: "O'chirish", action: 'delete', icon: "fa-solid fa-trash", colorClass: "text-rose-500 bg-rose-50" },
];

// --- METHODS ---
const resetFilters = () => {
  filters.value = { author: '', customer: '', driver: '', startDate: '', endDate: '' };
};

const formatDateTime = (date) => {
  if (!date) return { dayMonth: '—', time: '', year: '' };
  const d = new Date(date);
  return {
    dayMonth: d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }),
    year: d.getFullYear(),
    time: d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  };
};

const formatPrice = (p) => new Intl.NumberFormat('uz-UZ').format(p || 0);

const handleAction = ({action, row}) => {
  activeDropdown.value = null;
  if (action === 'view') {
    selectedOrder.value = row;
    isDetailModalOpen.value = true;
  }
};

const getStatusBadge = (status) => {
  const styles = {
    'Yangi': 'text-emerald-600 bg-emerald-50 border-emerald-100',
    'Yetkazib berilmoqda': 'text-amber-600 bg-amber-50 border-amber-100',
    'Yetkazib berildi': 'text-blue-600 bg-blue-50 border-blue-100',
    'Bekor qilindi': 'text-rose-600 bg-rose-50 border-rose-100',
  };
  return styles[status] || 'text-slate-500 bg-slate-50 border-slate-100';
};
const handleExport = (type) => {
  store_salepos.handleExcelExport({payload : filteredSales.value });
  // toast.success(`Sotuvlar (${type}) tayyorlanmoqda...`);
};
const isDateDropdownOpen = ref(false);
const dateDropdownRef = ref(null);

// Tashqariga bosilganda yopish
const handleClickOutsideDate = (event) => {
  if (dateDropdownRef.value && !dateDropdownRef.value.contains(event.target)) {
    isDateDropdownOpen.value = false;
  }
};

// Funksiyalar
const editRow = (id) => console.log("Tahrirlash:", id);
const deleteRow = (id) => console.log("O'chirish:", id);
const startLab = (id) => console.log("Lab tahlili:", id);

// Menyu elementlarini shakllantirish funksiyasi
const getMenuItems = (row) => [
  { 
    label: 'Batafsil', 
    icon: 'fa-solid fa-info', 
    onClick: () => handleAction({action:'view',row}) 
  },
  { 
    label: 'Tahrirlash', 
    icon: 'fa-solid fa-pen-to-square', 
    onClick: () => editRow(row._id) 
  },
  { 
    label: "O'chirish", 
    icon: 'fa-solid fa-trash-can', 
    variant: 'danger', 
    onClick: () => deleteRow(row._id) 
  }
];
onMounted(() => document.addEventListener('click', handleClickOutsideDate));
onMounted(() => store_salepos.GetAll());
</script>

<template>
  <AddOrderModal />
  
  <div class="h-screen flex flex-col p-2 bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
    
    <header class="flex-none flex items-center justify-between gap-2 mb-2 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <div class="relative w-80 group">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs transition-colors group-focus-within:text-indigo-500"></i>
          <input v-model="searchText" placeholder="ID yoki Ism bo'yicha qidiruv..." class="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
        </div>
        <button @click="isFilterVisible = !isFilterVisible" 
          :class="isFilterVisible ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-600 border-slate-200'"
          class="flex items-center gap-2 px-4 py-3 border rounded-xl text-xs font-bold transition-all hover:bg-slate-50">
          <i class="fa-solid fa-filter"></i> 
        </button>
      </div>

      <div class="flex items-center gap-2">
        <ExportDropdown @select="handleExport" label="Yuklab olish" 
  icon="fa-solid fa-file-excel" 
  size="md" />
        <!-- <Button variant="primary" size="sm" class="!rounded-xl px-4 font-bold" @click="store_orders.AddOrderModal({ title: 'Yangi sotuv', action: 'create' })">
          <i class="fa-solid fa-plus mr-2"></i> Yangi Sotuv
        </Button> -->
      </div>
    </header>

    <transition name="filter-slide">
  <div v-if="isFilterVisible" 
       class="flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 mb-2 shadow-xl relative overflow-visible z-10">
    
    <div class="hidden md:block absolute top-6 left-0 w-1.5 h-10 bg-indigo-600 rounded-r-full"></div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
      
      <div class="lg:col-span-2 flex flex-col gap-2">
        <label class="filter-label text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sotuvchi</label>
        <Select v-model="filters.author" :options="authorOptions" placeholder="Tanlang" searchable clearable />
      </div>

      <div class="lg:col-span-3 flex flex-col gap-2">
        <label class="filter-label text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mijoz</label>
        <Select v-model="filters.customer" :options="customerOptions" placeholder="Tanlang" searchable clearable />
      </div>

      <div class="lg:col-span-2 flex flex-col gap-2">
        <label class="filter-label text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Haydovchi</label>
        <Select v-model="filters.driver" :options="driverOptions" placeholder="Tanlang" searchable clearable />
      </div>

      <div class="lg:col-span-2 flex flex-col gap-2">
        <label class="filter-label text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Holat (Status)</label>
        <Select v-model="filters.status" :options="statusOptions" placeholder="Barchasi" clearable />
      </div>

   <div class="sm:col-span-2 lg:col-span-3 flex flex-col mt-1 gap-2 relative" ref="dateDropdownRef">
  <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
    Vaqt oralig'i
  </label>

  <div class="flex items-center gap-2">
    <div 
      @click.stop="isDateDropdownOpen = !isDateDropdownOpen"
      :class="isDateDropdownOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-700'"
      class="flex-1 flex items-center justify-between px-4 h-[42px] bg-white dark:bg-slate-800 border rounded-xl cursor-pointer transition-all duration-300 group"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <i class="fa-solid fa-calendar-day text-indigo-500 text-xs"></i>
        <span class="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">
          <template v-if="filters.startDate || filters.endDate">
            {{ filters.startDate || '...' }} — {{ filters.endDate || '...' }}
          </template>
          <template v-else>Sanani tanlang</template>
        </span>
      </div>
      <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-300" :class="{'rotate-180': isDateDropdownOpen}"></i>
    </div>

    <button 
      v-if="filters"
      @click="resetFilters" 
      class="flex-none w-10 h-[42px] flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-100 dark:border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-300"
    >
      <i class="fa-solid fa-arrow-rotate-left text-xs"></i>
    </button>
  </div>

  <transition name="dropdown-pop">
    <div v-if="isDateDropdownOpen" 
         class="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] p-4">
      
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <span class="text-[9px] font-black text-slate-400 uppercase ml-1">Dan</span>
            <div class="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden">
              <i class="fa-regular fa-calendar-plus absolute left-3 text-[10px] text-indigo-500"></i>
              <input type="date" v-model="filters.startDate" class="custom-date-input w-full pl-9 pr-3 py-2 text-[11px] font-bold bg-transparent outline-none dark:text-slate-200 cursor-pointer" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <span class="text-[9px] font-black text-slate-400 uppercase ml-1">Gacha</span>
            <div class="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden">
              <i class="fa-regular fa-calendar-check absolute left-3 text-[10px] text-indigo-500"></i>
              <input type="date" v-model="filters.endDate" class="custom-date-input w-full pl-9 pr-3 py-2 text-[11px] font-bold bg-transparent outline-none dark:text-slate-200 cursor-pointer" />
            </div>
          </div>
        </div>

        <button @click="isDateDropdownOpen = false" 
                class="w-full py-2.5 text-[10px] font-black uppercase bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 rounded-xl hover:bg-indigo-700 transition-colors">
          Tayyor
        </button>
      </div>
    </div>
  </transition>
</div>

    </div>
  </div>
</transition>

   <main class="flex-1 min-h-0 relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
  <DataTable 
    :items="filteredSales" 
    :columns="columns" 
    v-model:selected="selectedIds" 
    class="h-full" 
  >
        
        <template #orderNumber="{ row }">
          <div class="flex items-center group ml-1">
            <div class="w-1 h-3 bg-indigo-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="font-mono text-[12.5px] font-black text-slate-900 dark:text-slate-100 tracking-tighter">#{{ row.orderNumber }}</span>
          </div>
        </template>

        <template #author.fullname="{ row }">
          <div class="flex items-center gap-2.5 py-1 text-left">
            <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-200 dark:border-slate-700">
              {{ row.author?.fullname?.charAt(0) || '?' }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-slate-800 dark:text-slate-200 text-[13px] leading-tight truncate">{{ row.author?.fullname }}</span>
              <span class="text-[10.5px] text-slate-400 font-medium tracking-tight mt-0.5"><i class="fa-solid fa-phone text-[9px] opacity-70 mr-1"></i>{{ row.author?.phoneNumber }}</span>
            </div>
          </div>
        </template>

        <template #customerId.fullname="{ row }">
          <div class="flex items-center gap-2.5 py-1 text-left">
            <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-200 dark:border-slate-700">
              {{ row.customerId?.fullname?.charAt(0) || '?' }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-slate-800 dark:text-slate-200 text-[13px] leading-tight truncate">{{ row.customerId?.fullname }}</span>
              <span class="text-[10.5px] text-slate-400 font-medium tracking-tight mt-0.5"><i class="fa-solid fa-phone text-[9px] opacity-70 mr-1"></i>{{ row.customerId?.phoneNumber }}</span>
            </div>
          </div>
        </template>

        <template #driverId.fullname="{ row }">
          <div class="flex items-center gap-2">
            <div class="relative">
              <div class="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500"><i class="fa-solid fa-user-tie text-[10px]"></i></div>
              <div v-if="row.driverId" class="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 border border-white rounded-full"></div>
            </div>
            <span class="text-[12px] font-semibold text-slate-600 dark:text-slate-400 truncate w-32">{{ row.driverId?.fullname || '—' }}</span>
          </div>
        </template>

        <template #paymentType="{ row }">
          <div class="flex justify-center">
            <div :class="['flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border', row.paymentType === 'cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400']">
              <i :class="row.paymentType === 'cash' ? 'fa-solid fa-money-bill-wave' : 'fa-solid fa-credit-card'"></i>
              {{ row.paymentType }}
            </div>
          </div>
        </template>

        <template #date="{ row }">
          <div class="flex flex-col items-center justify-center py-1 group min-w-[100px]">
            <div class="flex flex-col items-center leading-none">
              <span class="text-[12px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">{{ formatDateTime(row.date).dayMonth }}</span>
              <span class="text-[9px] font-bold text-slate-400 mt-0.5 tracking-widest">{{ formatDateTime(row.date).year }}</span>
            </div>
            <div class="mt-1.5 flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-inner">
              <i class="fa-regular fa-clock text-[9px] text-indigo-500"></i>
              <span class="text-[10px] font-mono font-black text-slate-600 dark:text-slate-400">{{ formatDateTime(row.date).time }}</span>
            </div>
          </div>
        </template>

        <template #totalAmount="{ row }">
          <div class="flex flex-col items-end pr-2 group">
            <span class="font-mono font-black text-slate-900 dark:text-white text-[14px] tracking-tighter group-hover:text-indigo-600 transition-colors">
              {{ formatPrice(row.totalAmount) }}
            </span>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">UZS</span>
          </div>
        </template>

        <template #status="{ row }">
          <div class="flex justify-center">
            <div class="flex items-center gap-2 px-3 py-1 rounded-full text-[10.5px] font-black uppercase border shadow-sm transition-all hover:brightness-95" :class="getStatusBadge(row.status)">
              <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>{{ row.status }}
            </div>
          </div>
        </template>

        <template #actions="{ row }">
         <ActionMenu 
        :row-id="row._id" 
        :items="getMenuItems(row)" 
      />
        </template>
      </DataTable>
    </main>

    <Modal v-model="isDetailModalOpen" title="Buyurtma tafsiloti" :subtitle="`Mijoz: ${selectedOrder?.customerId?.fullname}`" width="max-w-3xl" icon="fa-solid fa-file-invoice-dollar">
      <div class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-500 shadow-sm"><i class="fa-solid fa-user "></i></div>
            <div><p class="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Sotuvchi</p><p class="text-sm font-bold truncate">{{ selectedOrder?.author?.fullname || '—' }}</p></div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-500 shadow-sm"><i class="fa-solid fa-truck"></i></div>
            <div><p class="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Haydovchi</p><p class="text-sm font-bold truncate">{{ selectedOrder?.driverId?.fullname || '—' }}</p></div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-blue-500 shadow-sm"><i class="fa-solid fa-wallet"></i></div>
            <div><p class="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">To'lov turi</p><p class="text-sm font-bold uppercase">{{ selectedOrder?.paymentType }}</p></div>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <DataTable :items="selectedOrder?.items || []" :columns="itemColumns" class="!text-[12px] bg-slate-50/50">
            <template #name="{ row }"><div class="flex flex-col"><span class="font-bold text-slate-700 dark:text-slate-200">{{ row.name }}</span><span class="text-[9px] font-mono text-slate-400">Lot: {{ row.partyNumber }}</span></div></template>
            <template #quantity="{ row }"><span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-black">{{ row.quantity }} {{ row.unit }}</span></template>
            <template #salePrice="{ row }"><span class="font-mono text-slate-500">{{ formatPrice(row.salePrice) }}</span></template>
            <template #total="{ row }"><span class="font-mono font-black text-slate-900 dark:text-white">{{ formatPrice(row.quantity * row.salePrice) }}</span></template>
          </DataTable>
        </div>
        <div class="flex justify-between items-center bg-indigo-600 p-5 rounded-[2rem] text-white shadow-lg shadow-indigo-500/30">
          <div class="flex items-center gap-4"><div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl"><i class="fa-solid fa-calculator"></i></div><div class="flex flex-col"><span class="text-[10px] font-bold uppercase opacity-70 tracking-[0.2em]">Umumiy to'lov</span><span class="text-2xl font-mono font-black leading-none">{{ formatPrice(selectedOrder?.totalAmount) }} <small class="text-xs font-normal italic">uzs</small></span></div></div>
          <Button variant="secondary" @click="isDetailModalOpen = false" class="!bg-white !text-indigo-600 !rounded-xl !px-6 font-black uppercase text-xs">Yopish</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.filter-label { @apply text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 flex items-center; }
.date-input-pro { @apply w-full px-4 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-slate-200 transition-all cursor-pointer; }
.action-btn-danger { @apply w-24 h-9 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100; }
.filter-slide-enter-active, .filter-slide-leave-active { transition: all 0.4s ease-out; max-height: 400px; }
.filter-slide-enter-from, .filter-slide-leave-to { max-height: 0; opacity: 0; transform: translateY(-20px); }
.dropdown-pop-enter-active, .dropdown-pop-leave-active { transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
.dropdown-pop-enter-from, .dropdown-pop-leave-to { opacity: 0; transform: translateY(-10px) scale(0.9); }

/* Sticky footer ishlashi uchun asosiy konteyner cheklovi */
main {
  min-height: 0;
}
</style>