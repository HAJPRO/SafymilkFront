<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { storeToRefs } from "pinia"
import { AccessoriesStore } from "../../../stores/Supply/accessories/accessory.store"
import { AccessoriesInputboundStore } from "../../../stores/Supply/accessories/inputinbound.store"
import { CounterpartyStore } from "../../../stores/Supply/counterparty/counterparty.store"
import { useToast } from "../../../UI/utils/useToast"

// UI KOMPONENTLAR
import InputUI from "../../../UI/Input.vue" 
import SelectUI from "../../../UI/Select.vue" 
import BarcodeScannerModal from "../../../components/BarcodeScaner/scaner.vue"

// --- STORE BOSHQARUVI ---
const productStore = AccessoriesStore()
const inputStore = AccessoriesInputboundStore()
const store_counterparty = CounterpartyStore()
const { toast: toastService } = useToast()

const { materials } = storeToRefs(productStore)
const { counterparties } = storeToRefs(store_counterparty)
const { document: inboundDocument, isSubmitting, totalSum } = storeToRefs(inputStore)

// --- LOKAL STATE ---
const isScannerOpen = ref(false)
const mobileTab = ref('catalog')
const productSearch = ref("")
const currentTime = ref("")
const windowWidth = ref(window.innerWidth)
const activeField = ref(null); 

const factories = ref([
  { _id: 'z1', name: 'Markaziy Zavod' },
  { _id: 'z2', name: 'Samarqand Filiali' },
  { _id: 'z3', name: 'Pasterizatsiya Bo\'limi' }
])
// --- WINDOW MONITORING ---
const updateWidth = () => { windowWidth.value = window.innerWidth }
const isMobile = computed(() => windowWidth.value < 1024)
// --- DINAMIK QO'SHISH MANTIQI ---
const addToInbound = (p) => {
  // Mahsulot kategoriyasini aniqlaymiz
  const category = (p.category || 'boshqa').toLowerCase();
  const cartItem = {
    ...p,
    productId: p._id || p.id,
    qty: 1,
    category: category,
    costPrice: p.costPrice || p.lastPurchasePrice || 3800,
    // Turlarga qarab laboratoriya ko'rsatkichlari
    fat: (p.fatContent || 3.6),
    temp:  p.temperature || 0,
    brix: (category.includes('meva') || category.includes('sirop')) ? 12 : null,
    density:  p.density || 0,
  };
  inputStore.addItem(cartItem);
  toastService.success(`${p.name} savatga qo'shildi`);
}
// --- NUMPAD ---
const openNumpad = (item, field, label) => {
  if (!isMobile.value) return; 
  activeField.value = { item, field, label };
};
const handleNumpadPress = (val) => {
  if (!activeField.value) return;
  const { item, field } = activeField.value;
  let currentStr = String(item[field] || "");

  if (val === 'del') {
    currentStr = currentStr.slice(0, -1);
  } else if (val === '.') {
    if (!currentStr.includes('.')) currentStr += ".";
  } else {
    currentStr = (currentStr === "0") ? String(val) : currentStr + String(val);
  }

  const finalValue = currentStr === "" || currentStr === "." ? 0 : Number(currentStr);
  inputStore.updateItem(item.productId, { [field]: finalValue });
};
// --- SEARCH & SCAN ---
const filteredProducts = computed(() => {
  let list = materials.value || []
  if (productSearch.value) {
    const s = productSearch.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(s) || (p.code && p.code.toLowerCase().includes(s)))
  }
  return list
})

const formatPrice = (v) => new Intl.NumberFormat('uz-UZ').format(v || 0) + " UZS"
const processInbound = async () => {
  if(!inboundDocument.value.counterparty) return toastService.error("Fermerni tanlang!");
  if(!inboundDocument.value.warehouse) return toastService.error("Zavodni tanlang!");
  
  const success = await inputStore.saveInput();
  if (success) {
    mobileTab.value = 'catalog';
    toastService.success("Qabul saqlandi!");
  }
}
onMounted(() => {
  window.addEventListener('resize', updateWidth)
  setInterval(() => { currentTime.value = new Date().toLocaleTimeString('uz-UZ') }, 1000)
  store_counterparty.GetAll();
  productStore.GetAll();
})
</script>
<template>
    <div>
  <BarcodeScannerModal v-model="isScannerOpen" @detected="(c) => {/* Skaner logikasi */}" />

  <div class="h-screen w-full bg-[#F8FAFC] dark:bg-[#020617] flex flex-col overflow-hidden">
    
    <header class="h-20 shrink-0 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 z-[60]">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <i class="fa-solid fa-box text-2xl"></i>
        </div>
        <div class="hidden sm:block">
          <h1 class="text-base font-black uppercase tracking-widest dark:text-white">Aksessuar kirim <span class="text-indigo-500">Pos</span></h1>
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Server: {{ currentTime }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button @click="isScannerOpen = true" class="h-12 w-12 md:w-auto md:px-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
          <i class="fa-solid fa-qrcode text-lg"></i>
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <section class="flex-1 p-6 overflow-y-auto custom-scroll" :class="mobileTab === 'catalog' ? 'block' : 'hidden lg:block'">
        <div class="max-w-5xl mx-auto space-y-6">
          <InputUI v-model="productSearch" label="Qidiruv" placeholder="Mahsulot nomi yoki kodi..." icon-pre="fa-solid fa-magnifying-glass" size="md" clearable />

  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
  <div v-for="product in filteredProducts" :key="product._id" 
       @click="addToInbound(product)" 
       class="group relative bg-white dark:bg-slate-900 rounded-[1.8rem] p-1.5 border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-95">
    
    <div class="relative h-32 md:h-36 rounded-[1.5rem] overflow-hidden bg-slate-200 dark:bg-slate-800">
      <img :src="product.image || '/default.png'" 
           class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      
      <div class="absolute top-0 left-0 right-0 p-2 flex flex-col gap-1 bg-gradient-to-b from-black/80 to-transparent">
        <div class="flex justify-between items-center">
          <span class="bg-indigo-600 text-[8px] font-black text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
            {{ product.category || 'Accessory' }}
          </span>
          <span class="text-[9px] font-mono font-bold text-white drop-shadow-md">
            {{ product.code || product._id.slice(-4) }}
          </span>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end">
        <div class="flex flex-col">
          <span class="text-[10px] font-black text-white leading-tight uppercase">{{ product.totalStock || 0 }} {{ product.unit }}</span>
          <span class="text-[7px] font-bold text-slate-300 uppercase tracking-tighter">Omborda</span>
        </div>
        <div v-if="product.volume" class="bg-blue-500 text-white px-1.5 py-0.5 rounded-md border border-blue-400">
          <span class="text-[8px] font-black">{{ product.volume }}{{ product.volumeUnit }} </span>
        </div>
      </div>

      <div v-if="inboundDocument.items.some(i => i.productId === product._id)" 
           class="absolute inset-0 bg-indigo-600/60 backdrop-blur-[2px] flex items-center justify-center z-20">
        <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-2xl">
          <i class="fa-solid fa-check text-xl"></i>
        </div>
      </div>
    </div>

    <div class="p-2">
      <h3 class="text-[11px] font-black dark:text-white uppercase truncate mb-1.5 tracking-tight group-hover:text-indigo-500 transition-colors">
        {{ product.name }}
      </h3>
      <div class="bg-slate-50 dark:bg-slate-800/80 rounded-xl py-1 px-2 border border-slate-100 dark:border-slate-800">
        <div class="flex items-baseline justify-center gap-1">
          <span class="text-[13px] font-black dark:text-slate-100 tabular-nums">
            {{ formatPrice(product.costPrice).split(' ')[0] }}
          </span>
          <span class="text-[8px] font-bold text-slate-400 uppercase">uzs</span>
        </div>
      </div>
    </div>
  </div>
</div>
        </div>
      </section>

      <aside class="w-full lg:w-[480px] bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800 flex flex-col z-40" :class="mobileTab === 'inbound' ? 'block' : 'hidden lg:flex'">
        
       <div class="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
    <div class="w-full">
      <SelectUI 
        v-model="inboundDocument.counterparty" 
        :options="counterparties" 
        label="Yetkazib beruvchi" 
        label-key="fullname" 
        value-key="_id" 
        icon-pre="fa-solid fa-user-tag" 
      />
    </div>

    <div class="w-full">
      <SelectUI 
        v-model="inboundDocument.warehouse" 
        :options="factories" 
        label="Qabul qiluvchi" 
        label-key="name" 
        value-key="_id" 
        icon-pre="fa-solid fa-industry" 
      />
    </div>
  </div>
</div>

      <div class="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scroll">
  <div v-if="!inboundDocument.items.length" class="h-full flex flex-col items-center justify-center opacity-20 italic text-xs dark:text-white">
    <i class="fa-solid fa-cart-flatbed text-4xl mb-3"></i> Savatcha bo'sh...
  </div>

  <div v-for="(item, index) in inboundDocument.items" :key="item.productId" 
       class="group/card relative bg-white dark:bg-slate-900 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 p-3 shadow-sm hover:shadow-md transition-all">
    
    <div class="flex justify-between items-start mb-3">
   <div class="flex items-center gap-3">
  <div class="relative w-12 h-12 flex-shrink-0">
    <div class="w-full h-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
      <img 
        v-if="item.image" 
        :src="item.image" 
        class="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
        @error="(e) => e.target.src = '/default-product.png'"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
        <i :class="item.category.includes('sut') ? 'fa-solid fa-droplet' : 'fa-solid fa-box'" class="text-lg"></i>
      </div>
    </div>
    
    <div class="absolute -top-1.5 -left-1.5 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-[9px] font-black border border-slate-200 dark:border-slate-700 shadow-sm">
      {{ index + 1 }}
    </div>
  </div>

  <div>
    <h4 class="text-[12px] font-black dark:text-white uppercase leading-none mb-1 truncate max-w-[150px]">
      {{ item.name }}
    </h4>
    <div class="flex items-center gap-1.5">
       <span class="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase tracking-tighter">
         {{ item.unit }}
       </span>
       <span class="text-[8px] font-medium text-slate-400 italic">
         #{{ item.category }}
       </span>
    </div>
  </div>
</div>
      <button @click="inputStore.removeItem(item.productId)" class="text-rose-400 hover:text-rose-600 p-1">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    </div>

    <!-- <div v-if="item.type.includes('sut')" class="grid grid-cols-3 gap-1.5 mb-3">
      <div @click="openNumpad(item, 'fat', 'Yog\'lilik')" class="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-transparent text-center cursor-pointer">
        <p class="text-[7px] font-black text-slate-400 uppercase">Yog'</p>
        <p class="text-[11px] font-black dark:text-white">{{ item.fat }}%</p>
      </div>
      <div @click="openNumpad(item, 'temp', 'Harorat')" class="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-transparent text-center cursor-pointer">
        <p class="text-[7px] font-black text-slate-400 uppercase">Harorat</p>
        <p class="text-[11px] font-black dark:text-white">{{ item.temp }}°</p>
      </div>
      <div @click="openNumpad(item, 'density', 'Zichlik')" class="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-transparent text-center cursor-pointer">
        <p class="text-[7px] font-black text-slate-400 uppercase">Zichlik</p>
        <p class="text-[11px] font-black dark:text-white">{{ item.density }}</p>
      </div>
    </div> -->

  <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-2xl">
  <div class="flex items-center bg-white dark:bg-slate-700 rounded-xl p-1 shadow-sm border border-transparent focus-within:border-indigo-400 transition-all">
    <button @click.stop="inputStore.updateItem(item.productId, { qty: Math.max(0, Number(item.qty) - 1) })" 
            class="w-7 h-7 flex items-center justify-center text-slate-400 active:text-rose-500 transition-colors">
      <i class="fa-solid fa-minus text-[10px]"></i>
    </button>

    <div class="relative min-w-[50px]">
      <input 
        type="number" 
        :value="item.qty"
        @input="(e) => inputStore.updateItem(item.productId, { qty: Number(e.target.value) })"
        @click.stop
        class="w-full bg-transparent text-center text-[13px] font-black dark:text-white tabular-nums border-none outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder="0"
      />
      <div @click.stop="openNumpad(item, 'qty', 'Miqdor')" class="absolute -top-1 -right-1 opacity-0 group-hover/card:opacity-100 cursor-help">
        <i class="fa-solid fa-keyboard text-[8px] text-slate-300"></i>
      </div>
    </div>

    <button @click.stop="inputStore.updateItem(item.productId, { qty: Number(item.qty) + 1 })" 
            class="w-7 h-7 flex items-center justify-center text-indigo-500 active:scale-110 transition-transform">
      <i class="fa-solid fa-plus text-[10px]"></i>
    </button>
  </div>

  <div class="flex-1 flex justify-between items-center pr-2">
    <div @click="openNumpad(item, 'costPrice', 'Narx')" class="cursor-pointer group/price">
      <p class="text-[7px] font-black text-slate-400 uppercase leading-none group-hover/price:text-indigo-500 transition-colors">Narxi</p>
      <p class="text-[11px] font-black dark:text-white tabular-nums">{{ formatPrice(item.costPrice).split(' ')[0] }}</p>
    </div>
    <div class="text-right">
      <p class="text-[7px] font-black text-emerald-500 uppercase leading-none">Jami</p>
      <p class="text-[12px] font-black dark:text-white tabular-nums">{{ formatPrice(item.qty * item.costPrice).split(' ')[0] }}</p>
    </div>
  </div>
</div>
  </div>
</div>

        <div class="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jami Summa:</span>
            <span class="text-2xl font-black dark:text-white tracking-tighter">{{ formatPrice(totalSum) }}</span>
          </div>
          <button @click="processInbound" :disabled="!inboundDocument.items.length || isSubmitting" class="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-50">
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-2"></i> Qabulni Yakunlash
          </button>
        </div>
      </aside>
    </div>

    <div class="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center px-4 gap-4 z-50 shadow-2xl border border-slate-200 dark:border-slate-800">
      <button @click="mobileTab = 'catalog'" class="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase" :class="mobileTab === 'catalog' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'">Baza</button>
      <button @click="mobileTab = 'inbound'" class="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase relative" :class="mobileTab === 'inbound' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'">
        Savat <span v-if="inboundDocument.items.length" class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center border-2 border-white">{{ inboundDocument.items.length }}</span>
      </button>
    </div>

    <transition name="numpad">
      <div v-if="activeField && isMobile" class="fixed inset-x-2 bottom-24 z-[100] bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl p-6 border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
        <div class="flex justify-between items-center mb-6 px-2">
          <div>
            <p class="text-[9px] font-black text-indigo-500 uppercase mb-1">{{ activeField.label }}</p>
            <p class="text-3xl font-black dark:text-white tabular-nums">{{ activeField.item[activeField.field] }}</p>
          </div>
          <button @click="activeField = null" class="w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg active:scale-90 transition-all flex items-center justify-center">
            <i class="fa-solid fa-check text-xl"></i>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="n" @click="handleNumpadPress(n)" class="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl text-lg font-black dark:text-white active:bg-indigo-600 transition-all">{{ n }}</button>
          <button @click="handleNumpadPress('.')" class="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl text-lg font-black dark:text-white">.</button>
          <button @click="handleNumpadPress(0)" class="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl text-lg font-black dark:text-white">0</button>
          <button @click="handleNumpadPress('del')" class="h-14 bg-rose-50 text-rose-500 rounded-2xl text-lg flex items-center justify-center active:bg-rose-500 active:text-white"><i class="fa-solid fa-backspace"></i></button>
        </div>
      </div>
    </transition>
  </div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.numpad-enter-active, .numpad-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.numpad-enter-from, .numpad-leave-to { transform: translateY(20px); opacity: 0; }

.glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
}
.dark .glass-effect {
  background: rgba(15, 23, 42, 0.75);
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite ease-in-out;
}
</style>