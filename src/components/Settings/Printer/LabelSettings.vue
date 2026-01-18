<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { PricePrinterTemplateStore } from '../../../stores/Settings/printer/pricePrinter.store';

const store = PricePrinterTemplateStore();

// --- PROFESSIONAL STANDARTLAR (96 DPI) ---
const MM_TO_PX = 3.7795275591; // 1mm ni ekrandagi piksellarga o'girish koeffitsienti

// --- REAKTIV HOLAT ---
const isEditing = ref(false);
const activeTab = ref('canvas'); 
const activeElementId = ref(null);
const showSettingsDrawer = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);

// --- UTIL FUNKSIYALAR ---
const toPx = (mm) => mm * MM_TO_PX;
const toMm = (px) => px / MM_TO_PX;
const handleResize = () => { windowWidth.value = window.innerWidth; };

// --- COMPUTED ---
const templates = computed(() => store.templates);
const currentTemplate = computed(() => {
  return store.currentTemplate || { _id: null, name: 'Yangi shablon', width: 40, height: 30, elements: [] };
});
const activeElement = computed(() => {
  if (!currentTemplate.value.elements) return null;
  return currentTemplate.value.elements.find(el => el.id === activeElementId.value);
});

// --- ELEMENT TURLARI (MM LARDA) ---
const ELEMENT_TYPES = {
  name: { v: 'MAHSULOT NOMI', w: 30, h: 6, fs: 3.5, icon: 'fa-font' },
  fullname: { v: 'Mahsulot haqida batafsil ma\'lumot va tarkibi', w: 35, h: 10, fs: 2.5, icon: 'fa-align-left' },
  price: { v: '150,000', w: 25, h: 10, fs: 8, icon: 'fa-tag' },
  qr: { v: 'https://gemini.uz', w: 10, h: 10, fs: null, icon: 'fa-qrcode' },
  quantity: { v: '1 dona', w: 15, h: 5, fs: 3, icon: 'fa-boxes-stacked' },
  barcode: { v: '1234567890', w: 30, h: 10, fs: null, icon: 'fa-barcode' }
};

const addElement = (type) => {
  if (!currentTemplate.value.elements) currentTemplate.value.elements = [];
  const conf = ELEMENT_TYPES[type];
  const newId = `el_${Date.now()}`;
  
  currentTemplate.value.elements.push({
    id: newId,
    type,
    value: conf.v,
    x: 2.00, y: 2.00, // Standart 2mm chekinish
    w: conf.w, h: conf.h, 
    fontSize: conf.fs || null,
    zIndex: currentTemplate.value.elements.length + 10
  });
  activeElementId.value = newId;
};

// --- DRAG & RESIZE LOGIKASI (ANTO-PADDING & MM PRECISION) ---
const handleAction = (el, mode, event) => {
  if (!isEditing.value) return;
  activeElementId.value = el.id;
  
  const maxZ = currentTemplate.value.elements.reduce((max, e) => Math.max(max, e.zIndex || 0), 10);
  el.zIndex = maxZ + 1;

  const isTouch = event.type.startsWith('touch');
  const startClientX = isTouch ? event.touches[0].clientX : event.clientX;
  const startClientY = isTouch ? event.touches[0].clientY : event.clientY;

  const initialX = parseFloat(el.x);
  const initialY = parseFloat(el.y);
  const initialW = parseFloat(el.w);
  const initialH = parseFloat(el.h);

  const onMove = (e) => {
    if (e.cancelable) e.preventDefault();
    const currentClientX = isTouch ? e.touches[0].clientX : e.clientX;
    const currentClientY = isTouch ? e.touches[0].clientY : e.clientY;

    const dx = toMm(currentClientX - startClientX);
    const dy = toMm(currentClientY - startClientY);

    if (mode === 'move') {
      el.x = Number((initialX + dx).toFixed(2)); // 0.01 mm aniqlik
      el.y = Number((initialY + dy).toFixed(2));
    } else if (mode === 'resize') {
      el.w = Number(Math.max(1, initialW + dx).toFixed(2));
      el.h = Number(Math.max(1, initialH + dy).toFixed(2));
    }
  };

  const onEnd = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  };

  document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onMove, { passive: false });
  document.addEventListener(isTouch ? 'touchend' : 'mouseup', onEnd);
};

const selectTemplate = (temp) => {
  store.currentTemplate = JSON.parse(JSON.stringify(temp));
  if (windowWidth.value < 768) activeTab.value = 'canvas';
};

const handleSave = async () => {
  const payload = JSON.parse(JSON.stringify(currentTemplate.value));
  const success = await store.saveTemplate(payload);
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
  <div class="flex flex-col md:flex-row h-screen bg-[#F1F5F9] dark:bg-[#0B0E14] overflow-hidden font-sans select-none">
    
    <aside :class="['w-full md:w-80 bg-white dark:bg-[#151C2C] border-r dark:border-white/5 flex flex-col z-20', activeTab === 'list' ? 'flex' : 'hidden md:flex']">
      <div class="p-6 border-b dark:border-white/5 flex justify-between items-center">
        <h2 class="text-[10px] font-black uppercase tracking-widest text-slate-400">Shablonlar</h2>
        <button @click="store.openTemplateModal()" class="w-8 h-8 bg-indigo-600 text-white rounded-lg active:scale-95 transition">
          <i class="fa-solid fa-plus text-[10px]"></i>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
        <div v-for="temp in templates" :key="temp._id" @click="selectTemplate(temp)"
          :class="['p-4 rounded-xl border-2 transition-all cursor-pointer', currentTemplate._id === temp._id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-transparent bg-slate-50 dark:bg-white/5']">
          <p class="text-[11px] font-black dark:text-white uppercase truncate italic">{{ temp.name || 'Nomsiz' }}</p>
          <p class="text-[9px] text-slate-400 font-bold uppercase">{{ temp.width }}x{{ temp.height }} mm</p>
        </div>
      </div>
    </aside>

    <main :class="['flex-1 flex flex-col relative', activeTab === 'canvas' ? 'flex' : 'hidden md:flex']">
      <header class="h-16 border-b dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#0B0E14] z-20">
        <div class="flex items-center gap-4">
          <button @click="activeTab = 'list'" class="md:hidden text-slate-400"><i class="fa-solid fa-bars"></i></button>
          <input v-model="currentTemplate.name" :disabled="!isEditing" class="bg-transparent border-none text-xs font-black dark:text-white focus:ring-0 p-0 w-48 uppercase italic">
        </div>
        <div class="flex items-center gap-3">
          <button v-if="isEditing" @click="showSettingsDrawer = true" class="text-[10px] font-black text-indigo-500 uppercase px-3 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
            {{ currentTemplate.width }}x{{ currentTemplate.height }} mm
          </button>
          <button @click="isEditing ? handleSave() : isEditing = true" 
            :class="isEditing ? 'bg-emerald-500' : 'bg-indigo-600'" 
            class="px-6 py-2 rounded-lg text-white text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-lg">
            {{ isEditing ? 'Saqlash' : 'Tahrirlash' }}
          </button>
        </div>
      </header>

      <transition name="pop">
        <div v-if="isEditing" class="absolute left-6 top-24 flex flex-col gap-3 z-30">
          <button v-for="(conf, type) in ELEMENT_TYPES" :key="type" @click="addElement(type)" 
            class="w-11 h-11 bg-white dark:bg-[#151C2C] rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white text-slate-400 shadow-xl border dark:border-white/10 active:scale-90 transition">
            <i :class="['fa-solid text-sm', conf.icon]"></i>
          </button>
        </div>
      </transition>

      <div class="flex-1 flex items-center justify-center p-10 overflow-auto bg-[#F8FAFC] dark:bg-[#0B0E14] relative">
        <div class="relative bg-white shadow-2xl overflow-hidden border dark:border-white/5" 
          :style="{ 
            width: toPx(currentTemplate.width) + 'px', 
            height: toPx(currentTemplate.height) + 'px',
            minWidth: toPx(currentTemplate.width) + 'px'
          }">
          
          <div v-for="el in currentTemplate.elements" :key="el.id"
            class="absolute box-border flex items-center justify-center pointer-events-auto"
            :class="[
                isEditing ? 'hover:outline hover:outline-1 hover:outline-indigo-300' : '', 
                activeElementId === el.id && isEditing ? 'z-[100] outline outline-1 outline-indigo-600' : ''
            ]"
            :style="{ 
                left: toPx(el.x) + 'px', 
                top: toPx(el.y) + 'px', 
                width: toPx(el.w) + 'px', 
                height: toPx(el.h) + 'px', 
                zIndex: el.zIndex || 10 
            }"
            @mousedown.stop="handleAction(el, 'move', $event)" 
            @touchstart.stop.passive="handleAction(el, 'move', $event)">
            
            <div class="w-full h-full flex items-center justify-center pointer-events-none leading-none">
              <p v-if="['name', 'fullname', 'price', 'quantity'].includes(el.type)" 
                :style="{ fontSize: toPx(el.fontSize) + 'px', lineHeight: '1', padding: '0', margin: '0' }" 
                :class="['text-black w-full text-center tracking-tighter', el.type === 'fullname' ? 'font-medium break-words' : 'font-black truncate uppercase']">
                {{ el.value }}
              </p>
              
              <i v-else-if="el.type === 'qr'" 
                 class="fa-solid fa-qrcode text-black" 
                 :style="{ fontSize: toPx(Math.min(el.w, el.h)) + 'px' }"></i>

              <i v-else-if="el.type === 'barcode'" 
                 class="fa-solid fa-barcode text-black w-full text-center" 
                 :style="{ fontSize: toPx(el.h) + 'px' }"></i>
            </div>

            <div v-if="isEditing && activeElementId === el.id" 
                 class="absolute -right-1 -bottom-1 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white z-[110] cursor-nwse-resize shadow-md"
                 @mousedown.stop.prevent="handleAction(el, 'resize', $event)" 
                 @touchstart.stop.prevent="handleAction(el, 'resize', $event)">
            </div>
          </div>

          <div v-if="isEditing" class="absolute inset-0 pointer-events-none grid-mm opacity-40"></div>
        </div>
      </div>
    </main>

    <aside :class="['w-full md:w-80 bg-white dark:bg-[#151C2C] border-l dark:border-white/5 p-6 z-40', 
      (activeElement && isEditing && activeTab === 'props') || (activeElement && isEditing && windowWidth >= 768) ? 'flex' : 'hidden md:flex flex-col']">
      
      <div v-if="activeElement && isEditing" class="w-full space-y-6">
        <div class="flex justify-between items-center pb-4 border-b dark:border-white/5">
          <span class="text-[10px] font-black text-slate-400 uppercase italic">Koordinatalar (MM)</span>
          <button @click="currentTemplate.elements = currentTemplate.elements.filter(e => e.id !== activeElementId)" class="text-rose-500 active:scale-90 transition">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
            <label class="text-[9px] font-black text-slate-400 block mb-2 uppercase italic">Mazmuni</label>
            <input v-model="activeElement.value" class="w-full bg-transparent border-none p-0 text-sm font-bold dark:text-white focus:ring-0">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div v-for="p in ['x', 'y', 'w', 'h']" :key="p" class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-transparent focus-within:border-indigo-500/50">
              <label class="text-[9px] font-black text-slate-400 block mb-1 uppercase italic">{{ p === 'x' ? 'Chap' : p === 'y' ? 'Tepa' : p === 'w' ? 'Eni' : 'Bo\'yi' }} (mm)</label>
              <input type="number" v-model.number="activeElement[p]" step="0.01" class="w-full bg-transparent border-none p-0 text-xs font-black dark:text-white focus:ring-0">
            </div>
          </div>

          <div v-if="activeElement.fontSize" class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
             <label class="text-[9px] font-black text-slate-400 block mb-2 uppercase italic">Shrift: {{ activeElement.fontSize }} mm</label>
             <input type="range" v-model.number="activeElement.fontSize" min="1" max="25" step="0.1" class="w-full accent-indigo-600">
          </div>
        </div>
        <button @click="activeTab = 'canvas'" class="md:hidden w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase">Dizaynga Qaytish</button>
      </div>

      <div v-else class="h-full flex flex-col items-center justify-center opacity-25 text-center space-y-4">
        <i class="fa-solid fa-mouse-pointer text-4xl"></i>
        <p class="text-[10px] font-black uppercase tracking-widest leading-loose italic">Elementni tanlang <br> (MM o'lchov tizimi)</p>
      </div>
    </aside>

    <div v-if="showSettingsDrawer" class="fixed inset-0 z-[100] flex justify-end">
      <div @click="showSettingsDrawer = false" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      <div class="relative w-full max-w-sm h-full bg-white dark:bg-[#151C2C] p-8 flex flex-col border-l dark:border-white/5 animate-slide-left">
        <h2 class="text-xs font-black uppercase italic mb-10 dark:text-white tracking-widest">Etiketka O'lchami (MM)</h2>
        <div class="space-y-6 flex-1">
          <div v-for="dim in [{l:'Eni (mm)', v:'width'}, {l:'Bo\'yi (mm)', v:'height'}]" :key="dim.v" class="bg-slate-50 dark:bg-white/5 p-8 rounded-3xl">
            <label class="text-[10px] font-black text-slate-400 block mb-4 uppercase tracking-widest">{{ dim.l }}</label>
            <input type="number" v-model.number="currentTemplate[dim.v]" class="w-full bg-transparent border-none p-0 text-5xl font-black dark:text-white focus:ring-0">
          </div>
        </div>
        <button @click="showSettingsDrawer = false" class="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-2xl active:scale-95 transition">Tasdiqlash</button>
      </div>
    </div>

    <nav class="md:hidden h-20 bg-white dark:bg-[#151C2C] border-t dark:border-white/5 flex items-center justify-around z-50 fixed bottom-0 left-0 right-0">
      <button v-for="t in [{id:'list', i:'fa-list'}, {id:'canvas', i:'fa-palette'}, {id:'props', i:'fa-sliders'}]" :key="t.id"
        @click="activeTab = t.id" :class="activeTab === t.id ? 'text-indigo-600' : 'text-slate-400'" class="flex flex-col items-center gap-1">
        <i :class="['fa-solid text-lg', t.i]"></i>
      </button>
    </nav>
  </div>
</template>

<style scoped>
/* Professional Precision Grid: 1mm dots, 10mm lines */
.grid-mm {
  background-image: 
    radial-gradient(circle, #cbd5e1 0.5px, transparent 0.5px),
    linear-gradient(to right, #e2e8f0 1px, transparent 1px),
    linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
  background-size: 3.779px 3.779px, 37.79px 37.79px, 37.79px 37.79px;
  background-position: center;
}

.custom-scroll::-webkit-scrollbar { width: 3px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 10px; }

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

input[type="range"] { -webkit-appearance: none; height: 4px; border-radius: 10px; background: #e2e8f0; }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: #6366f1; border-radius: 50%; cursor: pointer; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.1); }

@media (max-width: 767px) { 
  main, aside { height: calc(100vh - 80px); padding-bottom: 80px; } 
}
@media print {
  @page {
    margin: 0; /* Brauzerning standart chekinishini o'chirish */
    size: auto; 
  }
  body {
    margin: 0;
  }
  /* Faqat shablonni o'zini chiqarish, qolgan hamma narsani yashirish */
  aside, nav, header, .tools-panel {
    display: none !important;
  }
  .canvas-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}
</style>