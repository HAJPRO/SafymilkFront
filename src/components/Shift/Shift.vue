<script setup>
import { ref, reactive, computed } from 'vue';
import MyDrawer from '../../UI/Drawer.vue';
import MyInput from '../../UI/Input.vue';
import MySelect from '../../UI/Select.vue';
import MyButton from '../../UI/Button.vue';
import MyModal from '../../UI/Modal.vue';
import DataTable from '../../UI/DataTable.vue';

// --- STATE (Holat) ---
const isDrawerOpen = ref(false);
const isLoading = ref(false);
const isShiftActive = ref(false);

const shiftData = reactive({
  openedAt: null,
  cashierName: ''
});

const cashiers = [
  { id: 1, label: 'Sardor G\'ulomov', icon: 'fa-solid fa-user' },
  { id: 2, label: 'Malika Axmedova', icon: 'fa-solid fa-user' },
];

const paymentMethods = [
  { id: 'cash', label: 'Naqd pul', icon: 'fa-solid fa-money-bill' },
  { id: 'terminal', label: 'Terminal', icon: 'fa-solid fa-credit-card' },
  { id: 'transfer', label: 'O\'tkazma', icon: 'fa-solid fa-money-bill-transfer' }
];

const form = reactive({
  cashierId: 1,
  openingBalance: 450000,
  actualCash: null,
  salesAmount: {
    Naqd: 1200000,
    Terminal: 850000,
    Click: 400000,
    Nasiya: 400000,
  },
  expenses: [],
});

// --- HELPERS ---
const formatDateTime = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

// --- SMART COMPUTED (Mantiqiy hisob-kitoblar) ---

// 1. Jami xarajat (Barcha turlar bo'yicha)
const totalExpenses = computed(() => 
  form.expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
);

// 2. FAQAT Naqd xarajatlar (Audit uchun kerak)
const cashOnlyExpenses = computed(() => 
  form.expenses
    .filter(exp => exp.method === 'cash')
    .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
);

// 3. Tizimdagi kutilayotgan NAQD pul (Formula: Boshlang'ich + Savdo_Naqd - Xarajat_Naqd)
const expectedCash = computed(() => {
  const start = Number(form.openingBalance) || 0;
  const sales = Number(form.salesAmount.Naqd) || 0;
  return start + sales - cashOnlyExpenses.value;
});

// 4. Kassa audit farqi (Sanoq - Tizim)
const balanceDiff = computed(() => {
  if (form.actualCash === null || form.actualCash === '') return 0;
  return Number(form.actualCash) - expectedCash.value;
});

const auditStatus = computed(() => {
  if (form.actualCash === null || form.actualCash === '') 
    return { color: 'text-slate-400', label: 'Sanoq kutilmoqda', bg: 'bg-slate-100 dark:bg-slate-800' };
  if (balanceDiff.value === 0) 
    return { color: 'text-emerald-500', label: 'Aniq (Ideal)', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
  if (balanceDiff.value < 0) 
    return { color: 'text-rose-500', label: 'Kamomad', bg: 'bg-rose-50 dark:bg-rose-500/10' };
  return { color: 'text-amber-500', label: 'Ortiqcha', bg: 'bg-amber-50 dark:bg-amber-500/10' };
});

// --- METHODS ---
const expenseColumns = [
  { key: 'recipient', label: 'Kimga / Maqsad', width: '200px' },
  { key: 'method', label: 'To\'lov turi', width: '150px' },
  { key: 'amount', label: 'Summa', align: 'right', width: '140px' },
  { key: 'actions', label: '', width: '50px', align: 'center' }
];

const addExpense = () => {
  form.expenses.unshift({ id: Date.now(), recipient: '', method: 'cash', amount: null });
};

const removeExpense = (id) => {
  form.expenses = form.expenses.filter(e => e.id !== id);
};

const handleShiftAction = async () => {
  isLoading.value = true;
  await new Promise(r => setTimeout(r, 1200));
  
  if (!isShiftActive.value) {
    shiftData.openedAt = new Date();
    const cashier = cashiers.find(c => c.id === form.cashierId);
    shiftData.cashierName = cashier ? cashier.label : 'Noma\'lum';
    isShiftActive.value = true;
  } else {
    isShiftActive.value = false;
    form.actualCash = null;
    form.expenses = [];
  }
  
  isLoading.value = false;
  isDrawerOpen.value = false;
};
</script>

<template>
 <button
    ref="trigger"
    class="group/profile relative flex items-center justify-center focus:outline-none transition-all duration-500"
    aria-haspopup="true"
    :aria-expanded="isDrawerOpen"
    @click="isDrawerOpen = true"
  >
    <div 
      class="absolute inset-0 blur-2xl rounded-full scale-0 group-hover/profile:scale-150 transition-all duration-700 pointer-events-none opacity-0 group-hover/profile:opacity-100"
      :class="isShiftActive ? 'bg-emerald-500/20' : 'bg-indigo-500/30'"
    ></div>
    
    <div 
      class="relative w-12 h-12 rounded-2xl p-[1.5px] transition-all duration-500 bg-gradient-to-br from-slate-200 via-slate-100 to-white dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 shadow-xl overflow-visible"
      :class="[
        isDrawerOpen ? 'rotate-12 scale-90 ring-[5px] ring-indigo-500/20' : 'group-hover/profile:-rotate-6 group-hover/profile:shadow-2xl',
        isShiftActive && !isDrawerOpen ? 'group-hover/profile:ring-[4px] group-hover/profile:ring-emerald-500/20' : ''
      ]"
    >
      <div class="w-full h-full rounded-[14px] overflow-hidden bg-white dark:bg-slate-950 flex items-center justify-center relative">
        <i 
          :class="[
            isShiftActive ? 'fas fa-user text-emerald-500' : 'fas fa-user-lock text-slate-400',
            'text-lg transition-all duration-500 group-hover/profile:scale-110'
          ]"
        ></i>
        
        <div class="absolute inset-0 shadow-[inset_0_0_8px_rgba(0,0,0,0.05)] pointer-events-none"></div>
      </div>

      <span class="absolute -bottom-1 -right-1 flex h-4 w-4">
        <span 
          v-if="isShiftActive"
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
        ></span>
        <span 
          class="relative inline-flex rounded-full h-4 w-4 border-2 border-white dark:border-slate-900 shadow-sm transition-colors duration-500"
          :class="isShiftActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"
        ></span>
      </span>
    </div>

    <div class="absolute -top-12 opacity-0 translate-y-2 group-hover/profile:opacity-100 group-hover/profile:translate-y-0 transition-all duration-300 pointer-events-none">
      <div class="relative flex items-center">
        <div class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.15em] shadow-2xl whitespace-nowrap flex items-center gap-2">
          <i :class="isShiftActive ? 'fa-solid fa-check-double text-emerald-400' : 'fa-solid fa-play text-indigo-400'"></i>
          {{ isShiftActive ? 'Smenani boshqarish' : 'Smenani ochish' }}
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45"></div>
      </div>
    </div>
  </button>

    <MyDrawer v-model="isDrawerOpen" :title="isShiftActive ? 'Smena Boshqaruvi' : 'Smenani Ochish'" max-width="1200px">
      <div class="space-y-8 pb-10">
        
        <div v-if="isShiftActive" class="group relative flex  sm:flex-row gap-2 p-6 bg-slate-900 dark:bg-slate-800/50 rounded-[2.5rem] text-white shadow-2xl overflow-hidden border border-white/5">
  
 <div class="flex-1 flex items-center gap-4 relative z-10">
  <div class="relative hidden sm:block">
    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
      <i class="fa-solid fa-user-tie text-white text-sm"></i>
    </div>
    <span class="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
  </div>

  <div class="space-y-1">
    <div class="flex items-center gap-2">
      <p class="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Mas'ul Kassir</p>
      
      <div class="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
        <span class="text-[7px] font-black text-indigo-400 uppercase tracking-tighter leading-none">Smena №</span>
        <span class="text-[9px] font-black text-indigo-300 leading-none tabular-nums italic">
          {{ shiftData.shiftNumber || '1' }}
        </span>
      </div>
    </div>

    <div class="flex flex-col">
      <h3 class="text-[13px] font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors duration-300 flex items-center gap-1.5">
        {{ shiftData.cashierName || 'Sanjar Aliyev' }}
        <i class="fa-solid fa-circle-check text-[10px] text-indigo-500/50"></i>
      </h3>
      
    </div>
  </div>

  <div class="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-indigo-500/5 blur-[40px] rounded-full pointer-events-none"></div>
</div>

 

  <div class="flex-1 space-y-2 relative z-10 sm:text-right sm:border-l sm:border-white/10 sm:pl-6 transition-all duration-500 group/time">
  
  <div class="flex items-center justify-end gap-2 text-slate-500">
    <p class="text-[8px] font-black uppercase tracking-[0.2em] leading-none">Smena seansi</p>
    <div class="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
      <i class="fa-solid fa-clock-rotate-left text-[10px] text-emerald-500"></i>
    </div>
  </div>

  <div class="space-y-0.5">
    <p class="text-[13px] font-black tracking-tight text-white group-hover/time:text-emerald-400 transition-colors duration-300 tabular-nums italic">
      {{ formatDateTime(shiftData.openedAt) }}
    </p>
    
   
  </div>

  <div class="absolute -right-10 top-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none group-hover/time:bg-emerald-500/10 transition-all"></div>
</div>

  <i class="fa-solid fa-id-card-clip absolute -left-4 -bottom-4 text-7xl opacity-[0.03] -rotate-12"></i>
  <i class="fa-solid fa-fingerprint absolute -right-4 -top-4 text-7xl opacity-[0.03] rotate-12"></i>
  
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
</div>

        <div class="grid grid-cols-1 gap-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <MySelect v-if="!isShiftActive" v-model="form.cashierId" :options="cashiers" label="Kassir" :disabled="isShiftActive" required=""  />

          <MyInput v-model="form.openingBalance" suffix="sum" label="Kassadagi boshlang'ich naqd pul" type="number" :disabled="isShiftActive" iconPre="fa-solid fa-wallet" />
        </div>

       <section v-if="isShiftActive" class="space-y-4">
  <div class="flex items-center justify-between px-2">
    <div class="flex items-center gap-2">
      <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] italic">
        Tizim bo'yicha joriy savdo
      </h4>
    </div>
    <div class="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span class="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">Live Monitor</span>
    </div>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div 
      v-for="(val, key) in form.salesAmount" 
      :key="key" 
      class="relative group overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div :class="[
        key === 'Naqd' ? 'bg-amber-500/5' : 
        key === 'Terminal' ? 'bg-blue-500/5' : 
        key === 'Click' ? 'bg-indigo-500/5' : 'bg-rose-500/5',
        'absolute -right-2 -top-2 w-12 h-12 blur-2xl rounded-full transition-opacity'
      ]"></div>

      <div class="relative z-10 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
             <div :class="[
                key === 'Naqd' ? 'bg-amber-100 text-amber-600' : 
                key === 'Terminal' ? 'bg-blue-100 text-blue-600' : 
                key === 'Click' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600',
                'w-6 h-6 rounded-lg flex items-center justify-center text-[10px]'
             ]">
               <i :class="[
                  key === 'Naqd' ? 'fa-solid fa-money-bill-wave' : 
                  key === 'Terminal' ? 'fa-solid fa-credit-card' : 
                  key === 'Click' ? 'fa-solid fa-mouse-pointer' : 'fa-solid fa-handshake-angle'
               ]"></i>
             </div>
             <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ key }}</p>
          </div>
        </div>

        <div class="flex items-baseline gap-1">
          <p :class="[
            key === 'Naqd' ? 'text-amber-600' : 
            key === 'Terminal' ? 'text-blue-600' : 
            key === 'Click' ? 'text-indigo-600' : 'text-rose-600',
            'text-[14px] font-black tabular-nums tracking-tight'
          ]">
            {{ val.toLocaleString() }}
          </p>
          <span class="text-[8px] font-bold text-slate-300 uppercase">uzs</span>
        </div>
      </div>
      
      <div :class="[
        key === 'Naqd' ? 'bg-amber-500' : 
        key === 'Terminal' ? 'bg-blue-500' : 
        key === 'Click' ? 'bg-indigo-500' : 'bg-rose-500',
        'absolute bottom-0 left-4 right-4 h-[2px] opacity-20 rounded-full'
      ]"></div>
    </div>
  </div>
</section>

        <section class="space-y-4">
          <div class="flex justify-between items-center px-1">
            <div class="flex items-center gap-2">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smena Xarajatlari</h4>
              <span v-if="form.expenses.length" class="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full italic border border-rose-100">
                Jami: -{{ totalExpenses.toLocaleString() }}
              </span>
            </div>
            <button @click="addExpense" class="bg-indigo-600 text-white w-8 h-8 rounded-xl flex items-center justify-center hover:shadow-lg transition-all active:scale-90">
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>

             <main class="flex-1 min-h-0 relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

            <DataTable :items="form.expenses" :columns="expenseColumns" :showIndex="true" class="max-h-[500px]" >
              <template #recipient="{ row }">
                <input v-model="row.recipient" class="w-full bg-transparent border-none text-[13px] focus:ring-0 p-1 font-medium dark:text-slate-300" placeholder="Kimga yoki nima uchun..." />
              </template>
              <template #method="{ row }">
                <select v-model="row.method" class="bg-slate-50 dark:bg-slate-800 border-none text-[11px] font-bold rounded-xl focus:ring-1 focus:ring-indigo-500 p-1.5 w-full cursor-pointer">
                  <option v-for="m in paymentMethods" :key="m.id" :value="m.id">{{ m.label }}</option>
                </select>
              </template>
              <template #amount="{ row }">
                <input v-model="row.amount" type="number" class="w-full bg-transparent border-none text-[13px] text-right focus:ring-0 p-1 font-black text-rose-500" placeholder="0" />
              </template>
              <template #actions="{ row }">
                <button @click="removeExpense(row.id)" class="text-slate-300 hover:text-rose-500 transition-colors p-2">
                  <i class="fa-solid fa-trash-can text-[12px]"></i>
                </button>
              </template>
            </DataTable>
            
          </main>
        </section>

        <section v-if="isShiftActive" class="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
          <div class="flex items-center justify-between px-2">
            <div class="flex items-center gap-2 text-indigo-600">
              <i class="fa-solid fa-calculator text-sm"></i>
              <h4 class="text-[11px] font-black uppercase tracking-[0.15em]">Kassa Audit & Yakun</h4>
            </div>
            <div :class="auditStatus.bg" class="px-3 py-1 rounded-full transition-all duration-500 border border-current/5">
              <span :class="auditStatus.color" class="text-[9px] font-black uppercase tracking-tighter italic">
                {{ auditStatus.label }}
              </span>
            </div>
          </div>

          <div class="relative group overflow-hidden rounded-[2.5rem] p-1 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
            <div class="bg-slate-900/40 rounded-[2.3rem] p-6 relative overflow-hidden backdrop-blur-sm">
              <div class="">
                <MyInput 
                  v-model="form.actualCash" 
                  label="Kassadagi haqiqiy naqd pul (Sanoq)" 
                  type="number" 
                  placeholder="Sanab kiriting..."
                  iconPre="fa-solid fa-calculator"
                  suffix="Sum"
                  required=""
                />
              </div>

              <div class="grid grid-cols-2 gap-4 relative z-10">
                <div class="bg-white/5 border border-white/5 rounded-3xl p-5">
                  <p class="text-[9px] text-white/40 uppercase tracking-widest mb-1 font-bold">Tizimda bo'lishi kerak</p>
                  <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-black text-white italic tabular-nums">{{ expectedCash.toLocaleString() }}</span>
                    <span class="text-[10px] text-white/30 font-bold uppercase tracking-widest">UZS</span>
                  </div>
                  <p class="text-[8px] text-slate-500 mt-2 italic">* Naqd xarajatlar (-{{ cashOnlyExpenses.toLocaleString() }}) inobatga olindi.</p>
                </div>

                <div :class="[
                  balanceDiff === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 
                  balanceDiff < 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20',
                  'border rounded-3xl p-5 transition-all duration-500 shadow-inner'
                ]">
                  <p class="text-[9px] text-white/40 uppercase tracking-widest mb-1 font-bold">Farq (Audit natijasi)</p>
                  <div class="flex items-baseline gap-1">
                    <span :class="balanceDiff === 0 ? 'text-emerald-400' : (balanceDiff < 0 ? 'text-rose-400' : 'text-amber-400')" class="text-2xl font-black italic tabular-nums">
                      {{ balanceDiff > 0 ? '+' : '' }}{{ balanceDiff.toLocaleString() }}
                    </span>
                    <span :class="auditStatus.color" class="text-[10px] font-bold uppercase opacity-50">UZS</span>
                  </div>
                </div>
              </div>

              <div class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-[50px]"></div>
              <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-600/5 rounded-full blur-[50px]"></div>
            </div>
          </div>
        </section>
      </div>

      <template #footer-actions>
        <div class="flex flex-col gap-3 w-full p-2">
          <MyButton 
            v-if="isShiftActive" 
            variant="danger" 
            block size="lg" rounded
            :loading="isLoading"
            :disabled="form.actualCash === null || form.actualCash === ''"
            @click="handleShiftAction"
            left-icon="fas fa-circle-check"
            class="uppercase"
          >
            Smenani yakunlash 
          </MyButton>
          <MyButton v-else variant="primary" block size="lg" rounded :loading="isLoading" @click="handleShiftAction">
            <span class="font-black italic text-xs tracking-widest uppercase">Smenani Ochish</span>
          </MyButton>
        </div>
      </template>
    </MyDrawer>
</template>

<style scoped>
.font-black {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

</style>