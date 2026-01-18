<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { PricePrinterTemplateStore } from '../../../stores/Settings/printer/pricePrinter.store';

const store = PricePrinterTemplateStore();

// --- REAKTIV O'ZGARUVCHILAR ---
const MM_TO_PX = 3.78; 
const isEditing = ref(false);
const activeTab = ref('canvas'); 
const activeElementId = ref(null);
const showSettingsDrawer = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);

// --- KONVERTATSIYA ---
const toPx = (mm) => mm * MM_TO_PX;
const toMm = (px) => px / MM_TO_PX;

// --- EKRAN O'LCHAMINI KUZATISH ---
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// --- COMPUTED ---
const templates = computed(() => store.templates);
const currentTemplate = computed(() => {
  return store.currentTemplate || { name: '', width: 40, height: 30, elements: [] };
});
const activeElement = computed(() => {
  return currentTemplate.value.elements.find(el => el.id === activeElementId.value);
});

// --- ELEMENT QO'SHISH ---
const addElement = (type) => {
  const configs = {
    name: { v: 'Mahsulot nomi', w: 30, h: 6, fs: 3.5 },
    fullname: { v: 'Sarvar Aliyev', w: 35, h: 12, fs: 2.8 },
    price: { v: '12,500', w: 25, h: 10, fs: 7 },
    qr: { v: 'https://gemini.uz', w: 12, h: 12, fs: null },
    quantity: { v: '1 dona', w: 15, h: 5, fs: 3 },
    barcode: { v: '123456789012', w: 30, h: 10, fs: null }
  };
  const conf = configs[type];
  const newId = 'e' + Date.now();
  
  currentTemplate.value.elements.push({
    id: newId,
    value: conf.v,
    x: 2, y: 2, 
    w: conf.w, h: conf.h, 
    fontSize: conf.fs, 
    type: type
  });
  activeElementId.value = newId;
};

// --- DRAG & RESIZE ---
const handleAction = (el, mode, event) => {
  if (!isEditing.value) return;
  activeElementId.value = el.id;
  
  const isTouch = event.type.startsWith('touch');
  const startX = isTouch ? event.touches[0].clientX : event.clientX;
  const startY = isTouch ? event.touches[0].clientY : event.clientY;

  const initialX = el.x;
  const initialY = el.y;
  const initialW = el.w;
  const initialH = el.h;

  const onMove = (e) => {
    if (e.cancelable) e.preventDefault();
    const currentX = isTouch ? e.touches[0].clientX : e.clientX;
    const currentY = isTouch ? e.touches[0].clientY : e.clientY;

    const dx = toMm(currentX - startX);
    const dy = toMm(currentY - startY);

    if (mode === 'move') {
      el.x = Number((initialX + dx).toFixed(1));
      el.y = Number((initialY + dy).toFixed(1));
    } else if (mode === 'resize') {
      el.w = Math.max(2, Number((initialW + dx).toFixed(1)));
      el.h = Math.max(2, Number((initialH + dy).toFixed(1)));
    }
  };

  const onEnd = () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onEnd);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onEnd);
  };

  if (isTouch) {
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  } else {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
  }
};

const selectTemplate = (temp) => {
  store.currentTemplate = temp;
  if (windowWidth.value < 768) activeTab.value = 'canvas';
};

const handleSave = async () => {
  const success = await store.saveTemplate(currentTemplate.value);
  if (success) isEditing.value = false;
};

onMounted(() => {
  store.GetAll();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="flex flex-col md:flex-row h-screen bg-[#F4F7FE] dark:bg-[#0B0E15] overflow-hidden font-sans select-none rounded-md">
    
    <aside :class="['w-full md:w-80 bg-white dark:bg-[#111C44] border-r dark:border-white/5 flex flex-col z-20', activeTab === 'list' ? 'flex flex-1' : 'hidden md:flex']">
      <div class="p-6 flex justify-between items-center border-b dark:border-white/5">
        <h2 class="text-[10px] font-black uppercase tracking-widest text-slate-400">Shablonlar</h2>
        <button @click="store.openTemplateModal()" class="w-10 h-10 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-90 transition-all">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
        <div v-for="temp in templates" :key="temp._id" @click="selectTemplate(temp)"
          :class="['p-5 rounded-[2rem] border-2 transition-all cursor-pointer', currentTemplate._id === temp._id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-transparent bg-slate-50 dark:bg-white/5']">
          <p class="text-sm font-black dark:text-white truncate">{{ temp.name || 'Nomsiz' }}</p>
          <p class="text-[10px] text-slate-400 font-bold uppercase mt-1">{{ temp.width }}x{{ temp.height }} mm</p>
        </div>
      </div>
    </aside>

    <main :class="['flex-1 flex flex-col relative bg-[#F4F7FE] dark:bg-[#0B0E15]', activeTab === 'canvas' ? 'flex' : 'hidden md:flex']">
      <header class="h-20 border-b dark:border-white/5 flex items-center justify-between px-6 md:px-10 bg-white/80 dark:bg-black/40 backdrop-blur-2xl z-20">
        <div class="flex items-center gap-4">
          <button @click="activeTab = 'list'" class="md:hidden text-slate-500"><i class="fa-solid fa-chevron-left"></i></button>
          <div class="flex flex-col">
            <input v-model="currentTemplate.name" class="bg-transparent border-none text-sm font-black dark:text-white focus:ring-0 p-0 w-32 md:w-64 uppercase tracking-tighter truncate">
            <button v-if="isEditing" @click="showSettingsDrawer = true" class="text-[10px] font-black text-indigo-600 uppercase text-left hover:underline">O'lcham: {{ currentTemplate.width }}x{{ currentTemplate.height }}mm</button>
          </div>
        </div>
        <button @click="isEditing ? handleSave() : isEditing = true" :class="isEditing ? 'bg-emerald-500' : 'bg-indigo-600'" class="px-6 md:px-10 py-3 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl">
          {{ isEditing ? 'Saqlash' : 'Tahrirlash' }}
        </button>
      </header>

      <div v-if="isEditing" class="absolute left-4 md:left-8 top-28 flex md:flex-col gap-3 z-30">
        <button v-for="t in ['name', 'fullname', 'price', 'qr', 'quantity', 'barcode']" :key="t" @click="addElement(t)" 
          class="w-12 h-12 bg-white dark:bg-[#111C44] rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white text-slate-400 shadow-2xl border dark:border-white/10 active:scale-90 transition-all">
          <i :class="['fa-solid text-base', t==='name'?'fa-font':t==='fullname'?'fa-align-left':t==='price'?'fa-tag':t==='qr'?'fa-qrcode':t==='quantity'?'fa-boxes-stacked':'fa-barcode']"></i>
        </button>
      </div>

      <div class="flex-1 flex items-center justify-center p-6 md:p-12 overflow-auto relative bg-grid">
        <div class="relative bg-white shadow-2xl transition-all duration-300 rounded-lg" 
          :style="{ width: toPx(currentTemplate.width) + 'px', height: toPx(currentTemplate.height) + 'px' }">
          
          <div v-for="el in currentTemplate.elements" :key="el.id"
            class="absolute group flex items-center justify-center touch-none overflow-hidden"
            :class="[isEditing ? 'cursor-move ring-1 ring-transparent hover:ring-indigo-300' : '', activeElementId === el.id && isEditing ? 'z-30 ring-2 ring-indigo-500' : 'z-10']"
            :style="{ left: toPx(el.x) + 'px', top: toPx(el.y) + 'px', width: toPx(el.w) + 'px', height: toPx(el.h) + 'px' }"
            @mousedown="handleAction(el, 'move', $event)" @touchstart.stop.passive="handleAction(el, 'move', $event)">
            
            <div class="w-full text-center px-1 pointer-events-none">
              <p v-if="['name', 'fullname', 'price', 'quantity'].includes(el.type)" 
                :style="{ fontSize: toPx(el.fontSize) + 'px' }" 
                :class="['text-black leading-tight', el.type === 'fullname' ? 'font-medium break-words text-left' : 'font-black truncate']">
                {{ el.value }}
              </p>
              <i v-else-if="el.type === 'qr'" class="fa-solid fa-qrcode text-black" :style="{ fontSize: toPx(el.h * 0.8) + 'px' }"></i>
              <i v-else-if="el.type === 'barcode'" class="fa-solid fa-barcode text-black" :style="{ fontSize: toPx(el.h * 0.7) + 'px' }"></i>
            </div>

            <div v-if="isEditing" class="absolute -right-1 -bottom-1 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center text-white z-50 cursor-nwse-resize opacity-0 group-hover:opacity-100"
                 :class="{'opacity-100': activeElementId === el.id}"
                 @mousedown.stop.prevent="handleAction(el, 'resize', $event)" 
                 @touchstart.stop.prevent="handleAction(el, 'resize', $event)">
            </div>
          </div>
        </div>
      </div>
    </main>

    <aside :class="['w-full md:w-80 bg-white dark:bg-[#111C44] border-l dark:border-white/5 p-6 z-40', 
      (activeElement && isEditing && activeTab === 'props') || (activeElement && isEditing && windowWidth >= 768) ? 'flex flex-col' : 'hidden md:flex flex-col']">
      <div v-if="activeElement && isEditing" class="space-y-6">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sozlamalar</span>
          <button @click="currentTemplate.elements = currentTemplate.elements.filter(e => e.id !== activeElementId)" class="w-10 h-10 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-2xl active:scale-90"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        <div class="space-y-4 overflow-y-auto custom-scroll pr-1 pb-20 md:pb-0">
          <div class="bg-slate-50 dark:bg-black/20 p-4 rounded-3xl">
            <label class="text-[9px] font-black text-slate-400 block mb-1 uppercase">Matn</label>
            <textarea v-if="activeElement.type === 'fullname'" v-model="activeElement.value" class="w-full bg-transparent border-none p-0 text-sm font-bold dark:text-white focus:ring-0 resize-none h-20"></textarea>
            <input v-else v-model="activeElement.value" class="w-full bg-transparent border-none p-0 text-sm font-bold dark:text-white focus:ring-0">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="p in ['x', 'y', 'w', 'h']" :key="p" class="bg-slate-50 dark:bg-black/20 p-4 rounded-3xl">
              <label class="text-[9px] font-black text-slate-400 block mb-1 uppercase">{{ p }} (mm)</label>
              <input type="number" v-model.number="activeElement[p]" step="0.1" class="w-full bg-transparent border-none p-0 text-sm font-bold dark:text-white focus:ring-0">
            </div>
          </div>
          <div v-if="activeElement.fontSize" class="bg-slate-50 dark:bg-black/20 p-4 rounded-3xl">
             <label class="text-[9px] font-black text-slate-400 block mb-2 uppercase">Shrift: {{ activeElement.fontSize }}mm</label>
             <input type="range" v-model.number="activeElement.fontSize" min="1" max="15" step="0.1" class="w-full accent-indigo-600">
          </div>
        </div>
        <button @click="activeTab = 'canvas'" class="md:hidden w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase">Dizaynga qaytish</button>
      </div>
      <div v-else class="h-full flex flex-col items-center justify-center opacity-30 text-center">
        <i class="fa-solid fa-fingerprint text-4xl mb-4"></i>
        <p class="text-[10px] font-black uppercase tracking-widest">Elementni <br> tanlang</p>
      </div>
    </aside>

    <nav class="md:hidden h-20 bg-white dark:bg-[#111C44] border-t dark:border-white/5 flex items-center justify-around z-50 fixed bottom-0 left-0 right-0">
      <button v-for="t in [{id:'list', i:'fa-list', n:'Katalog'}, {id:'canvas', i:'fa-palette', n:'Dizayn'}, {id:'props', i:'fa-sliders', n:'Sozlash'}]" :key="t.id"
        @click="activeTab = t.id" :class="activeTab === t.id ? 'text-indigo-600' : 'text-slate-400'" class="flex flex-col items-center gap-1 transition-all">
        <i :class="['fa-solid text-sm', t.i]"></i>
        <span class="text-[8px] font-black uppercase">{{ t.n }}</span>
      </button>
    </nav>

    <div v-if="showSettingsDrawer" class="fixed inset-0 z-[100] flex justify-end">
      <div @click="showSettingsDrawer = false" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative w-80 h-full bg-white dark:bg-[#111C44] p-8 flex flex-col border-l dark:border-white/5 animate-slide-left">
        <h2 class="text-xs font-black uppercase mb-10 dark:text-white">O'lchamlar</h2>
        <div class="space-y-8 flex-1">
          <div v-for="dim in [{l:'Eni', v:'width'}, {l:'Bo\'yi', v:'height'}]" :key="dim.v" class="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem]">
            <label class="text-[10px] font-black text-slate-400 block mb-3 uppercase">{{ dim.l }} (mm)</label>
            <input type="number" v-model.number="currentTemplate[dim.v]" class="w-full bg-transparent border-none p-0 text-3xl font-black dark:text-white focus:ring-0">
          </div>
        </div>
        <button @click="showSettingsDrawer = false" class="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase shadow-2xl">OK</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
.animate-slide-left { animation: slideLeft 0.4s cubic-bezier(0,0,0.2,1); }
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #6366f133; border-radius: 10px; }
input[type="number"]::-webkit-inner-spin-button { display: none; }
.bg-grid { background-image: radial-gradient(#6366f111 1.5px, transparent 1.5px); background-size: 24px 24px; }
@media (max-width: 767px) { main, aside { height: calc(100vh - 80px); padding-bottom: 80px; } }
</style>