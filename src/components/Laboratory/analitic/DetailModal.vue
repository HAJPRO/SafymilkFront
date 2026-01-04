<script setup>
  // --- 🟢 STORE ---
import { LaboaratoryAnaliticStore } from "../../../stores/Laboratory/analitic/analitic.store";
// const { toast } = useToast();
const store = LaboaratoryAnaliticStore();
import { storeToRefs } from "pinia";
const {  } = storeToRefs(store);
import { computed } from "vue";
import Modal from "../../../UI/Modal.vue";
import Button from "../../../UI/Button.vue";

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  data: { type: Object, default: () => ({}) } // Backend'dan kelgan tahlil obyekti
});

const emit = defineEmits(["update:isOpen"]);

// --- 🔵 STATUS MAPPING ---
const statusMap = {
  'Accepted': { label: 'Qabul qilindi', class: 'bg-emerald-500', icon: 'fa-check-double' },
  'Rejected': { label: 'Rad etildi', class: 'bg-rose-500', icon: 'fa-xmark' },
  'Pending': { label: 'Jarayonda', class: 'bg-amber-500', icon: 'fa-spinner fa-spin' }
};

// --- 🔵 FORMATED DATE ---
const formattedDate = computed(() => {
  if (!props.data?.createdAt) return '—';
  return new Date(props.data.createdAt).toLocaleString('uz-UZ', {
    year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
});

// --- 🔵 CALC TOTALS ---
const totalVolume = computed(() => {
  return Object.values(props.data?.distribution || {}).reduce((a, b) => a + Number(b), 0);
});

const GeneratePdf = async () => {
  if (!props.data?._id) {
    console.error("ID topilmadi");
    return;
  }
  
  try {
    // Faqatgina _id ni yuboramiz
    await store.GeneratePdf(props.data._id);
  } catch (error) {
    console.error("PDF yuklashda xatolik:", error);
  } finally {
  }
};
</script>

<template>
  <Modal 
    :model-value="isOpen" 
    @update:model-value="emit('update:isOpen', $event)"
    title="Tahlil Tafsilotlari"
    icon="fa-solid fa-file-waveform"
    width="max-w-5xl"
  >
    <div class="flex flex-col gap-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div :class="statusMap[data?.status]?.class" class="p-6 rounded-[2rem] text-white shadow-lg flex items-center gap-4 transition-all overflow-hidden relative group">
          <i :class="['fa-solid', statusMap[data?.status]?.icon]" class="text-4xl opacity-20 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform"></i>
          <div class="relative z-10">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Hozirgi Holat</p>
            <h3 class="text-xl font-black">{{ statusMap[data?.status]?.label || 'Noma\'lum' }}</h3>
          </div>
        </div>

        <div class="md:col-span-2 p-6 bg-slate-900 rounded-[2rem] text-white flex justify-between items-center shadow-xl ring-1 ring-white/10">
          <div>
            <p class="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Umumiy Tahlil Hajmi</p>
            <div class="text-4xl font-black tabular-nums">{{ totalVolume.toLocaleString() }} <span class="text-lg text-slate-500 font-medium">L</span></div>
          </div>
          <div class="text-right border-l border-white/10 pl-6">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Sana va Vaqt</p>
            <p class="text-xs font-bold">{{ formattedDate }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside class="lg:col-span-4 space-y-4">
          <div class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <i class="fa-solid fa-flask-vial text-indigo-500"></i> Laboratoriya Natijalari
            </h4>
            
            <div class="space-y-5">
              <div v-for="res in [
                { label: 'Yog\'lilik', val: data?.results?.fat + '%', icon: 'fa-droplet', col: 'text-blue-500' },
                { label: 'Zichlik', val: data?.results?.density, icon: 'fa-gauge-high', col: 'text-indigo-500' },
                { label: 'Kislotalilik', val: data?.results?.acidity + '°T', icon: 'fa-vial', col: 'text-emerald-500' },
                { label: 'Sut Navini', val: data?.results?.quality, icon: 'fa-award', col: 'text-amber-500' }
              ]" :key="res.label" class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <div class="flex items-center gap-3">
                  <div :class="[res.col, 'w-8 h-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-xs']">
                    <i :class="['fa-solid', res.icon]"></i>
                  </div>
                  <span class="text-[11px] font-bold text-slate-500 uppercase">{{ res.label }}</span>
                </div>
                <span class="text-sm font-black text-slate-800 dark:text-slate-200">{{ res.val || '—' }}</span>
              </div>
            </div>
          </div>
        </aside>

        <section class="lg:col-span-8">
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 h-full shadow-sm">
            <div class="flex items-center justify-between mb-8">
              <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-blue-500"></i> Mahsulotlar Taqsimoti
              </h4>
              <span class="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-black uppercase border border-blue-100 dark:border-blue-500/20">
                Jami {{ Object.keys(data?.distribution || {}).length }} tur
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(val, type) in data?.distribution" :key="type" 
                   class="group p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300">
                <div class="flex justify-between items-center">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{{ type.split(' ')[0] }}</span>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{{ type }}</span>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-black text-slate-900 dark:text-white tabular-nums">{{ val.toLocaleString() }}</div>
                    <div class="text-[9px] font-black text-blue-500 tracking-widest uppercase">LITR</div>
                  </div>
                </div>
                <div class="mt-4 h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full" :style="{ width: (val / totalVolume * 100) + '%' }"></div>
                </div>
              </div>
            </div>

            <div v-if="!data?.distribution || Object.keys(data.distribution).length === 0" class="flex flex-col items-center justify-center py-12 opacity-30">
              <i class="fa-solid fa-box-open text-5xl mb-4"></i>
              <p class="text-xs font-bold uppercase tracking-widest">Taqsimot ma'lumotlari mavjud emas</p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <div class="flex items-center gap-3">
          <div class="flex -space-x-2">
            <div v-for="i in 3" :key="i" class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px]">
               <i class="fa-solid fa-user-shield opacity-50"></i>
            </div>
          </div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Laboratoriya xodimlari tomonidan tasdiqlangan</span>
        </div>
        
        <div class="flex gap-3">
          <Button @click="emit('update:isOpen', false)" variant="secondary" size="sm" left-icon="fas fa-arrow-left">Orqaga</Button>
          <Button @click="GeneratePdf()" variant="primary" size="sm" left-icon="fas fa-pdf">PDF yuklash</Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-200 dark:bg-slate-700 rounded-full; }
</style>