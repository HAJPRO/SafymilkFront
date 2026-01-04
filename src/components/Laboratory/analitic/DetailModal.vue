<script setup>
import { LaboaratoryAnaliticStore } from "../../../stores/Laboratory/analitic/analitic.store";
import { computed, ref } from "vue";
import Modal from "../../../UI/Modal.vue";
import Button from "../../../UI/Button.vue";

const store = LaboaratoryAnaliticStore();
const props = defineProps({
  isOpen: { type: Boolean, required: true },
  data: { type: Object, default: () => ({}) }
});

const emit = defineEmits(["update:isOpen"]);
const loadingPdf = ref(false);

// --- 🔬 ANALITIK STANDARTLAR VA HISOB-KITOB ---
const STANDARDS = {
  fat: { min: 3.2, max: 4.5, weight: 0.4 },     // Yog'lilik 40% ahamiyatga ega
  density: { min: 1.027, max: 1.032, weight: 0.3 }, // Zichlik 30%
  acidity: { min: 16, max: 18, weight: 0.3 }  ,  // Kislotalilik 30%
  water: { min: 16, max: 18, weight: 0.3 }    // water 30%
};

const getQualityInsight = (id, val) => {
  if (!val) return { label: 'Noma\'lum', color: 'text-slate-400', icon: 'fa-circle-question', score: 0 };
  const st = STANDARDS[id];
  if (!st) return { label: 'Normal', color: 'text-emerald-500', icon: 'fa-circle-check', score: 100 };

  if (id === 'acidity') {
    if (val > st.max) return { label: 'Kislotali', color: 'text-rose-500', icon: 'fa-radiation', score: 20 };
    if (val < st.min) return { label: 'Past kislota', color: 'text-amber-500', icon: 'fa-droplet-slash', score: 60 };
  } else {
    if (val < st.min) return { label: 'Past sifat', color: 'text-rose-500', icon: 'fa-triangle-exclamation', score: 30 };
    if (val > st.max) return { label: 'Yuqori', color: 'text-blue-500', icon: 'fa-arrow-up-right-dots', score: 100 };
  }
  return { label: 'Ideal', color: 'text-emerald-500', icon: 'fa-shield-check', score: 100 };
};

// --- 🧮 AQLLI HISOB-KITOBLAR (Computed) ---
const totalVolume = computed(() => {
  return Object.values(props.data?.distribution || {}).reduce((a, b) => a + Number(b), 0);
});

// Sifat Indeksini hisoblash (General Quality Score)
const qualityIndex = computed(() => {
  if (!props.data?.results) return 0;
  let totalScore = 0;
  let count = 0;
  for (const [key, st] of Object.entries(STANDARDS)) {
    const val = props.data.results[key];
    if (val) {
      totalScore += getQualityInsight(key, val).score * st.weight;
      count++;
    }
  }
  return count > 0 ? Math.round(totalScore) : 0;
});

// Mahsulot unumdorligi (Masalan: Yog'lilikka qarab qaymoq olish prognozi)
const efficiencyForecast = computed(() => {
  const fat = props.data?.results?.fat || 0;
  return ((totalVolume.value * fat) / 100).toFixed(1);
});

const statusMap = {
  'Accepted': { label: 'Tasdiqlandi', class: 'from-emerald-600 to-teal-600', icon: 'fa-check-double', light: 'bg-emerald-50' },
  'Rejected': { label: 'Rad etildi', class: 'from-rose-600 to-red-600', icon: 'fa-ban', light: 'bg-rose-50' },
  'Pending': { label: 'Kutilmoqda', class: 'from-amber-500 to-orange-600', icon: 'fa-timer', light: 'bg-amber-50' }
};

const GeneratePdf = async () => {
  if (loadingPdf.value) return;
  loadingPdf.value = true;
  try { await store.GeneratePdf(props.data._id); }
  finally { loadingPdf.value = false; }
};
</script>

<template>
  <Modal 
    :model-value="isOpen" 
    @update:model-value="emit('update:isOpen', $event)"
    title="Analitik Laboratoriya Ekspertizasi"
    width="max-w-6xl"
  >
    <div class="main-wrapper">
      <div class="flex flex-col gap-6 pb-6">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div :class="statusMap[data?.status]?.class" class="p-6 rounded-[2.5rem] bg-gradient-to-br text-white shadow-lg relative overflow-hidden group">
            <i :class="['fa-solid', statusMap[data?.status]?.icon]" class="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform"></i>
            <p class="text-[10px] font-black uppercase tracking-widest opacity-80">Xulosa holati</p>
            <h3 class="text-2xl font-black mt-2">{{ statusMap[data?.status]?.label }}</h3>
            <div class="mt-4 py-1 px-3 bg-white/20 rounded-full w-fit text-[10px] font-bold">ID: {{ data?._id?.slice(-8) }}</div>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 flex items-center gap-5 shadow-sm">
            <div class="relative w-20 h-20 flex-shrink-0">
              <svg class="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" stroke-width="8" class="text-slate-100 dark:text-slate-800" />
                <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" stroke-width="8" 
                  class="transition-all duration-1000"
                  :class="qualityIndex > 70 ? 'text-emerald-500' : 'text-amber-500'"
                  :stroke-dasharray="226"
                  :stroke-dashoffset="226 - (226 * qualityIndex) / 100" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-xl font-black">{{ qualityIndex }}</span>
                <span class="text-[8px] font-bold uppercase opacity-50">Score</span>
              </div>
            </div>
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sifat Indeksi</p>
              <p class="text-xs font-bold text-slate-600 dark:text-slate-300">
                {{ qualityIndex > 80 ? 'Xalqaro standartga mos' : 'Qayta ishlash tavsiya etiladi' }}
              </p>
            </div>
          </div>

          <div class="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden group">
            <div class="relative z-10">
              <p class="text-[10px] font-black uppercase tracking-widest opacity-80">Yog' unumi prognozi</p>
              <div class="flex items-baseline gap-2 mt-2">
                <h3 class="text-3xl font-black">{{ efficiencyForecast }}</h3>
                <span class="text-sm font-bold opacity-70">KG</span>
              </div>
              <p class="text-[10px] mt-2 italic opacity-60">* Xomashyo asosidagi taxminiy hisob</p>
            </div>
            <i class="fa-solid fa-chart-line absolute right-6 top-1/2 -translate-y-1/2 text-5xl opacity-10"></i>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <aside class="lg:col-span-5 flex flex-col gap-4">
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm">
              <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <i class="fa-solid fa-microscope text-indigo-500"></i>
                Laboratoriya Spektri
              </h4>
              
              <div class="space-y-4">
                <div v-for="res in [
                  { id: 'fat', label: 'Yog\'lilik darajasi', val: data?.results?.fat, unit: '%', icon: 'fa-droplet', col: 'blue' },
                  { id: 'density', label: 'Suyuqlik zichligi', val: data?.results?.density, unit: 'kg/m³', icon: 'fa-gauge-high', col: 'indigo' },
                  { id: 'acidity', label: 'Kislotalilik (pH)', val: data?.results?.acidity, unit: '°T', icon: 'fa-flask-vial', col: 'emerald' },
                  { id: 'acidity', label: 'Suv (HO)', val: data?.results?.acidity, unit: '%', icon: 'fa-period', col: 'blue' }
                ]" :key="res.label" class="group relative">
                  <div class="flex justify-between items-center mb-1 px-1">
                    <span class="text-[11px] font-black text-slate-500 uppercase">{{ res.label }}</span>
                    <span class="text-xs font-black" :class="getQualityInsight(res.id, res.val).color">{{ res.val || 0 }} {{ res.unit }}</span>
                  </div>
                  <div class="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner flex items-center">
                    <div class="h-full rounded-lg transition-all duration-1000 shadow-sm"
                         :class="getQualityInsight(res.id, res.val).score < 50 ? 'bg-rose-500' : 'bg-indigo-500'"
                         :style="{ width: (res.val > 20 ? 100 : (res.val / (STANDARDS[res.id]?.max || 20) * 100)) + '%' }">
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 mt-1.5 px-1">
                    <i :class="['fa-solid text-[9px]', getQualityInsight(res.id, res.val).icon, getQualityInsight(res.id, res.val).color]"></i>
                    <span class="text-[9px] font-bold uppercase opacity-60 tracking-tighter">{{ getQualityInsight(res.id, res.val).label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-slate-900 p-6 rounded-[2.5rem] text-white flex justify-between items-center overflow-hidden relative">
               <div>
                  <p class="text-[9px] font-black uppercase text-indigo-400">Jami qabul hajmi</p>
                  <p class="text-2xl font-black tabular-nums">{{ totalVolume.toLocaleString() }} <span class="text-xs text-slate-500">LITR</span></p>
               </div>
               <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <i class="fa-solid fa-truck-ramp-box"></i>
               </div>
            </div>
          </aside>

          <section class="lg:col-span-7 flex flex-col  overflow-y-auto max-h-[65vh] custom-main-scroll px-1">
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col overflow-hidden">
              <div class="flex items-center justify-between mb-8 flex-shrink-0">
                <div>
                  <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Mahsulotlar Taqsimoti</h4>
                  <p class="text-[10px] text-slate-400 mt-1 uppercase font-bold">Har bir kategoriya ulushi (%)</p>
                </div>
                <div class="flex gap-2">
                   <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-indigo-50 transition-colors cursor-pointer">
                      <i class="fa-solid fa-filter text-[10px] text-slate-400"></i>
                   </div>
                </div>
              </div>

              <div class="flex-grow overflow-y-auto pr-3 custom-distribution-scroll">
                <div class="grid gap-6">
                  <div v-for="(val, type) in data?.distribution" :key="type" class="group/item bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-3xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
                    <div class="flex justify-between items-center mb-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-[10px] font-black text-indigo-500">
                          {{ type.slice(0, 2).toUpperCase() }}
                        </div>
                        <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{{ type }}</span>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-black text-slate-900 dark:text-white tabular-nums">{{ val.toLocaleString() }} L</p>
                        <p class="text-[9px] font-bold text-indigo-500 uppercase">{{ ((val / totalVolume) * 100).toFixed(1) }}%</p>
                      </div>
                    </div>
                    <div class="h-2 w-full bg-white dark:bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                      <div class="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-1000 ease-out" 
                           :style="{ width: (val / totalVolume * 100) + '%' }">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col sm:flex-row items-center justify-between w-full gap-4 px-2">
        <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 pr-6 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div class="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
             <i class="fa-solid fa-shield-halved text-sm"></i>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none mb-1">Xavfsiz tahlil</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">№: {{ data.partyNumber?  data.partyNumber : 0}}</p>
          </div>
        </div>
        
        <div class="flex gap-3 w-full sm:w-auto">
          <Button @click="emit('update:isOpen', false)" variant="secondary" class="flex-1 sm:flex-none !rounded-2xl px-8 py-3.5 font-black text-[11px] uppercase tracking-widest border-slate-200">
            Yopish
          </Button>
          <Button @click="GeneratePdf()" :loading="loadingPdf" variant="primary" class="flex-1 sm:flex-none !rounded-2xl px-8 py-3.5 bg-indigo-600 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all border-none group">
            <i class="fa-solid fa-file-invoice mr-2 group-hover:rotate-12 transition-transform"></i>
            <span class="font-black text-[11px] uppercase tracking-widest">Ekspertiza PDF</span>
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
/* 🟡 PROFESSIONAL MAIN SCROLLBAR */
.custom-main-scroll::-webkit-scrollbar { width: 6px; }
.custom-main-scroll::-webkit-scrollbar-track { background: transparent; margin: 10px; }
.custom-main-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.dark .custom-main-scroll::-webkit-scrollbar-thumb { background: #334155; background-clip: content-box; }

/* 🔵 INTERNAL DISTRIBUTION SCROLLBAR */
.custom-distribution-scroll::-webkit-scrollbar { width: 4px; }
.custom-distribution-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-distribution-scroll::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
.dark .custom-distribution-scroll::-webkit-scrollbar-thumb { background: #1e293b; }
.custom-distribution-scroll:hover::-webkit-scrollbar-thumb { background: #6366f1; }

/* 🟢 MICRO-INTERACTIONS */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.group, .group\/item, aside > div {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.font-mono { font-variant-numeric: tabular-nums; }

/* Hover effects for cards */
.group:hover .bg-indigo-600 { filter: brightness(1.1); }
</style>