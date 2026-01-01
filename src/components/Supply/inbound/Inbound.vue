<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { storeToRefs } from "pinia"
import { RawMaterialsStore } from "../../../stores/Supply/rawmaterial/rawmaterial.store"
import { SupplyInputboundStore } from "../../../stores/Supply/inbound/inputbound.store"
import { CounterpartyStore } from "../../../stores/Supply/counterparty/counterparty.store"
import { useToast } from "../../../UI/utils/useToast"

// UI KOMPONENTLAR
import InputUI from "../../../UI/Input.vue" 
import SelectUI from "../../../UI/Select.vue" 
import TabsUI from "../../../UI/BaseTabs.vue" 
import BarcodeScannerModal from "../../../components/BarcodeScaner/scaner.vue"

// --- STORE BOSHQARUVI ---
const productStore = RawMaterialsStore()
const inputStore = SupplyInputboundStore()
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

// ZAVODLAR RO'YXATI
const factories = ref([
  { _id: 'z1', name: 'Markaziy Zavod' },
  { _id: 'z2', name: 'Samarqand Filiali' },
  { _id: 'z3', name: 'Pasterizatsiya Bo\'limi' }
])

// --- WINDOW SIZE MONITORING ---
const updateWidth = () => { windowWidth.value = window.innerWidth }
const isMobile = computed(() => windowWidth.value < 1024)

// --- CUSTOM NUMPAD LOGIKASI ---
const activeField = ref(null); 

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

// --- COMPUTED ---
const milkSuppliers = computed(() => counterparties.value || [])
const filteredProducts = computed(() => {
  let list = materials.value || []
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
    toastService.success(`Mijoz: ${foundSupplier.fullname}`);
    return;
  }

  const foundProduct = materials.value.find(p => p.code === code);
  if (foundProduct) addToInbound(foundProduct);
  else toastService.error("Noma'lum kod");
  isScannerOpen.value = false;
};

const addToInbound = (p) => {
  // 1. Kerakli ma'lumotlarni extract qilamiz va default qiymatlarni belgilaymiz
  const cartItem = {
    ...p,                          // Barcha original maydonlar (id, name, image, unit)
    productId: p._id || p.id,      // ID formatini unifikatsiya qilish
    qty: 1,                        // Boshlang'ich miqdor har doim 1
    costPrice: p.costPrice || p.lastPurchasePrice || 3800, // Bazadagi narx yoki zaxira
    fat: p.fatContent || p.fat || 3.6,                     // Yog'lilik darajasi
    temp: p.temperature || 4                               // Harorat (default +4 C)
  };

  // 2. Store-ga yangi elementni yuboramiz
  inputStore.addItem(cartItem);

  // 3. Foydalanuvchiga bildirishnoma ko'rsatamiz
  toastService.success(`${p.name} savatga qo'shildi`);
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
  if(!inboundDocument.value.counterparty) return toastService.error("Yetkazib beruvchini tanlang!");
  if(!inboundDocument.value.warehouse) return toastService.error("Qabul qiluvchi zavodni tanlang!");
  
  const success = await inputStore.saveInput();
  if (success) {
    mobileTab.value = 'catalog';
    toastService.success("Qabul muvaffaqiyatli yakunlandi");
  }
}

let timeInterval;
onMounted(() => {
  window.addEventListener('resize', updateWidth)
  timeInterval = setInterval(() => { currentTime.value = new Date().toLocaleTimeString('uz-UZ') }, 1000)
  store_counterparty.GetAll();
  productStore.GetAll(); 
})
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
  clearInterval(timeInterval)
});
</script>

<template>
  <BarcodeScannerModal v-model="isScannerOpen" @detected="handleGlobalScan" />

  <div class="h-screen w-full bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans overflow-hidden transition-all duration-500">
    
   <header class="h-20 shrink-0 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-4 md:px-10 z-[60] sticky top-0 transition-all duration-500">
  
  <div class="flex items-center gap-4 group shrink-0">
    <div class="relative">
      <div class="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
      <div class="relative w-11 h-11 md:w-13 md:h-13 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[1.4rem] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-all duration-500">
        <i class="fa-solid fa-vial-circle-check text-xl md:text-2xl"></i>
      </div>
    </div>
    <div class="hidden sm:flex flex-col">
      <h1 class="text-sm md:text-base font-black uppercase tracking-[2px] dark:text-white leading-none">
        Milk<span class="text-indigo-600 dark:text-indigo-400">Lab</span>
      </h1>
      <div class="flex items-center gap-1.5 mt-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Active</p>
      </div>
    </div>
  </div>

 

  <div class="flex items-center gap-3 md:gap-5 shrink-0">
    <div class="hidden xl:flex items-center gap-4 border-r border-slate-200 dark:border-slate-800 pr-5">
      <div class="flex flex-col items-end">
        <span class="text-[8px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Server Time</span>
        <span class="text-xs font-black dark:text-white tabular-nums tracking-tighter">{{ currentTime }}</span>
      </div>
    </div>

    <router-link 
  :to="{name:`Kirim ro'yxati`}" 
  class="group relative h-11 md:h-13 w-11 md:w-auto md:px-7 bg-slate-900 dark:bg-indigo-600 text-white rounded-[1.2rem] flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 active:scale-95 hover:shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] border border-white/10 shadow-lg"
>
  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
  
  <i class="fa-solid fa-file-lines text-lg group-hover:rotate-12 transition-transform"></i>
  
  
</router-link>
    <button 
      @click="isScannerOpen = true" 
      class="group relative h-11 md:h-13 w-11 md:w-auto md:px-7 bg-slate-900 dark:bg-indigo-600 text-white rounded-[1.2rem] flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 active:scale-95 hover:shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] border border-white/10"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      <i class="fa-solid fa-qrcode text-lg group-hover:rotate-12 transition-transform"></i>
    </button>
  </div>

</header>

    <div class="flex-1 flex overflow-hidden">
      <section class="flex-1 p-6 overflow-y-auto custom-scroll" :class="mobileTab === 'catalog' ? 'block' : 'hidden lg:block'">
        <div class="max-w-5xl mx-auto w-full">
          <div class="">
            <InputUI v-model="productSearch" label="XOMASHYO QIDIRISH" placeholder="Nomi yoki kodi..." icon-pre="fa-solid fa-magnifying-glass" size="large" />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
  <div v-for="product in filteredProducts" :key="product._id" 
    @click="addToInbound(product)" 
    class="group bg-white dark:bg-slate-900 rounded-[2.8rem] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(79,70,229,0.18)] hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col h-full">
    
    <div class="relative h-32 md:h-32 m-2.5 overflow-hidden rounded-[2.2rem] bg-slate-50 dark:bg-slate-800/40">
      <img 
        :src="product.image || '/default-product.png'" 
        class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        :alt="product.name"
      >
      
      <transition name="scale-fade">
        <div v-if="inboundDocument.items.some(i => i.productId === product._id)" 
          class="absolute inset-0 bg-indigo-600/40 backdrop-blur-[4px] flex items-center justify-center">
          <div class="bg-white text-indigo-600 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl scale-110">
            <i class="fa-solid fa-check text-2xl"></i>
          </div>
        </div>
      </transition>

      <div v-if="product.fatContent" 
        class="absolute top-3 right-3 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full" 
          :class="product.fatContent >= 3.6 ? 'bg-emerald-500' : 'bg-amber-500'"></div>
        <span class="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">
          {{ product.fatContent }}% <span class="text-[8px] font-medium text-slate-400">YOG'</span>
        </span>
      </div>

      <div class="absolute top-3 left-3 px-2 py-1 bg-slate-900/40 backdrop-blur-sm rounded-lg text-white/90 text-[8px] font-mono tracking-widest border border-white/10">
        {{ product.code || 'NO-ID' }}
      </div>
    </div>

    <div class="p-5 pt-1 flex flex-col flex-1">
      <div class="flex-1">
        <h3 class="text-[15px] font-black text-slate-800 dark:text-slate-100 uppercase truncate leading-tight group-hover:text-indigo-600 transition-colors">
          {{ product.name }}
        </h3>
        
        <div class="flex items-center gap-2 mt-1.5">
          <span class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px] border-b border-slate-100 dark:border-slate-800 pb-0.5">
            {{ product.category || 'Xomashyo' }}
          </span>
        </div>
      </div>

      <div class="mt-5 flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Xarid Narxi</span>
          <div class="flex items-baseline gap-1">
            <span class="text-[16px] font-black text-slate-900 dark:text-white tracking-tighter">
              {{ formatPrice(product.costPrice || 0).split(' ')[0] }}
            </span>
            <span class="text-[9px] font-bold text-indigo-500 uppercase">UZS</span>
          </div>
        </div>

        <div class="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100/50 dark:border-indigo-500/20">
           <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
             {{ product.unit }}
           </span>
        </div>
      </div>
    </div>

    <div class="h-1 bg-slate-100 dark:bg-slate-800 w-full overflow-hidden">
      <div class="h-full bg-indigo-600 w-0 group-hover:w-full transition-all duration-700"></div>
    </div>
  </div>
</div>
        </div>
      </section>

      <aside class="w-full lg:w-[480px] bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl z-40" :class="mobileTab === 'inbound' ? 'block' : 'hidden lg:flex'">
        
        <div class="p-4 md:p-6 bg-slate-50/30 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="relative group">
              <div class="absolute -left-2 top-0 bottom-0 w-1 bg-indigo-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-all"></div>
              <SelectUI 
                v-model="inboundDocument.counterparty" 
                :options="milkSuppliers" 
                label="FERMER" 
                label-key="fullname" 
                value-key="_id" 
                placeholder="Tanlang" 
                icon-pre="fa-solid fa-user-tag" 
                size="middle" 
              />
            </div>
            <div class="relative group">
              <div class="absolute -left-2 top-0 bottom-0 w-1 bg-emerald-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-all"></div>
              <SelectUI 
                v-model="inboundDocument.warehouse" 
                :options="factories" 
                label="ZAVOD" 
                label-key="name" 
                value-key="_id" 
                placeholder="Tanlang" 
                icon-pre="fa-solid fa-industry" 
                size="middle" 
              />
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scroll bg-[#FBFDFF] dark:bg-[#020617]/30">
          <div v-if="inboundDocument.items.length === 0" class="h-full flex flex-col items-center justify-center opacity-30 text-center">
            <i class="fa-solid fa-truck-droplet text-6xl mb-4 text-indigo-200"></i>
            <p class="text-xs font-black uppercase tracking-widest text-indigo-300">Savatcha bo'sh</p>
          </div>

          <transition-group name="list">
            <div v-for="item in inboundDocument.items" :key="item.productId" class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group/card">
              <button @click="removeItem(item.productId)" class="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 opacity-0 group-hover/card:opacity-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                <i class="fa-solid fa-trash-can text-[10px]"></i>
              </button>

              <div class="flex gap-4 mb-6">
                <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                  <img v-if="item.image" :src="item.image" class="w-full h-full object-cover p-1 group-hover/card:scale-110 transition-all rounded-full"/>
                  <i v-else class="fa-solid fa-box text-indigo-300"></i>
                </div>
                <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase truncate w-40 mt-2">{{ item.name }}</h4>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div @click="openNumpad(item, 'fat', 'Yog\'lilik %')">
                  <InputUI v-model="item.fat" label="YOG'LILIK %" :readonly="isMobile" suffix="%" size="small" :success="item.fat >= 3.2" class="cursor-pointer lg:cursor-text" :class="{'ring-2 ring-indigo-500 rounded-xl': activeField?.item === item && activeField?.field === 'fat'}"/>
                </div>
                <div @click="openNumpad(item, 'costPrice', 'Narx')">
                  <InputUI v-model="item.costPrice" label="NARX (1 L/KG)" :readonly="isMobile" suffix="UZS" size="small" class="cursor-pointer lg:cursor-text" :class="{'ring-2 ring-indigo-500 rounded-xl': activeField?.item === item && activeField?.field === 'costPrice'}"/>
                </div>
              </div>

              <div class="relative flex items-center h-12" @click="openNumpad(item, 'qty', 'Miqdor')">
                <InputUI v-model="item.qty" label="QABUL MIQDORI" :readonly="isMobile" size="middle" class="!mb-0 w-full" input-class="font-black !pr-24 !pl-4" :class="{'ring-2 ring-indigo-500 rounded-xl': activeField?.item === item && activeField?.field === 'qty'}"/>
                <div class="absolute right-1.5 flex items-center gap-1 bg-white/80 dark:bg-slate-700/80 p-1 rounded-xl border border-slate-100 dark:border-slate-600">
                  <button @click.stop="changeQty(item, -1)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:text-rose-500 transition-all active:scale-90"><i class="fa-solid fa-minus text-[10px]"></i></button>
                  <button @click.stop="changeQty(item, 1)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:text-indigo-600 transition-all active:scale-90"><i class="fa-solid fa-plus text-[10px]"></i></button>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-dashed border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                <span class="text-emerald-500 flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> SIFAT: OK</span>
                <span class="dark:text-white font-mono">{{ formatPrice(item.costPrice * item.qty) }}</span>
              </div>
            </div>
          </transition-group>
        </div>

        <div class="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xl">
          <div class="flex justify-between items-center mb-5">
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Jami hisob</p>
              <p class="text-[10px] text-indigo-500 font-bold">{{ inboundDocument.items.length }} tur mahsulot</p>
            </div>
            <span class="text-2xl font-black dark:text-white tracking-tighter">{{ formatPrice(totalSum) }}</span>
          </div>
          <button @click="processInbound" :disabled="isSubmitting || inboundDocument.items.length === 0 || !inboundDocument.counterparty || !inboundDocument.warehouse" class="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[3px] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-2"></i> QABULNI YAKUNLASH
          </button>
        </div>
      </aside>
    </div>

    <div class="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center px-4 gap-4 z-50 shadow-2xl">
      <button @click="mobileTab = 'catalog'" class="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase transition-all" :class="mobileTab === 'catalog' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400'">Baza</button>
      <button @click="mobileTab = 'inbound'" class="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase relative transition-all" :class="mobileTab === 'inbound' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400'">
        Savat <span v-if="inboundDocument.items.length" class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] flex items-center justify-center text-white border-2 border-white animate-bounce">{{ inboundDocument.items.length }}</span>
      </button>
    </div>

    <transition name="numpad">
      <div v-if="activeField && isMobile" class="fixed inset-x-2 bottom-24 z-[100] bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-4 max-w-md mx-auto border border-white/20">
        <div class="flex justify-between items-center mb-4 px-4">
          <div class="flex flex-col">
            <span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{{ activeField.label }}</span>
            <span class="text-xl font-black dark:text-white">{{ activeField.item[activeField.field] }}</span>
          </div>
          <button @click="activeField = null" class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white active:scale-90 shadow-lg">
            <i class="fa-solid fa-check text-lg"></i>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="n" @click="handleNumpadPress(n)" class="h-14 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl text-lg font-black dark:text-white active:bg-indigo-600 active:text-white transition-all">{{ n }}</button>
          <button @click="handleNumpadPress('.')" class="h-14 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl text-lg font-black dark:text-white">.</button>
          <button @click="handleNumpadPress(0)" class="h-14 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl text-lg font-black dark:text-white">0</button>
          <button @click="handleNumpadPress('del')" class="h-14 bg-rose-500/10 text-rose-500 rounded-2xl text-lg flex items-center justify-center active:bg-rose-500 active:text-white"><i class="fa-solid fa-backspace"></i></button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.list-enter-active, .list-leave-active { transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1); }
.list-enter-from { opacity: 0; transform: translateY(20px) scale(0.9); }
.list-leave-to { opacity: 0; transform: translateX(100px); }
.numpad-enter-active, .numpad-leave-active { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s; }
.numpad-enter-from, .numpad-leave-to { transform: translateY(50px); opacity: 0; }
</style>