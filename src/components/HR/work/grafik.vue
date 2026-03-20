<template>
  <div class="p-6 bg-[#F8FAFC] min-h-screen font-sans space-y-8">
    
    <div class="flex items-center justify-between bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-sm border border-white sticky top-0 z-50">
      <div class="flex items-center gap-5">
        <div class="relative">
          <div class="w-14 h-14 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <i class="fa-solid fa-microchip text-2xl animate-pulse"></i>
          </div>
          <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div>
          <h1 class="text-xl font-black text-slate-800 tracking-tight">Smart Grafik Engine</h1>
          <div class="flex items-center gap-2 mt-1">
            <CustomBadge variant="indigo" :text="activeModeLabel" small dot />
            <CustomBadge v-if="isValid" variant="emerald" text="Validatsiyadan o'tdi" small outline />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <CustomButton variant="secondary" outline @click="resetForm">Reset</CustomButton>
        <CustomButton variant="primary" leftIcon="fa-solid fa-rocket" @click="saveNewSchedule" :disabled="!form.name">
          Tizimga yozish
        </CustomButton>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-8">
      <aside class="col-span-12 lg:col-span-4 space-y-6">
        <div class="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-8">Konfiguratsiya</h3>
          
          <div class="space-y-6">
            <div class="group space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-500 transition-colors">Grafik identifikatori</label>
              <input v-model="form.name" placeholder="Masalan: 2/2 Smena A" 
                     class="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all" />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Algoritm turi</label>
              <div class="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                <button v-for="m in modes" :key="m.id" @click="form.mode = m.id"
                        :class="form.mode === m.id ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'"
                        class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2">
                  <i :class="m.icon"></i> {{ m.label }}
                </button>
              </div>
            </div>

            <div v-if="form.mode === 'cyclic'" class="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 space-y-4 animate-in zoom-in-95">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Sikl boshlanishi (Point Zero)</label>
                <input type="date" v-model="form.startDate" class="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-black shadow-sm outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3">
              <div v-for="opt in options" :key="opt.key" 
                   @click="form[opt.key] = !form[opt.key]"
                   :class="form[opt.key] ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-white'"
                   class="flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all group">
                <div class="flex items-center gap-3">
                  <div :class="form[opt.key] ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'" class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                    <i :class="opt.icon"></i>
                  </div>
                  <span class="text-[11px] font-black text-slate-600 uppercase">{{ opt.label }}</span>
                </div>
                <div class="w-10 h-6 bg-slate-200 rounded-full relative transition-colors" :class="{'bg-indigo-500': form[opt.key]}">
                  <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all" :style="form[opt.key] ? 'transform: translateX(16px)' : ''"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-indigo-900 p-8 rounded-[3rem] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden">
          <i class="fa-solid fa-chart-line absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12"></i>
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-6">Yillik Prognoz (Norma)</h3>
          <div class="grid grid-cols-2 gap-4 relative z-10">
            <div>
              <div class="text-[9px] font-bold text-indigo-300 uppercase">Jami Ish Soati</div>
              <div class="text-2xl font-black">{{ summary.totalHours }}<span class="text-xs ml-1 text-indigo-400">s.</span></div>
            </div>
            <div>
              <div class="text-[9px] font-bold text-indigo-300 uppercase">O'rtacha oylik</div>
              <div class="text-2xl font-black">{{ (summary.totalHours / 12).toFixed(1) }}<span class="text-xs ml-1 text-indigo-400">s.</span></div>
            </div>
          </div>
        </div>
      </aside>

      <main class="col-span-12 lg:col-span-8 space-y-6">
        <div class="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 min-h-[400px]">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
              <span class="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              Shablon Konstruktori
            </h3>
            <div class="flex gap-2">
              <CustomButton v-if="form.mode === 'cyclic'" size="sm" variant="secondary" outline leftIcon="fa-solid fa-wand-magic" @click="autoPattern">Avto-to'ldirish</CustomButton>
              <CustomButton v-if="form.mode === 'cyclic'" size="sm" variant="primary" leftIcon="fa-solid fa-plus" @click="addCycleDay">Kun qo'shish</CustomButton>
            </div>
          </div>

          <div v-if="form.mode === 'weekly'" class="grid grid-cols-7 gap-4">
            <div v-for="day in weekDays" :key="day.id" 
                 class="group relative p-5 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-5"
                 :class="day.off ? 'bg-slate-50 border-transparent' : 'bg-white border-indigo-50 shadow-xl shadow-indigo-100/20 hover:border-indigo-200'">
              
              <div class="text-[10px] font-black uppercase tracking-widest transition-colors" :class="day.off ? 'text-slate-300' : 'text-indigo-600'">{{ day.name }}</div>
              
              <div class="relative w-full">
                <input v-model="day.hours" type="number" :disabled="day.off"
                       class="w-full text-center bg-transparent text-2xl font-black text-slate-700 outline-none transition-all disabled:opacity-10" />
                <div v-if="!day.off" class="w-8 h-1 bg-indigo-100 mx-auto mt-1 rounded-full group-hover:w-12 transition-all"></div>
              </div>

              <button @click="day.off = !day.off" 
                      :class="day.off ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-600'"
                      class="w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">
                {{ day.off ? 'DAM' : 'ISH' }}
              </button>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4">
            <div v-for="(c, idx) in cycle" :key="idx" 
                 class="p-6 rounded-[2.5rem] bg-white border-2 border-slate-50 shadow-sm hover:border-indigo-300 transition-all relative group">
              
              <button @click="removeCycleDay(idx)" class="absolute -top-2 -right-2 w-8 h-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-rose-100">
                <i class="fa-solid fa-trash-can text-[11px]"></i>
              </button>
              
              <div class="flex items-center justify-between mb-4">
                <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Kun {{ idx + 1 }}</span>
                <i v-if="c.day + c.night === 0" class="fa-solid fa-mug-hot text-slate-300"></i>
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 bg-slate-50 rounded-2xl border border-transparent focus-within:border-indigo-100 transition-all">
                  <label class="text-[8px] font-black text-slate-400 uppercase block mb-1">Kunduz</label>
                  <input v-model="c.day" type="number" class="w-full bg-transparent text-sm font-black outline-none" />
                </div>
                <div class="p-3 bg-slate-50 rounded-2xl border border-transparent focus-within:border-rose-100 transition-all">
                  <label class="text-[8px] font-black text-rose-400 uppercase block mb-1">Tungi</label>
                  <input v-model="c.night" type="number" class="w-full bg-transparent text-sm font-black outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 class="text-sm font-black uppercase tracking-widest text-slate-800 italic">Smart Preview Engine</h3>
            <div class="flex items-center gap-4">
              <span class="text-[10px] font-bold text-slate-400 italic">* Hisob-kitoblar 2026-yil uchun amal qiladi</span>
            </div>
          </div>
          <DataTable :items="calendarSimulation" :columns="columns" hide-pagination height="350px" class="border-none" />
        </div>
      </main>
    </div>

    <ConfirmDialog ref="confirmRef" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import DataTable from '../../../UI/DataTable.vue';
import CustomBadge from '../../../UI/Badge.vue';
import CustomButton from '../../../UI/Button.vue';
import ConfirmDialog from '../../../UI/ConfirmDialog.vue';

const confirmRef = ref(null);

const modes = [
  { id: 'weekly', label: 'Haftalik', icon: 'fa-solid fa-calendar-week' },
  { id: 'cyclic', label: 'Smenali', icon: 'fa-solid fa-arrows-spin' }
];

const options = [
  { key: 'skipHolidays', label: 'Bayramlarni chegirish', icon: 'fa-solid fa-umbrella-beach' },
  { key: 'trackNight', label: 'Tungi soatlar (22:00+)', icon: 'fa-solid fa-moon' },
  { key: 'shortPreHoliday', label: 'Bayramoldi qisqartirish', icon: 'fa-solid fa-hourglass-half' }
];

const form = reactive({
  name: '',
  mode: 'weekly',
  startDate: new Date().toISOString().split('T')[0],
  skipHolidays: true,
  trackNight: true,
  shortPreHoliday: true
});

const weekDays = ref([
  { id: 1, name: 'Dushanba', hours: 8, off: false },
  { id: 2, name: 'Seshanba', hours: 8, off: false },
  { id: 3, name: 'Chorshanba', hours: 8, off: false },
  { id: 4, name: 'Payshanba', hours: 8, off: false },
  { id: 5, name: 'Juma', hours: 8, off: false },
  { id: 6, name: 'Shanba', hours: 0, off: true },
  { id: 7, name: 'Yakshanba', hours: 0, off: true },
]);

const cycle = ref([
  { day: 12, night: 4 }, // 1-kun: Smena
  { day: 0, night: 8 },  // 2-kun: Tungi chiqish
  { day: 0, night: 0 },  // 3-kun: Otdix
  { day: 0, night: 0 },  // 4-kun: Otdix
]);

// --- SMART LOGIC: 1C SIMULATION ---

const calendarSimulation = computed(() => {
  const months = [
    { name: 'Yanvar', days: 31 }, { name: 'Fevral', days: 28 }, { name: 'Mart', days: 31 },
    { name: 'Aprel', days: 30 }, { name: 'May', days: 31 }, { name: 'Iyun', days: 30 },
    { name: 'Iyul', days: 31 }, { name: 'Avgust', days: 31 }, { name: 'Sentyabr', days: 30 },
    { name: 'Oktyabr', days: 31 }, { name: 'Noyabr', days: 30 }, { name: 'Dekabr', days: 31 }
  ];

  let dayCounter = 0; // For cyclic mode

  return months.map((m, mIdx) => {
    let mHours = 0;
    let mNight = 0;
    let mDays = 0;

    for (let d = 1; d <= m.days; d++) {
      const date = new Date(2026, mIdx, d);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      if (form.mode === 'weekly') {
        const dayInfo = weekDays.value[(date.getDay() + 6) % 7];
        if (!dayInfo.off) {
          mDays++;
          mHours += dayInfo.hours;
        }
      } else {
        const cycleDay = cycle.value[dayCounter % cycle.value.length];
        if (cycleDay.day + cycleDay.night > 0) mDays++;
        mHours += cycleDay.day;
        mNight += cycleDay.night;
        dayCounter++;
      }
    }

    return {
      month: m.name,
      d: mDays,
      h: mHours,
      n: mNight,
      status: mHours > 168 ? 'Over' : 'Normal'
    };
  });
});

const columns = [
  { key: 'month', label: 'OY', width: '150px', fixed: 'left' },
  { key: 'd', label: 'ISH KUNLARI', align: 'center' },
  { key: 'h', label: 'ISH SOATLARI (SUM)', align: 'center' },
  { key: 'n', label: 'TUNGI (20%)', align: 'center' },
  { key: 'status', label: 'STATUS', align: 'center' },
];

const summary = computed(() => {
  return calendarSimulation.value.reduce((acc, curr) => {
    acc.totalDays += curr.d;
    acc.totalHours += curr.h;
    return acc;
  }, { totalDays: 0, totalHours: 0 });
});

// --- ACTIONS ---

const autoPattern = () => {
  cycle.value = [
    { day: 8, night: 0 },
    { day: 8, night: 0 },
    { day: 0, night: 0 }
  ];
};

const addCycleDay = () => cycle.value.push({ day: 0, night: 0 });
const removeCycleDay = (idx) => cycle.value.splice(idx, 1);

const resetForm = () => {
  form.name = '';
  form.mode = 'weekly';
};

const saveNewSchedule = async () => {
  const ok = await confirmRef.value.open({
    title: "Grafikni Tasdiqlash",
    message: `"${form.name}" grafigi bo'yicha yillik me'yor ${summary.value.totalHours} soatni tashkil etmoqda. Tizimga saqlaymizmi?`,
    variant: 'primary'
  });
  
  if (ok) {
    // API Call simulate
    console.log("Saving...", { form, weekDays: weekDays.value, cycle: cycle.value });
  }
};
</script>