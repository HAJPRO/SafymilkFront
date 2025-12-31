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

// --- CUSTOM NUMPAD LOGIKASI (YANGI) ---
const activeField = ref(null); // { item, field, label }

const openNumpad = (item, field, label) => {
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
// ------------------------------------

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

  const foundSupplier = milkSuppliers.value.find(s => s.code === code || s._id === code);
  if (foundSupplier) {
    inboundDocument.value.counterparty = foundSupplier._id;
    toastService.success(`Mijoz: ${foundSupplier.fullname}`, { icon: 'fa-solid fa-user-check' });
    return;
  }

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
      </div>

      <div class="flex items-center gap-3 md:gap-5">
        <button @click="isScannerOpen = true" class="group h-12 px-5 md:px-8 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-[11px] font-black hover:bg-indigo-700 dark:hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 flex items-center gap-3 overflow-hidden relative">
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
                <img :src="product.image" class="h-24 w-24 object-contain drop-shadow-lg group-hover:scale-110 group-active:scale-95 transition-all duration-500">
                <div v-if="inboundDocument.items.some(i => i.productId === product._id)" class="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                  <div class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce"><i class="fa-solid fa-check text-xs"></i></div>
                </div>
              </div>

              <div class="space-y-1">
                <h3 class="text-[12px] font-black text-slate-800 dark:text-slate-100 uppercase truncate leading-tight tracking-tight">{{ product.name }}</h3>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg uppercase tracking-widest">{{ product.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="w-full lg:w-[480px] bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl z-40" :class="mobileTab === 'inbound' ? 'block' : 'hidden lg:flex'">
        <div class="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
          <SelectUI v-model="inboundDocument.counterparty" :options="milkSuppliers" label="Yetkazib beruvchi (Fermer)" label-key="fullname" value-key="_id" searchable placeholder="Fermerni tanlang" icon-pre="fa-solid fa-user-tag" clearable size="middle" />
        </div>

        <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scroll bg-[#FBFDFF] dark:bg-[#020617]/30">
          <div v-if="inboundDocument.items.length === 0" class="h-full flex flex-col items-center justify-center opacity-30 text-center">
            <i class="fa-solid fa-truck-droplet text-6xl mb-4 text-indigo-200"></i>
            <p class="text-xs font-black uppercase tracking-widest text-indigo-300">Savatcha bo'sh</p>
          </div>

          <transition-group name="list">
            <div v-for="item in inboundDocument.items" :key="item.productId" class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group/card">
              <button @click="removeItem(item.productId)" class="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 opacity-0 group-hover/card:opacity-100 hover:bg-rose-500 hover:text-white transition-all active:scale-75 shadow-sm">
                <i class="fa-solid fa-xmark text-xs"></i>
              </button>

              <div class="flex gap-4 mb-6">
                <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <img v-if="item.image" :src="item.image" class="w-full h-full object-contain p-1 group-hover/card:scale-110 transition-transform duration-500 rounded-full"/>
                </div>
                <div><h4 class="text-xs font-black text-slate-800 dark:text-white uppercase truncate w-40">{{ item.name }}</h4></div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div @click="openNumpad(item, 'fat', 'Yog\'lilik %')">
                  <InputUI :modelValue="item.fat" label="YOG'LILIK %" readonly inputmode="none" suffix="%" size="small" :success="item.fat >= 3.2" class="cursor-pointer" :class="{'ring-2 ring-indigo-500 rounded-xl': activeField?.item === item && activeField?.field === 'fat'}"/>
                </div>
                <div @click="openNumpad(item, 'costPrice', 'Narx')">
                  <InputUI :modelValue="item.costPrice" label="XARID NARXI" readonly inputmode="none" suffix="UZS" size="small" class="cursor-pointer" :class="{'ring-2 ring-indigo-500 rounded-xl': activeField?.item === item && activeField?.field === 'costPrice'}"/>
                </div>
              </div>

              <div class="flex flex-col space-y-1">
                <div class="relative flex items-center h-12" @click="openNumpad(item, 'qty', 'Miqdor')">
                  <InputUI :modelValue="item.qty" :label="Miqdor" readonly inputmode="none" size="middle" class="!mb-0 w-full" input-class="font-black !pr-24 !pl-4 !border-slate-200 dark:!border-slate-700 focus:!border-indigo-500 !bg-white dark:!bg-slate-900 shadow-sm transition-all" :class="{'ring-2 ring-indigo-500 rounded-xl': activeField?.item === item && activeField?.field === 'qty'}"/>
                  <div class="absolute right-1.5 bottom-1.5 flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200/50 dark:border-slate-700">
                    <button @click.stop="changeQty(item, -1)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-500 hover:text-rose-500 shadow-sm active:scale-90 transition-all"><i class="fa-solid fa-minus text-[10px]"></i></button>
                    <div class="w-[1px] h-3 bg-slate-300 dark:bg-slate-600 mx-0.5"></div>
                    <button @click.stop="changeQty(item, 1)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-500 hover:text-indigo-600 shadow-sm active:scale-90 transition-all"><i class="fa-solid fa-plus text-[10px]"></i></button>
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

        <div class="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xl relative">
          <div class="flex justify-between items-center mb-5">
            <div><p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Jami hisob</p><p class="text-[10px] text-indigo-500 font-bold leading-none">{{ inboundDocument.items.length }} tur mahsulot</p></div>
            <span class="text-2xl font-black dark:text-white font-mono tracking-tighter">{{ formatPrice(totalSum) }}</span>
          </div>
          <button @click="processInbound" :disabled="isSubmitting || inboundDocument.items.length === 0 || !inboundDocument.counterparty" class="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[3px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin text-lg"></i>
            <template v-else><i class="fa-solid fa-circle-check text-lg"></i> QABULNI YAKUNLASH</template>
          </button>
          <div class="h-14 lg:hidden"></div>
        </div>
      </aside>
    </div>

    <div class="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center px-4 gap-4 z-50 shadow-2xl">
      <button @click="mobileTab = 'catalog'" class="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase transition-all" :class="mobileTab === 'catalog' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'">Baza</button>
      <button @click="mobileTab = 'inbound'" class="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase relative transition-all" :class="mobileTab === 'inbound' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'">
        Savat <span v-if="inboundDocument.items.length" class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] flex items-center justify-center text-white border-2 border-white animate-bounce">{{ inboundDocument.items.length }}</span>
      </button>
    </div>

    <transition name="numpad">
      <div v-if="activeField" class="fixed inset-x-2 bottom-20 z-[100] bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 p-4 lg:hidden max-w-md mx-auto">
        <div class="flex justify-between items-center mb-3 px-4">
          <div class="flex flex-col"><span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Kiritish</span><span class="text-lg font-black dark:text-white leading-none">{{ activeField.item[activeField.field] }}</span></div>
          <button @click="activeField = null" class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-md"><i class="fa-solid fa-check"></i></button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="n" @click="handleNumpadPress(n)" class="h-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl text-lg font-black dark:text-white active:bg-indigo-600 active:text-white transition-all">{{ n }}</button>
          <button @click="handleNumpadPress('.')" class="h-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl text-lg font-black dark:text-white">.</button>
          <button @click="handleNumpadPress(0)" class="h-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl text-lg font-black dark:text-white">0</button>
          <button @click="handleNumpadPress('del')" class="h-12 bg-rose-500/10 text-rose-500 rounded-xl text-lg flex items-center justify-center active:bg-rose-500 active:text-white"><i class="fa-solid fa-backspace"></i></button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 3px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
.list-enter-active, .list-leave-active { transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1); }
.list-enter-from { opacity: 0; transform: translateY(20px) scale(0.9); }
.list-leave-to { opacity: 0; transform: translateX(100px); }

.numpad-enter-active, .numpad-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s; }
.numpad-enter-from, .numpad-leave-to { transform: translateY(20px); opacity: 0; }
input[readonly] { cursor: pointer; caret-color: transparent; pointer-events: none; }
</style>