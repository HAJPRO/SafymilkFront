<!-- <script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import socketService from '../../../socket/socket';
import { PricePrinterTemplateStore } from '../../../stores/Settings/printer/pricePrinter.store';
import AppSelect from '../../../UI/Select.vue';

const store = PricePrinterTemplateStore();

// --- O'zgaruvchilar ---
const storeId = ref("DESKTOP-GAK0OLA");
const isOnline = ref(false);
const printers = ref([]); 
const retryInterval = ref(null);

// --- Computed properties ---
const labelPrinter = computed({
  get: () => store.settings.labelPrinter,
  set: (val) => store.updateSettings({ labelPrinter: val })
});
// (Qolgan computedlarni ham shunday davom ettiring...)

onMounted(() => {
  store.loadSettings();
  
  // 1. Socket ulanishini boshlash
  socketService.connect();

  // 2. Listenerlarni o'rnatish (Faqat socketService orqali)
  socketService.on("connect", () => {
    console.log("Socket ulandi 🌐. ID:", socketService.socket?.id);
    
    socketService.emit("AGENT:JOIN", storeId.value);
    
    const wakeup = () => {
      if (!isOnline.value) {
        console.log("Agentdan printerlarni so'rayapman...");
        socketService.emit("SERVER:GET_PRINTERS", { storeId: storeId.value });
      }
    };

    wakeup(); 
    if (retryInterval.value) clearInterval(retryInterval.value);
    retryInterval.value = setInterval(wakeup, 3000); 
  });

  socketService.on("FRONTEND:UPDATE_PRINTERS", (list) => {
    console.log("Agentdan printerlar keldi ✅", list);
    isOnline.value = true;
    printers.value = list;
    
    if (retryInterval.value) {
      clearInterval(retryInterval.value);
      retryInterval.value = null;
    }
  });

  socketService.on("FRONTEND:AGENT_OFFLINE", (id) => {
    if(id === storeId.value) {
      isOnline.value = false;
      console.log("Agent o'chdi ❌");
    }
  });

  socketService.on("disconnect", () => {
    isOnline.value = false;
    console.log("Server bilan aloqa uzildi ⚠️");
  });
});

onUnmounted(() => {
  if (retryInterval.value) clearInterval(retryInterval.value);
  
  // Tozalashda ham socketService'dan foydalanamiz
  socketService.off("FRONTEND:UPDATE_PRINTERS");
  socketService.off("FRONTEND:AGENT_OFFLINE");
  socketService.off("connect");
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-2 md:p-6 space-y-8 pb-20 animate-in fade-in duration-700">
    
    <section class="space-y-4">
      <h3 class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
        <i class="fa-solid fa-print text-indigo-500"></i> Printerlar
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-5 bg-white dark:bg-white/[0.03] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
          <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Narx yorlig'i</label>
          <AppSelect v-model="labelPrinter" :options="printers" placeholder="Printer tanlang" />
        </div>
        <div class="p-5 bg-white dark:bg-white/[0.03] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
          <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Chek printeri</label>
          <AppSelect v-model="receiptPrinter" :options="printers" placeholder="Printer tanlang" />
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <h3 class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
        <i class="fa-solid fa-display text-amber-500"></i> Ko'rinish
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-6 bg-white dark:bg-white/[0.03] rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col justify-between h-32">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold">Masshtab</span>
            <span class="text-indigo-500 font-black text-xs">{{ scale }}%</span>
          </div>
          <input type="range" v-model.number="scale" min="50" max="150" class="custom-range w-full">
        </div>

        <div @click="pcMode = !pcMode" class="p-6 bg-white dark:bg-white/[0.03] rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between cursor-pointer group active:scale-95 transition-all">
          <div class="flex flex-col">
            <span class="text-xs font-bold">Kompyuter rejimi</span>
            <span class="text-[10px] text-slate-400 font-bold uppercase">{{ pcMode ? 'Aktiv' : 'Passiv' }}</span>
          </div>
          <div :class="['w-12 h-6 rounded-full relative transition-colors duration-300', pcMode ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700']">
            <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm', pcMode ? 'left-7' : 'left-1']"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="pt-6 border-t dark:border-white/5">
      <div class="p-6 bg-rose-50/50 dark:bg-rose-500/[0.02] border-2 border-dashed border-rose-100 dark:border-rose-500/10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div class="space-y-1">
          <h4 class="text-xs font-black text-rose-500 uppercase tracking-widest">Kritik amallar</h4>
          <p class="text-[10px] text-slate-400 font-medium">Barcha saqlangan lokal sozlamalarni o'chirib yuboradi.</p>
        </div>
        <AppButton @click="store.clearLocalDatabase()" variant="danger" class="w-full md:w-auto !rounded-2xl !px-10 !py-4">
          <i class="fa-solid fa-broom-ball mr-2"></i> Tozalash
        </AppButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.custom-range {
  -webkit-appearance: none;
  height: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  outline: none;
}
.dark .custom-range { background: #1e293b; }
.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #6366f1;
  border-radius: 50%;
  border: 3px solid white;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
</style> -->


<script setup>
import { computed, onMounted,watch } from 'vue';
import { PricePrinterTemplateStore } from '../../../stores/Settings/printer/pricePrinter.store';
import AppSelect from '../../../UI/Select.vue';
import AppButton from '../../../UI/Button.vue';
import { storeToRefs } from "pinia";
const store = PricePrinterTemplateStore();
const { printers } = storeToRefs(store);
watch(printers, (newVal) => {
  console.log("Printers yangilandi:", newVal);
}, { deep: true });
// Store bilan reaktiv bog'lanish
const labelPrinter = computed({
  get: () => store.settings.labelPrinter,
  set: (val) => store.updateSettings({ labelPrinter: val })
});

const receiptPrinter = computed({
  get: () => store.settings.receiptPrinter,
  set: (val) => store.updateSettings({ receiptPrinter: val })
});

const scale = computed({
  get: () => store.settings.scale,
  set: (val) => store.updateSettings({ scale: val })
});

const pcMode = computed({
  get: () => store.settings.pcMode,
  set: (val) => store.updateSettings({ pcMode: val })
});

// const printers = computed(() => store.printers);
console.log(printers);

onMounted(() => {
  store.loadSettings();
  store.fetchPrinters();
});
</script>

<template>
  <div class="max-w-4xl mx-auto p-2 md:p-6 space-y-8 pb-20 animate-in fade-in duration-700">
    
    <section class="space-y-4">
      <h3 @click="store.connectPrinter()" class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
        <i class="fa-solid fa-print text-indigo-500"></i> Printerlar
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-5 bg-white dark:bg-white/[0.03] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
          <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Narx yorlig'i</label>
          <AppSelect v-model="labelPrinter" :options="printers" placeholder="Printer tanlang" />
        </div>
        <div class="p-5 bg-white dark:bg-white/[0.03] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
          <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Chek printeri</label>
          <AppSelect v-model="receiptPrinter" :options="printers" placeholder="Printer tanlang" />
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <h3 @click="store.printSticker({  title: 'SAFY MILK', name: 'Qatiq 0.5L', price: '7,000' })" class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
        <i class="fa-solid fa-display text-amber-500"></i> Ko'rinish
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-6 bg-white dark:bg-white/[0.03] rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col justify-between h-32">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold">Masshtab</span>
            <span class="text-indigo-500 font-black text-xs">{{ scale }}%</span>
          </div>
          <input type="range" v-model.number="scale" min="50" max="150" class="custom-range w-full">
        </div>

        <div @click="pcMode = !pcMode" class="p-6 bg-white dark:bg-white/[0.03] rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between cursor-pointer group active:scale-95 transition-all">
          <div class="flex flex-col">
            <span class="text-xs font-bold">Kompyuter rejimi</span>
            <span class="text-[10px] text-slate-400 font-bold uppercase">{{ pcMode ? 'Aktiv' : 'Passiv' }}</span>
          </div>
          <div :class="['w-12 h-6 rounded-full relative transition-colors duration-300', pcMode ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700']">
            <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm', pcMode ? 'left-7' : 'left-1']"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="pt-6 border-t dark:border-white/5">
      <div class="p-6 bg-rose-50/50 dark:bg-rose-500/[0.02] border-2 border-dashed border-rose-100 dark:border-rose-500/10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div class="space-y-1">
          <h4 class="text-xs font-black text-rose-500 uppercase tracking-widest">Kritik amallar</h4>
          <p class="text-[10px] text-slate-400 font-medium">Barcha saqlangan lokal sozlamalarni o'chirib yuboradi.</p>
        </div>
        <AppButton @click="store.clearLocalDatabase()" variant="danger" class="w-full md:w-auto !rounded-2xl !px-10 !py-4">
          <i class="fa-solid fa-broom-ball mr-2"></i> Tozalash
        </AppButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.custom-range {
  -webkit-appearance: none;
  height: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  outline: none;
}
.dark .custom-range { background: #1e293b; }
.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #6366f1;
  border-radius: 50%;
  border: 3px solid white;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
</style>