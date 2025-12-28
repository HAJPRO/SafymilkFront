<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch } from "vue"
import { storeToRefs } from "pinia"
import { ProductsManagmentStore } from "../../../stores/Sale/products/product.store"
import { WarehouseInputStore } from "../../../stores/Warehouses/input/input.store"
import { useToast } from "../../../UI/utils/useToast"

// Skaner komponentini import qilish
import BarcodeScannerModal from "../../../components/BarcodeScaner/scaner.vue"

// --- STORE BOSHQARUVI ---
const productStore = ProductsManagmentStore()
const inputStore = WarehouseInputStore()
const { toast: toastService } = useToast()

const { products } = storeToRefs(productStore)
const { 
    sessions, 
    activeSessionId,
    document: inboundDocument,
    isSubmitting, 
    totalSum, 
    isValid: isValidInbound 
} = storeToRefs(inputStore)

// --- LOKAL STATE ---
const isDark = ref(false)
const isScannerOpen = ref(false) // Skaner modalini boshqarish
const mobileTab = ref('catalog')
const productSearch = ref("")
const showCategoryDropdown = ref(false)
const showSupplierList = ref(false)
const showBranchList = ref(false)

const categoryDropdownRef = ref(null)
const supplierDropdownRef = ref(null)
const branchDropdownRef = ref(null)

const activeCategory = ref("All")
const currentTime = ref("")

// Static Data
const categories = ["All", "Gazli ichimliklar", "Gazsiz ichimliklar", "Sharbatlar", "Sneklar", "Xo'jalik"]
const suppliers = ref([
    { id: "1", company: "Sarvar Kamolov", phone: "+998 90 123 00 00" }, 
    { id: "2", company: "Jamshid Karimov", phone: "+998 93 999 88 77" }
])
const branchs = ref([
    { id: "1", company: "Ecowater Buxoro", phone: "+998 90 123 00 00" }, 
    { id: "2", company: "Ecowater Navoiy", phone: "+998 93 999 88 77" }
])

const toast = reactive({ show: false, message: "" })

// --- COMPUTED ---
const activeDocument = computed(() => inboundDocument.value) 
const activeSupplier = computed(() => suppliers.value.find(s => s.id === activeDocument.value.supplierId) || null)
const activeBranch = computed(() => branchs.value.find(b => b.id === activeDocument.value.branchId) || null)

const filteredProducts = computed(() => {
    let list = products.value || []
    if (activeCategory.value !== 'All') {
        list = list.filter(p => p.category === activeCategory.value)
    }
    if (productSearch.value) {
        const s = productSearch.value.toLowerCase()
        list = list.filter(p => p.name.toLowerCase().includes(s) || (p.code && p.code.toLowerCase().includes(s)))
    }
    return list
})

const isAdded = (p) => activeDocument.value.items.some(i => i.productId === p._id)

// --- ACTIONS ---
// SKANER MANTIQI
const handleGlobalScan = (code) => {
  if (!code) return;
  const scannedCode = String(code).trim().toLowerCase();
  
  // Katalogdan kod bo'yicha mahsulotni qidirish
  const found = products.value.find(p => String(p.code || "").toLowerCase() === scannedCode);

  if (found) {
    inputStore.addItem(found);
    toastService.success(`${found.name} kirim ro'yxatiga qo'shildi`);
    // Skanerlanganda avtomatik Kirim tabiga o'tish (mobil uchun qulay)
    if (window.innerWidth < 1024) mobileTab.value = 'inbound';
  } else {
    toastService.error("Mahsulot topilmadi: " + scannedCode);
  }
  isScannerOpen.value = false;
};

const selectCategory = (cat) => { activeCategory.value = cat; showCategoryDropdown.value = false }
const selectSupplier = (s) => { inputStore.document.supplierId = s.id; showSupplierList.value = false }
const selectBranch = (b) => { inputStore.document.branchId = b.id; showBranchList.value = false }

const addToInbound = (p) => { inputStore.addItem(p) }
const removeItem = (id) => inputStore.removeItem(id);

const changeQty = (item, delta) => { 
    const newQty = item.qty + delta;
    if (newQty > 0) inputStore.updateItem(item.productId, { qty: newQty });
    else inputStore.removeItem(item.productId);
}

const getMargin = (item) => { 
    if(!item.costPrice || item.costPrice === 0) return 0; 
    return Math.round(((item.salePrice - item.costPrice) / item.salePrice) * 100) 
}

const processInbound = async () => {
    const success = await inputStore.saveInput();
    if (success) {
        toast.message = `Kirim muvaffaqiyatli saqlandi!`;
        toast.show = true;
        setTimeout(() => toast.show = false, 3000);
        mobileTab.value = 'catalog';
    }
}

// --- UTILS ---
const toggleTheme = () => { 
    isDark.value = !isDark.value; 
    document.documentElement.classList.toggle("dark", isDark.value) 
}
const formatPrice = (v) => new Intl.NumberFormat('uz-UZ').format(v) + " so'm"
const formatPriceCompact = (v) => new Intl.NumberFormat('uz-UZ', { notation: "compact" }).format(v)

const handleClickOutside = (e) => {
    if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target)) showCategoryDropdown.value = false
    if (supplierDropdownRef.value && !supplierDropdownRef.value.contains(e.target)) showSupplierList.value = false
    if (branchDropdownRef.value && !branchDropdownRef.value.contains(e.target)) showBranchList.value = false
}

// --- LIFECYCLE ---
let timeInterval;
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    timeInterval = setInterval(() => { 
        currentTime.value = new Date().toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'}) 
    }, 1000)
    inputStore.fetchCatalog(); 
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    clearInterval(timeInterval);
})

const ClearAll = () => inputStore.clearDocumentAll();
</script>

<template>
  <BarcodeScannerModal 
    v-model="isScannerOpen" 
    @detected="handleGlobalScan" 
    @close="isScannerOpen = false"
  />

  <div class="h-screen w-full bg-[#F0FDFA] dark:bg-[#020617] flex flex-col font-sans overflow-hidden text-slate-600 dark:text-slate-400 selection:bg-teal-500 selection:text-white transition-colors duration-300">
    
    <header class="h-16 shrink-0 bg-white dark:bg-[#0F172A] border-b border-teal-100 dark:border-slate-800 flex items-center justify-between px-5 z-50 shadow-sm relative">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center rounded-xl shadow-lg shadow-teal-500/20">
          <i class="fa-solid fa-truck-ramp-box text-sm"></i>
        </div>
        <div>
          <h1 class="text-base font-black text-slate-800 dark:text-white leading-none tracking-tight">Eco<span class="text-teal-600">Inbound</span></h1>
          <div class="flex items-center gap-1.5 mt-0.5">
             <span class="relative flex h-1.5 w-1.5">
               <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
               <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
             </span>
             <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kirim Bo'limi</span>
          </div>
        </div>
        <button @click="ClearAll()" class="ml-4 flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 border border-rose-100">
          <i class="fa-solid fa-trash-can"></i>
          <span>Tozalash</span>
        </button>
      </div>

      <div class="hidden xl:flex items-center gap-6 bg-slate-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2 border-r border-slate-200 dark:border-slate-600 pr-4">
              <div class="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><i class="fa-solid fa-user-tie text-[10px]"></i></div>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Kirim Operatori</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
              <i class="fa-regular fa-clock text-slate-400"></i> {{ currentTime }}
          </div>
      </div>

      <div class="flex items-center gap-2">
        <button @click="toggleTheme" class="w-9 h-9 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all border border-transparent hover:border-teal-100">
          <i :class="isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden relative z-0">
      
      <div 
        class="flex-1 flex flex-col min-w-0 bg-[#F0FDFA] dark:bg-[#020617] relative transition-transform duration-300"
        :class="mobileTab === 'catalog' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 absolute lg:relative inset-0'"
      >
        <div class="px-5 py-4 sticky top-0 z-30 bg-[#F0FDFA]/95 dark:bg-[#020617]/95 backdrop-blur-md border-b border-teal-100/50 dark:border-slate-800/50 flex gap-3">
           <div class="relative group flex-1">
             <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-teal-600 transition-colors text-sm"></i>
             <input v-model="productSearch" type="text" placeholder="Nomi yoki kod bo'yicha..." class="block w-full h-11 pl-10 pr-12 bg-white dark:bg-[#0F172A] border border-teal-100 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 dark:text-white">
             
             <button @click="isScannerOpen = true" class="absolute right-2 top-2 h-7 w-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-sm">
                <i class="fa-solid fa-qrcode"></i>
             </button>
           </div>
           <div class="relative" ref="categoryDropdownRef">
               <button @click="showCategoryDropdown = !showCategoryDropdown" class="h-11 px-4 bg-white dark:bg-[#0F172A] border border-teal-100 dark:border-slate-700 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-teal-500 transition shadow-sm active:scale-95">
                   <i class="fa-solid fa-filter"></i>
                   <span class="hidden sm:inline">{{ activeCategory === 'All' ? 'Bo\'limlar' : activeCategory }}</span>
                   <i class="fa-solid fa-chevron-down text-[10px] ml-1 transition-transform" :class="{'rotate-180': showCategoryDropdown}"></i>
               </button>
               <transition name="scale">
                   <div v-if="showCategoryDropdown" class="absolute top-12 right-0 w-56 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-teal-100 z-50 p-1.5 origin-top-right ring-1 ring-black/5">
                        <button v-for="cat in categories" :key="cat" @click="selectCategory(cat)" class="w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl hover:bg-teal-50 dark:hover:bg-slate-800 transition flex items-center justify-between" :class="activeCategory === cat ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'text-slate-600 dark:text-slate-300'">
                             <span>{{ cat === 'All' ? 'Barchasi' : cat }}</span>
                             <i v-if="activeCategory === cat" class="fa-solid fa-check"></i>
                        </button>
                   </div>
               </transition>
           </div>
        </div>

        <div class="flex-1 overflow-y-auto px-5 pb-24 lg:pb-6 custom-scroll-teal">
          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            <div v-for="product in filteredProducts" :key="product._id" @click="addToInbound(product)" class="group relative bg-white dark:bg-[#0F172A] rounded-2xl p-2 border border-teal-50 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden" :class="{'ring-2 ring-teal-500 border-teal-500': isAdded(product)}">
              <div class="aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative mb-2">
                 <img :src="`http://localhost:5000/${product.image}`" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                 <div class="absolute top-2 left-2 bg-white/90 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-white/20">
                     <i class="fa-solid fa-warehouse text-[9px] text-teal-500"></i>
                     <span class="text-[10px] font-black text-slate-800 dark:text-white">{{ product.totalStock }}</span>
                 </div>
                 <transition name="pop">
                    <div v-if="isAdded(product)" class="absolute inset-0 bg-teal-500/10 flex items-center justify-center backdrop-blur-[1px]">
                        <div class="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-xl scale-110 border-2 border-white"><i class="fa-solid fa-check"></i></div>
                    </div>
                 </transition>
              </div>
              <div class="px-1 flex-1 flex flex-col">
                 <h3 class="text-xs font-bold text-slate-800 dark:text-white leading-tight line-clamp-2 min-h-[2rem] mb-2">{{ product.name }}</h3>
                 <div class="mt-auto border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between items-center text-[9px]">
                     <span class="text-slate-400 font-mono">{{ product.code || 'NO-CODE' }}</span>
                     <span class="font-bold text-teal-600">{{ formatPriceCompact(product.salePrice) }}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div 
        class="flex flex-col w-full lg:w-[450px] xl:w-[550px] bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 absolute lg:relative inset-0 lg:inset-auto z-40 lg:z-auto"
        :class="mobileTab === 'inbound' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'"
      >
        <div class="shrink-0 bg-slate-50 dark:bg-[#0B1120] border-b border-slate-200 px-3 pt-3 flex items-end gap-1 overflow-x-auto no-scrollbar">
          <button @click="mobileTab = 'catalog'" class="lg:hidden w-10 h-10 mb-1 rounded-lg bg-white dark:bg-slate-800 border flex items-center justify-center text-slate-500 shadow-sm mr-2"><i class="fa-solid fa-arrow-left"></i></button>
          <button v-for="session in sessions" :key="session.id" @click="activeSessionId = session.id" class="relative px-4 py-3 rounded-t-xl text-[11px] font-bold transition-all min-w-[110px] flex items-center justify-between border-t border-x" :class="activeSessionId === session.id ? 'bg-white dark:bg-[#0F172A] text-teal-600 border-slate-200 dark:border-slate-800 !border-b-transparent z-10' : 'text-slate-500 border-transparent'">
            <span>{{ session.name }}</span>
          </button>
        </div>

        <div class="shrink-0 p-4 bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800">
            <div class="grid grid-cols-2 gap-3">
                <div class="relative" ref="supplierDropdownRef">
                    <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Yetkazib beruvchi</label>
                    <button @click="showSupplierList = !showSupplierList; showBranchList = false" class="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-400 transition shadow-sm">
                        <div class="flex items-center gap-2 overflow-hidden text-[10px] font-black">
                            <i class="fa-solid fa-truck-fast text-orange-500"></i>
                            <span :class="activeSupplier ? 'text-slate-800 dark:text-white' : 'text-rose-500'">{{ activeSupplier ? activeSupplier.company : 'Tanlang' }}</span>
                        </div>
                        <i class="fa-solid fa-chevron-down text-[8px] text-slate-400"></i>
                    </button>
                    <transition name="dropdown">
                        <div v-if="showSupplierList" class="absolute top-14 left-0 w-full bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl border border-teal-100 z-50 p-1">
                            <button v-for="s in suppliers" :key="s.id" @click="selectSupplier(s)" class="w-full p-2.5 rounded-lg hover:bg-teal-50 dark:hover:bg-slate-800 text-left text-xs font-bold transition flex justify-between items-center">
                                <span>{{ s.company }}</span>
                                <i v-if="activeDocument.supplierId === s.id" class="fa-solid fa-check text-teal-500"></i>
                            </button>
                        </div>
                    </transition>
                </div>
                <div class="relative" ref="branchDropdownRef">
                    <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Qabul qiluvchi filial</label>
                    <button @click="showBranchList = !showBranchList; showSupplierList = false" class="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-400 transition shadow-sm">
                        <div class="flex items-center gap-2 overflow-hidden text-[10px] font-black">
                            <i class="fa-solid fa-warehouse text-indigo-500"></i>
                            <span :class="activeBranch ? 'text-slate-800 dark:text-white' : 'text-rose-500'">{{ activeBranch ? activeBranch.company : 'Tanlang' }}</span>
                        </div>
                        <i class="fa-solid fa-chevron-down text-[8px] text-slate-400"></i>
                    </button>
                    <transition name="dropdown">
                        <div v-if="showBranchList" class="absolute top-14 left-0 w-full bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl border border-teal-100 z-50 p-1">
                            <button v-for="b in branchs" :key="b.id" @click="selectBranch(b)" class="w-full p-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 text-left text-xs font-bold transition flex justify-between items-center">
                                <span>{{ b.company }}</span>
                                <i v-if="activeDocument.branchId === b.id" class="fa-solid fa-check text-indigo-500"></i>
                            </button>
                        </div>
                    </transition>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-[#020617] custom-scroll-teal pb-32 lg:pb-4">
          <div v-if="activeDocument.items.length === 0" class="h-full flex flex-col items-center justify-center opacity-40 select-none">
              <i class="fa-solid fa-cart-flatbed text-5xl mb-3"></i>
              <p class="text-sm font-bold uppercase tracking-widest">Kirim ro'yxati bo'sh</p>
          </div>
          <transition-group name="list" tag="div" class="space-y-4">
            <div v-for="item in activeDocument.items" :key="item.productId" class="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 relative group overflow-hidden">
              <div class="flex justify-between items-center mb-3">
                  <div class="flex items-center gap-3">
                      <img :src="`http://localhost:5000/${item.image}`" class="w-10 h-10 rounded-lg object-cover">
                      <div>
                        <h4 class="text-xs font-bold text-slate-800 dark:text-white leading-tight line-clamp-1 w-48">{{ item.name }}</h4>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-[8px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-slate-400">{{ item.code || 'No Code' }}</span>
                          <span class="text-[8px] font-bold text-slate-300 uppercase">{{ item.unit }}</span>
                        </div>
                      </div>
                  </div>
                  <button @click="removeItem(item.productId)" class="text-slate-300 hover:text-rose-500 transition px-2"><i class="fa-solid fa-trash-can"></i></button>
              </div>
              <div class="grid grid-cols-3 gap-3">
                  <div>
                      <label class="text-[8px] font-bold text-slate-400 uppercase ml-1 block mb-1">Tan Narx</label>
                      <input v-model.number="item.costPrice" type="number" class="w-full h-9 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black outline-none focus:border-orange-400 transition-all dark:text-white">
                  </div>
                  <div>
                      <label class="text-[8px] font-bold text-teal-500 uppercase ml-1 block mb-1 flex justify-between">
                          Sotuv <span :class="getMargin(item) > 0 ? 'text-emerald-500' : 'text-rose-500'">{{ getMargin(item) }}%</span>
                      </label>
                      <input v-model.number="item.salePrice" type="number" class="w-full h-9 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-teal-600 focus:border-teal-500 outline-none transition-all">
                  </div>
                  <div>
                      <label class="text-[8px] font-bold text-slate-400 uppercase ml-1 block mb-1 text-center">Miqdor</label>
                      <div class="flex items-center h-9 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <button @click="changeQty(item, -1)" class="w-8 flex items-center justify-center text-slate-400 hover:text-rose-500"><i class="fa-solid fa-minus text-[9px]"></i></button>
                          <input v-model.number="item.qty" type="number" class="flex-1 w-full bg-transparent text-center text-xs font-black outline-none dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                          <button @click="changeQty(item, 1)" class="w-8 flex items-center justify-center text-slate-400 hover:text-teal-500"><i class="fa-solid fa-plus text-[9px]"></i></button>
                      </div>
                  </div>
              </div>
              <div class="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <span class="text-[9px] text-slate-400 font-bold uppercase">Jami:</span>
                  <span class="text-xs font-black text-slate-800 dark:text-white">{{ formatPrice(item.costPrice * item.qty) }}</span>
              </div>
            </div>
          </transition-group>
        </div>

        <div class="shrink-0 p-4 bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-700 z-30 pb-24 lg:pb-4">
            <div class="flex justify-between items-center mb-4 px-2">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Jami Summa:</span>
                <span class="text-xl font-black font-mono text-teal-600">{{ formatPrice(totalSum) }}</span>
            </div>
            <button 
                @click="processInbound"
                :disabled="!isValidInbound || isSubmitting"
                class="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
                <i v-else class="fa-solid fa-check-double"></i>
                {{ isSubmitting ? 'Saqlanmoqda...' : 'Kirimni Tasdiqlash' }}
            </button>
        </div>
      </div>
    </div>

    <div class="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-[#0F172A] border-t border-slate-200 flex z-50">
      <button @click="mobileTab = 'catalog'" class="flex-1 py-3 flex flex-col items-center gap-1 border-t-2 transition-all" :class="mobileTab === 'catalog' ? 'border-teal-600 text-teal-600 bg-teal-50/20' : 'border-transparent text-slate-400'">
        <i class="fa-solid fa-boxes-stacked text-lg"></i>
        <span class="text-[10px] font-bold">Katalog</span>
      </button>
      <button @click="mobileTab = 'inbound'" class="flex-1 py-3 flex flex-col items-center gap-1 border-t-2 transition-all relative" :class="mobileTab === 'inbound' ? 'border-teal-600 text-teal-600 bg-teal-50/20' : 'border-transparent text-slate-400'">
        <i class="fa-solid fa-dolly text-lg"></i>
        <span class="text-[10px] font-bold">Kirim</span>
        <span v-if="activeDocument.items.length" class="absolute top-2 right-1/3 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">{{ activeDocument.items.length }}</span>
      </button>
    </div>

    <transition name="toast">
        <div v-if="toast.show" class="fixed top-20 right-5 z-[100] bg-white dark:bg-[#1E293B] border-l-4 border-teal-500 rounded-lg shadow-2xl p-4 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0"><i class="fa-solid fa-check"></i></div>
            <p class="text-xs font-bold text-slate-800 dark:text-white">{{ toast.message }}</p>
        </div>
    </transition>
  </div>
</template>

<style scoped>
.custom-scroll-teal::-webkit-scrollbar { width: 5px; }
.custom-scroll-teal::-webkit-scrollbar-thumb { background-color: #99f6e4; border-radius: 4px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.list-enter-active, .list-leave-active { transition: all 0.2s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-5px); }
.pop-enter-active { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-enter-from { transform: scale(0); }
.scale-enter-active { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from { transform: scale(0.9) opacity(0); }
.toast-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-enter-from { transform: translateX(20px); opacity: 0; }

input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>