<script setup>
import { ref, computed, watch } from "vue";
import Modal from "../../../UI/Modal.vue";
import Input from "../../../UI/Input.vue";
import Select from "../../../UI/Select.vue";
import Button from "../../../UI/Button.vue";
import { useToast } from "../../../UI/utils/useToast";
import { SupplyInputboundStore } from "../../../stores/Supply/inbound/inputbound.store.js";

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  selectedItems: { type: Array, default: () => [] } 
});

const emit = defineEmits(["update:isOpen"]);
const { toast } = useToast();
const store = SupplyInputboundStore();

// --- 🔵 MAHSULOT KATALOGI ---
const productCatalog = {
  smetana: ['Smetana 15%', 'Smetana 20%', 'Smetana 25%'],
  qaymoq: ['Oddiy Qaymoq', 'Separator Qaymoq', 'Pishirilgan Qaymoq'],
  qatiq: ['Qatiq 2%', 'Qatiq 3.2%', 'Parhezbop Qatiq'],
  suzma: ['Chaka', 'Siyoh Suzma', 'Tuzli Suzma'],
  sut: ['Xom sut (Sotuv)', 'Pasterizatsiyalangan sut']
};

const activeCategory = ref('all'); // Kategoriya bo'yicha filter
const labForm = ref({
  fat: 3.6,
  density: 1.028,
  acidity: 18,
  quality: 'Oliy nav',
  distribution: {} 
});

// --- 🔵 ANALIZ NORMALARI (Professional nazorat) ---
const norms = {
  fat: { min: 0.1, max: 8.0, step: 0.1 },
  density: { min: 1.020, max: 1.040, step: 0.001 },
  acidity: { min: 14, max: 25, step: 1 }
};

const totalVolume = computed(() => {
  return props.selectedItems.reduce((acc, doc) => {
    return acc + (doc.items?.reduce((sum, item) => sum + (Number(item.qty) || 0), 0) || 0);
  }, 0);
});

const initDistribution = () => {
  const dist = {};
  Object.values(productCatalog).flat().forEach(type => { dist[type] = 0; });
  labForm.value.distribution = dist;
};

// --- 🔵 SMART MATH & CALCULATIONS ---
const distributedSum = computed(() => {
  return Number(Object.values(labForm.value.distribution).reduce((a, b) => a + (Number(b) || 0), 0).toFixed(2));
});

const remainingVolume = computed(() => {
  return Number((totalVolume.value - distributedSum.value).toFixed(2));
});

const isDistValid = computed(() => Math.abs(totalVolume.value - distributedSum.value) < 0.01 && totalVolume.value > 0);

// --- 🔵 ACTIONS ---
const validateInput = (type) => {
  if (labForm.value.distribution[type] < 0) labForm.value.distribution[type] = 0;
  if (remainingVolume.value < 0) {
    const diff = Math.abs(remainingVolume.value);
    labForm.value.distribution[type] = Number((labForm.value.distribution[type] - diff).toFixed(2));
    toast.error("Jami hajmdan oshib ketish mumkin emas!");
  }
};

const setAllToType = (type) => {
  initDistribution();
  labForm.value.distribution[type] = totalVolume.value;
  toast.success(`Barcha hajm ${type}ga yo'naltirildi`);
};

const handleConfirm = async () => {
  if (!isDistValid.value) {
    toast.warning("Hajm to'liq taqsimlanmagan!");
    return;
  }
  
  const finalDist = Object.fromEntries(
    Object.entries(labForm.value.distribution).filter(([_, val]) => val > 0)
  );

  const payload = {
    inboundBatchIds: props.selectedItems.map(i => i._id),
    labResults: { ...labForm.value, labStatus: 'Accepted' },
    distribution: finalDist,
    totalPhysicalVolume: totalVolume.value
  };

  const result = await store.saveLabAnalysis(payload);
  if (result) emit('update:isOpen', false);
};

watch(() => props.isOpen, (newVal) => { if (newVal) initDistribution(); });

const filteredCatalog = computed(() => {
  if (activeCategory.value === 'all') return productCatalog;
  return { [activeCategory.value]: productCatalog[activeCategory.value] };
});
</script>

<template>
  <Modal 
    :model-value="isOpen" 
    @update:model-value="emit('update:isOpen', $event)"
    title="Laboratoriya Nazorati & Taqsimot"
    icon="fa-solid fa-microscope"
    width="max-w-7xl"
  >
    <div class="flex flex-col gap-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col justify-between shadow-xl ring-1 ring-white/10">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-blue-400 text-[10px] font-black uppercase tracking-widest">Umumiy Hajm</span>
              <div class="text-5xl font-black mt-1 tabular-nums">{{ totalVolume.toLocaleString() }} <span class="text-xl text-slate-500 font-medium">L</span></div>
            </div>
            <div class="text-right">
              <span class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Qolgan Hajm</span>
              <div class="text-3xl font-black mt-1 tabular-nums" :class="remainingVolume > 0 ? 'text-amber-400' : 'text-slate-500'">
                {{ remainingVolume.toLocaleString() }} L
              </div>
            </div>
          </div>
          <div class="mt-8">
            <div class="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-tighter">
              <span>Taqsimot jarayoni</span>
              <span>{{ ((distributedSum / totalVolume) * 100).toFixed(1) }}%</span>
            </div>
            <div class="h-4 bg-white/5 rounded-full p-1 border border-white/10">
              <div class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                   :style="{ width: (distributedSum / totalVolume) * 100 + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="bg-indigo-600 rounded-[2rem] p-6 text-white flex flex-col justify-center items-center text-center shadow-lg shadow-indigo-500/30">
          <i class="fa-solid fa-vial-circle-check text-4xl mb-3 opacity-50"></i>
          <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Sifat Ko'rsatkichi</p>
          <h4 class="text-2xl font-black">{{ labForm.quality }}</h4>
          <div class="mt-4 px-4 py-2 bg-white/10 rounded-xl text-[10px] font-bold">
            Standart: GOST 31449-2013
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside class="lg:col-span-3 space-y-4">
          <div class="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Analiz Parametrlari</h4>
            <div class="space-y-4">
              <Input v-model="labForm.fat" label="Yog'lilik %" type="number" :min="norms.fat.min" :max="norms.fat.max" step="0.1" icon-pre="fa-solid fa-droplet" />
              <Input v-model="labForm.density" label="Zichlik" type="number" :min="norms.density.min" :max="norms.density.max" step="0.001" icon-pre="fa-solid fa-gauge-high" />
              <Input v-model="labForm.acidity" label="Kislotalilik °T" type="number" :min="norms.acidity.min" :max="norms.acidity.max" icon-pre="fa-solid fa-flask" />
              <Input v-model="labForm.acidity" label="Suv %" type="number" :min="norms.acidity.min" :max="norms.acidity.max" icon-pre="fa-solid fa-flask" />
              <Select v-model="labForm.quality" label="Sut Navini Tasdiqlash" 
                :options="[{label:'Oliy nav', value:'Oliy nav'}, {label:'1-nav', value:'Birinchi nav'}, {label:'Texnik', value:'Ikkinchi nav'}]" />
            </div>
          </div>
        </aside>

        <section class="lg:col-span-9 flex flex-col gap-4">
          <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button @click="activeCategory = 'all'" 
              :class="activeCategory === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
              class="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Hammasi</button>
            <button v-for="(_, cat) in productCatalog" :key="cat" @click="activeCategory = cat" 
              :class="activeCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
              class="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">{{ cat }}</button>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 max-h-[450px] overflow-y-auto custom-scrollbar">
            <div v-for="(types, category) in filteredCatalog" :key="category" class="mb-8 last:mb-0">
              <div class="flex items-center gap-3 mb-4">
                <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                <h5 class="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">{{ category }}</h5>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div v-for="type in types" :key="type" 
                     class="p-4 rounded-3xl border-2 transition-all group"
                     :class="labForm.distribution[type] > 0 ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-500/5' : 'border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'">
                  
                  <div class="flex justify-between items-start mb-3">
                    <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{{ type }}</span>
                    <div class="flex gap-1">
                      <button @click="setAllToType(type)" title="Hammasini yo'naltirish" class="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                        <i class="fa-solid fa-bolt-lightning text-[8px]"></i>
                      </button>
                      <button v-if="remainingVolume > 0" @click="labForm.distribution[type] += remainingVolume" class="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                        <i class="fa-solid fa-plus text-[8px]"></i>
                      </button>
                    </div>
                  </div>

                  <div class="relative">
                    <input v-model.number="labForm.distribution[type]" @input="validateInput(type)" type="number" 
                           class="w-full bg-white dark:bg-slate-950 border-none rounded-xl px-4 py-2 text-lg font-black text-blue-600 tabular-nums focus:ring-2 focus:ring-blue-500/20" placeholder="0.00" />
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">LITR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-4">
          <div v-if="!isDistValid" class="flex items-center gap-2 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-800">
            <i class="fa-solid fa-triangle-exclamation text-xs animate-bounce"></i>
            <span class="text-[10px] font-black uppercase tracking-widest">Taqsimot xato: {{ remainingVolume }} L farq</span>
          </div>
          <div v-else class="flex items-center gap-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 transition-all scale-105 shadow-sm">
            <i class="fa-solid fa-check-circle text-xs"></i>
            <span class="text-[10px] font-black uppercase tracking-widest">Hajm mukammal taqsimlandi</span>
          </div>
        </div>

        <div class="flex gap-3">
          <Button @click="emit('update:isOpen', false)" variant="danger" left-icon="fas fa-xmark" size="sm">Yopish</Button>
          <Button @click="handleConfirm" :disabled="!isDistValid || store.isSubmitting" variant="primary" left-icon="fas fa-check" size="sm">
            Saqlash
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-200 dark:bg-slate-700 rounded-full; }
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
</style>