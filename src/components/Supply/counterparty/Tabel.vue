<script setup>
import { ref, onMounted, reactive, watch, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { CounterpartyStore } from "../../../stores/Supply/counterparty/counterparty.store";

// --- UI COMPONENTS ---
import DataTable from "../../../UI/DataTable.vue";
import Button from "../../../UI/Button.vue";
import ExportDropdown from "../../../UI/ExportDropdown.vue";
import Badge from "../../../UI/Badge.vue";

// --- MODALS ---
import CounterpartyModal from "./CounterpartyModal.vue";

const store = CounterpartyStore();
const { counterparties, isActive, all_length } = storeToRefs(store);

// Configuration
const columns = [
  { key: 'fullname', label: 'Kontragent / Fermer', width: '280px', fixed: 'left', sortable: true },
  { key: 'qr', label: 'QR', width: '60px', align: 'center' },
  { key: 'type', label: 'Turi', width: '120px', align: 'center' },
  { key: 'phoneNumber', label: 'Bog\'lanish', width: '160px' },
  { key: 'balance', label: 'Balans (UZS)', width: '180px', align: 'right' },
  { key: 'status', label: 'Holat', width: '110px', align: 'center' },
  { key: 'actions', label: '', width: '60px', fixed: 'right', align: 'center' }
];

const filter = reactive({ fullname: "" });
const activeDropdown = ref(null);
const isSearching = ref(false);

const loadData = async () => {
  isSearching.value = true;
  await store.GetAll({ status: isActive.value, page: 1, limit: 20, filter });
  isSearching.value = false;
};

// Aqlli qidiruv (Debounce)
let timeout;
watch(() => filter.fullname, () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => loadData(), 500);
});

onMounted(() => loadData());

const handleAction = (action, row) => {
  activeDropdown.value = null;
  if (action === 'edit') {
    store.AddCustomModal({ id: row._id, action: "update", title: "Ma'lumotlarni tahrirlash" });
  } else if (action === 'delete') {
    store.DeleteById(row._id);
  }
};
const menuOptions = [
  { l: 'Tahrirlash', v: 'edit', i: 'fa-solid fa-user-pen', c: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10', d: 'Ma\'lumotlarni o\'zgartirish' },
  { l: 'To\'lov qilish', v: 'pay', i: 'fa-solid fa-hand-holding-dollar', c: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10', d: 'Kassadan chiqim qilish' },
  { l: 'Operatsiyalar', v: 'history', i: 'fa-solid fa-clock-rotate-left', c: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10', d: 'Sut topshirish tarixi' },
  { l: 'O\'chirish', v: 'delete', i: 'fa-solid fa-trash-can', c: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10', d: 'Bazadan butkul o\'chirish' }
];
const formatPrice = (p) => new Intl.NumberFormat("uz-UZ").format(p || 0);

// Tashqariga bossa dropdownni yopish
const closeDrop = (e) => { if (!e.target.closest('.row-actions')) activeDropdown.value = null; };
onMounted(() => window.addEventListener('click', closeDrop));
onUnmounted(() => window.removeEventListener('click', closeDrop));
</script>

<template>
  <CounterpartyModal />

  <div class="h-screen flex flex-col gap-2 p-2 lg:p-2 bg-transparent dark:bg-transparent overflow-hidden">
    
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 lg:px-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-4 w-full md:w-auto">
       
        <div class="flex-1 md:w-80 relative group">
          <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
          <input v-model="filter.fullname" placeholder="Qidiruv (Ism, Kod, Tel)..." 
            class="w-full pl-11 pr-10 py-3 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-inner">
          <div v-if="isSearching" class="absolute right-4 top-1/2 -translate-y-1/2">
            <i class="fa-solid fa-spinner animate-spin text-indigo-500 text-xs"></i>
          </div>
        </div>
      </div>

      <div class="flex gap-3 w-full md:w-auto">
        <ExportDropdown />
        <Button variant="primary" size="sm" left-icon="fas fa-plus"  @click="store.AddCustomModal({ action: 'create', title: 'Yangi kontragent' })">
           Qo'shish
        </Button>
      </div>
    </div>

    <div class="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <DataTable :items="counterparties" :columns="columns" class="premium-table">
        
        <template #qr="{ row }">
          <div class="relative group/qr flex justify-center">
             <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center cursor-zoom-in group-hover/qr:border-indigo-500 transition-all">
                <i class="fa-solid fa-qrcode text-slate-400 group-hover/qr:text-indigo-500"></i>
             </div>
             <div v-if="row.qr" class="absolute bottom-full mb-3 hidden group-hover/qr:block z-50 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border ring-8 ring-black/5 animate-in slide-in-from-bottom-2">
                <img :src="row.qr" class="w-28 h-28 min-w-[112px]" />
             </div>
          </div>
        </template>

        <template #fullname="{ row }">
          <div class="flex items-center gap-4 py-1">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
              {{ row.fullname?.charAt(0).toUpperCase() }}
            </div>
            <div class="flex flex-col text-left">
              <span class="font-black text-slate-700 dark:text-slate-200 text-[14px] leading-tight hover:text-indigo-600 transition-colors cursor-pointer">
                {{ row.fullname }}
              </span>
              <span class="text-[10px] font-mono text-slate-400 uppercase mt-1">Kod: {{ row.code }}</span>
            </div>
          </div>
        </template>

        <template #balance="{ row }">
          <div class="flex flex-col items-end px-2">
            <span class="text-[15px] font-black tabular-nums" :class="row.balance < 0 ? 'text-rose-500' : 'text-emerald-500'">
              {{ formatPrice(row.balance) }}
            </span>
            <span class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{{ row.balance < 0 ? 'Qarzimiz' : 'Haqdor' }}</span>
          </div>
        </template>

        <template #status="{ row }">
           <Badge :variant="row.status === 'Aktiv' ? 'emerald' : 'slate'" size="sm" class="!rounded-full font-black uppercase text-[9px] tracking-widest">
              {{ row.status }}
           </Badge>
        </template>

  <template #actions="{ row }">
          <div class="relative row-actions flex justify-center">
            <button @click.stop="activeDropdown = activeDropdown === row._id ? null : row._id" 
              class="w-9 h-9 flex items-center justify-center rounded-[12px] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 transition-all duration-300 group">
              <i class="fa-solid fa-ellipsis-h text-lg group-hover:scale-125 transition-transform"></i>
            </button>
            
            <transition name="pop">
              <div v-if="activeDropdown === row._id" 
                class="absolute right-full mr-4 top-0 w-56 bg-white/95 dark:bg-slate-800/95 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-700 p-2 z-[150] backdrop-blur-xl ring-8 ring-black/5">
                
                <div v-for="a in menuOptions" :key="a.v" 
                  @click.stop="handleAction(a.v, row)" 
                  class="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group cursor-pointer active:scale-95">
                  <div :class="a.c" class="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-all">
                    <i :class="a.i" class="text-[13px]"></i>
                  </div>
                  <div class="flex flex-col text-left overflow-hidden">
                    <span class="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 tracking-tight transition-colors">{{ a.l }}</span>
                    <span class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">{{ a.d }}</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </template>

      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.premium-table :deep(tr:hover td) { @apply bg-slate-50/50 dark:bg-slate-800/50; }
.pop-enter-active { transition: all 0.2s ease-out; }
.pop-enter-from { opacity: 0; transform: scale(0.9) translateX(10px); }
</style>