<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { storeToRefs } from "pinia"
import { ProductsManagmentStore } from "../../../stores/Sale/products/product.store"
import { SupplyInputboundStore } from "../../../stores/Supply/inbound/inputbound.store"
import { CounterpartyStore } from "../../../stores/Supply/counterparty/counterparty.store"
import { useToast } from "../../../UI/utils/useToast"

// UI KOMPONENTLAR
import InputUI from "../../../UI/Input.vue" 
import SelectUI from "../../../UI/Select.vue" 
import BarcodeScannerModal from "../../../components/BarcodeScaner/scaner.vue"

// --- STORE BOSHQARUVI ---
const productStore = ProductsManagmentStore()
const inputStore = SupplyInputboundStore()
const store_counterparty = CounterpartyStore()
const { toast: toastService } = useToast()

const { products } = storeToRefs(productStore)
const { counterparties } = storeToRefs(store_counterparty)
const { document: inboundDocument, isSubmitting, totalSum } = storeToRefs(inputStore)

// --- LOKAL STATE ---
const isScannerOpen = ref(false)
const mobileTab = ref('catalog')
const productSearch = ref("")
const currentTime = ref("")

// --- COMPUTED ---
const milkSuppliers = computed(() => counterparties.value || [])
const filteredProducts = computed(() => {
  let list = products.value || []
  if (productSearch.value) {
    const s = productSearch.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(s) || (p.code && p.code.toLowerCase().includes(s)))
  }
  return list
})

// --- ACTIONS ---
const handleGlobalScan = (scannedValue) => {
  if (!scannedValue) return;
  const code = String(scannedValue).trim();

  // 1. Fermerni QR orqali topish
  const foundSupplier = milkSuppliers.value.find(s => s.code === code || s._id === code);
  if (foundSupplier) {
    inboundDocument.value.counterparty = foundSupplier._id;
    toastService.success(`Mijoz: ${foundSupplier.fullname}`, { icon: 'fa-solid fa-user-check' });
    return;
  }

  // 2. Mahsulotni QR orqali topish
  const foundProduct = products.value.find(p => p.code === code);
  if (foundProduct) {
    addToInbound(foundProduct);
  } else {
    toastService.error("Noma'lum identifikator: " + code);
  }
  isScannerOpen.value = false;
};

const addToInbound = (p) => { 
  inputStore.addItem({
    ...p,
    qty: 1,
    costPrice: p.lastPurchasePrice || 3800,
    fat: 3.6,
    temp: 4
  });
  toastService.success(`${p.name} qo'shildi`);
}

const changeQty = (item, delta) => { 
  const newQty = (item.qty || 0) + delta;
  if (newQty > 0) inputStore.updateItem(item.productId, { qty: newQty });
  else inputStore.removeItem(item.productId);
}

const removeItem = (id) => {
    console.log(id);
    
  inputStore.removeItem(id);
  toastService.info("Mahsulot o'chirildi");
}

const formatPrice = (v) => new Intl.NumberFormat('uz-UZ').format(v || 0) + " UZS"

const processInbound = async () => {
  if (!inboundDocument.value.counterparty) return toastService.error("Fermerni tanlang!");
  if (inboundDocument.value.items.length === 0) return toastService.error("Savat bo'sh!");

  const success = await inputStore.saveInput();
  if (success) {
    mobileTab.value = 'catalog';
  }
}

let timeInterval;
onMounted(() => {
  timeInterval = setInterval(() => { currentTime.value = new Date().toLocaleTimeString('uz-UZ') }, 1000)
  store_counterparty.GetAll();
  productStore.GetAll(); 
})
onUnmounted(() => clearInterval(timeInterval));
</script>

<template>
  <BarcodeScannerModal v-model="isScannerOpen" @detected="handleGlobalScan" />

  <div class="h-screen w-full bg-[#F1F5F9] dark:bg-[#020617] flex flex-col font-sans overflow-hidden text-slate-900 transition-all duration-500">
    
  <header class="h-20 shrink-0 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-10 z-[60] shadow-sm transition-all duration-500">
  
  <div class="flex items-center gap-6">
    <div class="flex items-center gap-3 group cursor-pointer">
      <div class="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 group-hover:rotate-6 transition-transform duration-300">
        <i class="fa-solid fa-vial-circle-check text-xl"></i>
      </div>
      <div class="hidden xs:block">
        <h1 class="text-base font-black uppercase tracking-[1px] dark:text-white leading-none">
          Milk<span class="text-indigo-600">Lab</span> <span class="text-[10px] font-medium text-slate-400">v3.0</span>
        </h1>
        <div class="flex items-center gap-2 mt-1.5">
          <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ currentTime }}</p>
        </div>
      </div>
    </div>

    <div class="hidden xl:flex items-center gap-6 h-10 border-l border-slate-200 dark:border-slate-800 ml-4 pl-8">
      <div class="flex flex-col">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Savat holati</span>
        <span class="text-xs font-bold dark:text-slate-200">{{ inboundDocument.items.length }} Pozitsiya</span>
      </div>
      <div class="flex flex-col">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Umumiy hajm</span>
        <span class="text-xs font-bold text-indigo-600">{{ totalSum > 0 ? formatPrice(totalSum) : '0.00' }}</span>
      </div>
    </div>
  </div>

  <div class="flex items-center gap-3 md:gap-5">
    
    <div class="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
      <i class="fa-solid fa-wifi text-[10px] text-emerald-500" title="Online"></i>
      <i class="fa-solid fa-database text-[10px] text-slate-400" title="Sync OK"></i>
      <div class="w-[1px] h-3 bg-slate-300 dark:bg-slate-600 mx-1"></div>
      <i class="fa-solid fa-bell text-[10px] text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors"></i>
    </div>

    <button 
      @click="isScannerOpen = true" 
      class="group h-12 px-5 md:px-8 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-[11px] font-black hover:bg-indigo-700 dark:hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 flex items-center gap-3 overflow-hidden relative"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      <i class="fa-solid fa-qrcode text-base group-hover:rotate-12 transition-transform"></i> 
      <span class="hidden sm:inline tracking-[1px]">TEZKOR SKANERLASH</span>
    </button>

   
  </div>
</header>

    <div class="flex-1 flex overflow-hidden">
      <section class="flex-1 p-6 overflow-y-auto custom-scroll" :class="mobileTab === 'catalog' ? 'block' : 'hidden lg:block'">
        <div class="max-w-5xl mx-auto w-full">
          <div class="mb-8">
            <InputUI v-model="productSearch" label="XOMASHYO QIDIRISH" placeholder="Nomi yoki kodi..." icon-pre="fa-solid fa-magnifying-glass" clearable size="large" />
          </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
  <div v-for="product in filteredProducts" :key="product._id" @click="addToInbound(product)" 
    class="group bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 cursor-pointer relative overflow-hidden"
    :class="{'ring-2 ring-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10': inboundDocument.items.some(i => i.productId === product._id)}">
    
    <div class="h-32 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] mb-4 flex items-center justify-center relative overflow-hidden shadow-inner">
      <img 
        :src="product.image" 
        class="h-24 w-24 object-contain drop-shadow-lg group-hover:scale-110 group-active:scale-95 transition-all duration-500"
      >
      
      <div v-if="inboundDocument.items.some(i => i.productId === product._id)" 
        class="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
        <div class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <i class="fa-solid fa-check text-xs"></i>
        </div>
      </div>
    </div>

    <div class="space-y-1">
      <h3 class="text-[12px] font-black text-slate-800 dark:text-slate-100 uppercase truncate leading-tight tracking-tight">
        {{ product.name }}
      </h3>
      
      <div class="flex items-center justify-between mt-2">
        <span class="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg uppercase tracking-widest">
          {{ product.unit }}
        </span>
        
        <span class="text-[10px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity italic">
          + qo'shish
        </span>
      </div>
    </div>

    <div class="absolute -right-2 -bottom-2 opacity-[0.03] dark:opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
      <i class="fa-solid fa-box text-6xl"></i>
    </div>
  </div>
</div>
        </div>
      </section>

      <aside class="w-full lg:w-[480px] bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl z-40" :class="mobileTab === 'inbound' ? 'block' : 'hidden lg:flex'">
        
      <div class="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
  <div class="flex flex-col lg:flex-row items-stretch lg:items-end gap-4">
    
    <div class="flex-1 min-w-0 group relative">
      <SelectUI 
        v-model="inboundDocument.branchId"
        :options="branches" 
        label="Qabul qiluvchi zavod"
        label-key="name"
        value-key="_id"
        searchable
        placeholder="Zavodni tanlang"
        icon-pre="fa-solid fa-industry"
        size="middle"
      />
      <span v-if="inboundDocument.branchId" class="absolute -top-1 -left-1 flex h-2.5 w-2.5 z-20">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
      </span>
    </div>

    

    <div class="flex-1 min-w-0 relative">
      <SelectUI 
        v-model="inboundDocument.counterparty"
        :options="milkSuppliers"
        label="Yetkazib beruvchi (Fermer)"
        label-key="fullname"
        value-key="_id"
        searchable
        placeholder="Fermerni tanlang"
        icon-pre="fa-solid fa-user-tag"
        clearable
        size="middle"
      />
    </div>
  </div>

  <transition name="pop">
    <div v-if="inboundDocument.counterparty && inboundDocument.branchId" 
      class="mt-5 p-4 bg-white dark:bg-slate-800 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 shadow-xl shadow-blue-500/5 flex items-center justify-between overflow-hidden relative group"
    >
      <i class="fa-solid fa-truck-droplet absolute -right-4 -bottom-2 text-6xl text-slate-50 dark:text-slate-700/30 group-hover:scale-110 transition-transform duration-700"></i>
      
      <div class="flex items-center gap-4 z-10">
        <div class="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <i class="fa-solid fa-route"></i>
        </div>
        <div>
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Logistika yo'nalishi</p>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-slate-700 dark:text-slate-100">{{ milkSuppliers.find(s => s._id === inboundDocument.counterparty)?.fullname }}</span>
            <i class="fa-solid fa-chevron-right text-[8px] text-blue-500"></i>
            <span class="text-xs font-black text-blue-600">{{ branches.find(b => b._id === inboundDocument.branchId)?.name }}</span>
          </div>
        </div>
      </div>
      
      <button @click="inboundDocument.counterparty = null" class="z-10 p-2 text-slate-300 hover:text-rose-500 transition-colors">
        <i class="fa-solid fa-rotate-left text-xs"></i>
      </button>
    </div>
  </transition>
</div>

        <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scroll bg-[#FBFDFF] dark:bg-[#020617]/30">
          <div v-if="inboundDocument.items.length === 0" class="h-full flex flex-col items-center justify-center opacity-30 text-center">
            <i class="fa-solid fa-truck-droplet text-6xl mb-4 text-indigo-200"></i>
            <p class="text-xs font-black uppercase tracking-widest text-indigo-300">Savatcha bo'sh</p>
          </div>

          <transition-group name="list">
            <div v-for="item in inboundDocument.items" :key="item.productId" 
              class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group/card"
            >
              <button 
                @click="removeItem(item.productId)" 
                class="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 opacity-0 group-hover/card:opacity-100 hover:bg-rose-500 hover:text-white transition-all active:scale-75 shadow-sm"
              >
                <i class="fa-solid fa-xmark text-xs"></i>
              </button>

              <div class="flex gap-4 mb-6">
                <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <img 
      v-if="item.image" 
      :src="item.image" 
      :alt="item.name" 
      class="w-full h-full object-contain p-1 group-hover/card:scale-110 transition-transform duration-500 rounded-full"
    />
                </div>
                <div>
                  <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase truncate w-40">{{ item.name }}</h4>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <InputUI v-model="item.fat" label="YOG'LILIK %" type="number" suffix="%" size="small" :success="item.fat >= 3.2" />
                <InputUI v-model="item.temp" label="HARORAT °C" type="number" suffix="°C" size="small" :error="item.temp > 10" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <InputUI v-model.number="item.costPrice" label="XARID NARXI" type="number" suffix="UZS" size="small" />
                
                <div class="flex flex-col">
                  <div class="relative flex items-center group/stepper">
                    <button @click="changeQty(item, -1)" class="absolute left-1 z-10 w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><i class="fa-solid fa-minus text-xs"></i></button>
                    <InputUI v-model.number="item.qty" type="number" :label="`MIQDOR (${item.unit})`" size="middle" class="!mb-0 w-full" input-class="text-center font-black !px-10 !border-none bg-transparent" />
                    <button @click="changeQty(item, 1)" class="absolute right-1 z-10 w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 active:scale-90 transition-all"><i class="fa-solid fa-plus text-xs"></i></button>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-dashed border-slate-100 flex justify-between items-center">
                <span class="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> SIFAT: OK</span>
                <span class="text-xs font-black text-slate-800 dark:text-white">{{ formatPrice(item.costPrice * item.qty) }}</span>
              </div>
            </div>
          </transition-group>
        </div>

        <div class="p-8 border-t bg-white dark:bg-[#0F172A] rounded-t-[3.5rem] shadow-2xl relative z-20">
          <div class="flex justify-between items-center mb-6">
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Jami qabul summasi</p>
              <p class="text-[10px] text-indigo-500 font-bold mt-2 inline-block">{{ inboundDocument.items.length }} tur mahsulot</p>
            </div>
            <span class="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">{{ formatPrice(totalSum) }}</span>
          </div>
          <button @click="processInbound" :disabled="!inboundDocument.counterparty || isSubmitting || inboundDocument.items.length === 0" 
            class="w-full h-16 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white rounded-[2rem] font-black text-xs uppercase tracking-[3px] shadow-xl shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-3">
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin text-xl"></i>
            <template v-else><i class="fa-solid fa-check-double text-xl"></i> QABULNI TASDIQLASH</template>
          </button>
        </div>
      </aside>
    </div>

    <div class="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center px-4 gap-4 z-50 shadow-2xl">
      <button @click="mobileTab = 'catalog'" class="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase transition-all" :class="mobileTab === 'catalog' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400'">Baza</button>
      <button @click="mobileTab = 'inbound'" class="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase relative transition-all" :class="mobileTab === 'inbound' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400'">
        Savat <span v-if="inboundDocument.items.length" class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] flex items-center justify-center text-white border-2 border-white animate-bounce">{{ inboundDocument.items.length }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 3px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
.list-enter-active, .list-leave-active { transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1); }
.list-enter-from { opacity: 0; transform: translateY(20px) scale(0.9); }
.list-leave-to { opacity: 0; transform: translateX(100px); }
</style>