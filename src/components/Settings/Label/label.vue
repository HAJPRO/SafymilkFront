<template>
  <div class="flex flex-col h-screen bg-slate-50 dark:bg-[#0F172A] font-sans overflow-hidden">
  <AppModal 
  v-model="isTemplateModalOpen" 
  title="Chop etish shablonini tanlang" 
  width="80vw"
>
  <div class="p-1">
    <LabelSettings />
  </div>

  <template #footer>
    <div class="flex items-center justify-end gap-3 w-full">
      <AppButton 
        left-icon="fa-solid fa-xmark"
        variant="danger" 
        @click="closeTemplateModal"
      >
        Bekor qilish
      </AppButton>
      
      <AppButton 
        variant="primary" 
        left-icon="fa-solid fa-check"
        @click="saveTemplateSettings"
      >
        Saqlash
      </AppButton>
    </div>
  </template>
</AppModal>
    <div class="shrink-0 p-1 bg-white dark:bg-transparent border-b border-slate-100 dark:border-slate-700 shadow-sm z-10">
      <div class="">
        <AppInput 
          v-model="searchQuery" 
          placeholder="Mahsulot nomi yoki shtrix-kod orqali qidirish..." 
          icon-pre="fa-solid fa-search"
          :size="md"
          @keyup="handleKeyup"
          class=""
        />
      </div>
    </div>

    <div class="flex-1 overflow-hidden lg:overflow-hidden overflow-y-auto custom-scrollbar p-3 md:p-5">
      <div class="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-5 h-full max-w-[1600px] mx-auto">
        
       <div class="md:col-span-6 lg:col-span-4 flex flex-col h-[500px] md:h-full min-h-0 order-2 lg:order-1 gap-4">
  
  <div class="bg-white dark:bg-slate-800 p-1.5 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex items-center shrink-0">
    <button 
      v-for="tab in ['products', 'counterparties']" 
      :key="tab"
      @click="activeListTab = tab"
      :class="[
        'flex-1 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 italic',
        activeListTab === tab 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 active:scale-95' 
          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
      ]"
    >
      <i :class="['mr-2 text-xs', tab === 'products' ? 'fa-solid fa-boxes-stacked' : 'fa-solid fa-users-gears']"></i>
      {{ tab === 'products' ? 'Mahsulotlar' : 'Kontragentlar' }}
    </button>
  </div>

  <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
    <template v-if="activeListTab === 'products'">
   <div 
  v-for="item in filteredProducts" :key="item._id" 
  @click="addToQueue(item)"
  class="p-3 rounded-[1.8rem] bg-white dark:bg-slate-800 border border-transparent hover:border-indigo-500/50 shadow-sm cursor-pointer transition-all active:scale-[0.98] group relative overflow-hidden"
>
  <div class="flex gap-4 items-center">
    <div class="relative w-16 h-16 shrink-0 overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
      <img 
        :src="item.image || '/placeholder-product.png'" 
        :alt="item.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div v-if="item.stock <= 0" class="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center">
        <span class="text-[7px] font-black uppercase bg-red-500 text-white px-1.5 py-0.5 rounded-full">Yo'q</span>
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-start">
        <div class="flex-1 pr-2">
          <h3 class="text-[12px] font-bold text-slate-700 dark:text-slate-200 leading-tight group-hover:text-indigo-600 transition-colors italic truncate">
            {{ item.name }}
          </h3>
          <p class="text-[9px] text-slate-400 mt-0.5 font-mono tracking-tighter italic uppercase line-clamp-1">
            Kod: {{ item.code }}
          </p>
        </div>
        
        <div class="text-right shrink-0">
          <div class="text-[13px] font-black text-slate-800 dark:text-white leading-none">
            {{ item.costPrice?.toLocaleString() }}
          </div>
          <div class="text-[8px] font-bold text-slate-400 uppercase italic mt-1">SUM</div>
        </div>
      </div>

      <div class="mt-2 flex items-center justify-between">
        <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-[9px] font-black text-slate-500 uppercase flex items-center gap-1">
          <i class="fa-solid fa-box opacity-60"></i> {{ item.stock }} {{ item.unit }}
        </span>
        
        <div class="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
           <i class="fa-solid fa-circle-plus text-indigo-500 text-xl"></i>
        </div>
      </div>
    </div>
  </div>
</div>
    </template>

    <template v-else>
      <div 
        v-for="agent in counterparties" :key="agent.id"
        class="p-4 rounded-[1.8rem] bg-white dark:bg-slate-800 border border-transparent hover:border-emerald-500/50 shadow-sm cursor-pointer transition-all active:scale-[0.98] group relative"
      >
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <i class="fa-solid fa-user-tie"></i>
          </div>
          <div class="flex-1">
            <h3 class="text-[12px] font-black text-slate-700 dark:text-slate-200 uppercase italic tracking-tight">{{ agent.fullname }}</h3>
            <div class="flex justify-between">
            <p class="text-[10px] text-slate-400 mt-0.5">{{ agent.code }}</p>

            <p class="text-[10px] text-slate-400 mt-0.5">{{ agent.phoneNumber }}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg uppercase">Faol</span>
          </div>
        </div>
      </div>
    </template>

    <div v-if="activeListTab === 'products' && !filteredProducts.length" class="text-center py-10 opacity-30 italic">
      <i class="fa-solid fa-magnifying-glass text-3xl mb-2"></i>
      <p class="text-[10px] font-black uppercase tracking-widest">Mahsulot topilmadi</p>
    </div>
  </div>
</div>

        <div class="md:col-span-6 lg:col-span-5 flex flex-col h-[450px] md:h-full min-h-0 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden order-1 lg:order-2">
          <div class="shrink-0 p-5 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-list-check text-indigo-500"></i>
              <span class="text-[11px] font-black uppercase text-slate-500 tracking-widest italic">Navbat: {{ printQueue.length }}</span>
            </div>
            <AppButton v-if="printQueue.length" @click="clearQueue" theme="secondary" size="xs" class="!rounded-xl" icon="fa-solid fa-eraser" />
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/20 dark:bg-transparent">
  <transition-group name="queue-list">
    <div v-for="(q, index) in printQueue" :key="q.id" 
      class="group relative flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.8rem] shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
      
      <div class="relative w-12 h-12 shrink-0 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
        <img 
          :src="q.image || '/placeholder-product.png'" 
          :alt="q.name"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="flex-1 min-w-0">
        <div class="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate leading-tight tracking-tight italic uppercase">
          {{ q.name }}
        </div>
        <div class="flex items-center gap-3 mt-1">
          <span class="text-[8px] text-slate-400 font-mono uppercase bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
            Kod: {{ q.code }}
          </span>
          <span class="text-[9px] text-indigo-500 font-black italic">
            {{ q.costPrice?.toLocaleString() }} <small class="text-[7px]">SUM</small>
          </span>
        </div>
      </div>

      <div class="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-0.5 border border-slate-100 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner shrink-0">
        <button @click="q.quantity > 1 ? q.quantity-- : removeFromQueue(index)"
          :class="['w-7 h-7 flex items-center justify-center rounded-xl transition-all', q.quantity === 1 ? 'text-red-400 hover:bg-red-50' : 'text-slate-400 hover:text-indigo-500']">
          <i :class="['fa-solid', q.quantity === 1 ? 'fa-trash-can text-[10px]' : 'fa-minus text-[9px]']"></i>
        </button>
        
        <input v-model.number="q.quantity" type="number" @focus="$event.target.select() " 
          class="w-16 text-center text-[12px] font-black bg-transparent border-none outline-none text-slate-800 dark:text-white rounded-xl" />
        
        <button @click="q.quantity++" class="w-7 h-7 flex items-center justify-center rounded-xl text-indigo-500 hover:bg-indigo-50 transition-colors">
          <i class="fa-solid fa-plus text-[9px]"></i>
        </button>
      </div>

      <button @click="removeFromQueue(index)" class="absolute -right-1 -top-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md flex items-center justify-center hover:scale-110 active:scale-90">
        <i class="fa-solid fa-xmark text-[10px]"></i>
      </button>
    </div>
  </transition-group>

  <div v-if="!printQueue.length" class="h-full flex flex-col items-center justify-center text-slate-300 opacity-40 italic py-20">
    <div class="relative mb-4">
      <i class="fa-solid fa-receipt text-6xl"></i>
      <i class="fa-solid fa-slash absolute inset-0 text-red-400 opacity-50 scale-150"></i>
    </div>
    <p class="text-[10px] font-black uppercase text-center tracking-[0.2em]">Navbat hozircha bo'sh</p>
  </div>
</div>
        </div>

        <div class="md:col-span-12 lg:col-span-3 flex flex-col h-full min-h-0 gap-4 order-3">
          <AppButton variant="primary" class="!py-7 !rounded-2xl shadow-sm shrink-0 transition-transform active:scale-95" @click="openTemplateModal">
            <div class="flex flex-col items-center gap-1">
              <span class="uppercase font-black text-[12px] tracking-widest italic leading-none">Shablon tanlash</span>
              <span class="text-[12px] opacity-60 font-medium tracking-tight mt-1 text-center">Hozirgi: {{ currentTemplateName }}</span>
            </div>
          </AppButton>

          <div class="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 space-y-5 shadow-sm shrink-0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <AppSelect v-model="form.warehouse" :options="warehouses" label="Ombor" />
              <AppSelect v-model="form.priceType" :options="priceTypes" label="Narx turi" />
              
              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-black uppercase text-indigo-500 ml-2 tracking-widest italic flex items-center gap-1">
                  <i class="fa-solid fa-layer-group"></i> Umumiy miqdor
                </label>
                <AppInput 
                  v-model.number="globalQuantity" 
                  type="number" 
                  placeholder="Barchasiga qo'llash..."
                  class="!rounded-xl border-indigo-100 dark:border-indigo-900/30 shadow-inner"
                  @input="applyGlobalQuantity"
                />
              </div>

              <AppSelect v-model="form.currency" :options="currencies" label="Valyuta" />
            </div>
            
            <div class="pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">Jami:</span>
              <span class="text-sm font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">{{ totalCopies }} dona</span>
            </div>
          </div>

          <AppButton 
            variant="primary" class="!py-7 !rounded-2xl shadow-sm shrink-0 transition-transform active:scale-95"
            :disabled="!printQueue.length"
            @click="handleBulkPrint"
          >
            <div class="flex items-center justify-center gap-4 relative z-10">
              <i class="fa-solid fa-print text-3xl group-hover:scale-110 transition-transform duration-300"></i>
              <div class="flex flex-col items-start leading-none text-left">
                <span class="font-black uppercase tracking-tight text-sm italic leading-none">Chop etish</span>
                <span class="text-[9px] mt-1 opacity-80 font-bold uppercase tracking-widest">{{ totalCopies }} dona etiketka</span>
              </div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          </AppButton>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch,onMounted } from 'vue';
import { PricePrinterTemplateStore } from "../../../stores/Settings/printer/pricePrinter.store";
import { ProductsManagmentStore } from "../../../stores/Sale/products/product.store";
import { CounterpartyStore } from "../../../stores/Supply/counterparty/counterparty.store";
import AppInput from "../../../UI/Input.vue";
import AppSelect from "../../../UI/Select.vue";
import AppButton from "../../../UI/Button.vue";
import AppModal from "../../../UI/Modal.vue";
import LabelSettings from "../../../components/Settings/Printer/LabelSettings.vue";
import { storeToRefs } from "pinia";
const printerStore = PricePrinterTemplateStore();
const productStore = ProductsManagmentStore();
const counterpartyStore = CounterpartyStore();
const { products } = storeToRefs(productStore);
const {counterparties } = storeToRefs(counterpartyStore);

// --- STATE ---
const searchQuery = ref('');
const globalQuantity = ref(null);
const printQueue = ref([]);
const form = reactive({
  warehouse: 'Main',
  priceType: 'Retail',
  currency: 'SUM'
});



// Qaysi tab faolligini saqlaydi
const activeListTab = ref('products');


const warehouses = [{ label: 'Основной', value: 'Main' }];
const priceTypes = [{ label: 'Цена для продажи', value: 'Retail' }];
const currencies = [{ label: 'SUM', value: 'SUM' }];

// --- COMPUTED ---
const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return products.value;
  return products.value.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.barcode.includes(q)
  );
});

const totalCopies = computed(() => {
  return printQueue.value.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
});

// --- METHODS ---
const applyGlobalQuantity = () => {
  const qty = parseInt(globalQuantity.value);
  if (qty > 0) {
    printQueue.value.forEach(item => {
      item.quantity = qty;
    });
  }
};

const handleKeyup = (e) => {
  if (e.key === 'Enter') {
    handleQuickAdd();
  }
};

const addToQueue = (product) => {
  const existing = printQueue.value.find(p => p._id === product._id);
  if (existing) {
    existing.quantity++;
  } else {
    const initialQty = (parseInt(globalQuantity.value) > 0) ? parseInt(globalQuantity.value) : 1;
    printQueue.value.unshift({ ...product, quantity: initialQty });
  }
};

const handleQuickAdd = () => {
  if (filteredProducts.value.length > 0) {
    addToQueue(filteredProducts.value[0]);
    searchQuery.value = '';
  }
};

const removeFromQueue = (index) => printQueue.value.splice(index, 1);
const clearQueue = () => {
  printQueue.value = [];
  globalQuantity.value = null;
};

const handleBulkPrint = async () => {
  if (!printQueue.value.length) return;
  
  const payload = {
    items: printQueue.value.map(i => ({ id: i.id, quantity: i.quantity })),
    settings: { ...form },
    printer: printerStore.settings?.selectedPrinter
  };
  
  try {
    await printerStore.sendToPrintBulk(payload);
  } catch (error) {
    console.error("Chop etishda xatolik:", error);
  }
};

// --- WATCHERS ---
watch(printQueue, (newQueue) => {
  newQueue.forEach(item => {
    if (item.quantity === '' || item.quantity < 1) item.quantity = 1;
    if (item.quantity > 9999) item.quantity = 9999;
  });
}, { deep: true });

const isTemplateModalOpen = ref(false);
const selectedTemplate = ref({ id: 1, name: 'Standart etiketka', size: '40x30 mm' });
const openTemplateModal = () => {
  isTemplateModalOpen.value = true;
};

// Bekor qilish funksiyasi
const closeTemplateModal = () => {
  isTemplateModalOpen.value = false;
};

// Saqlash funksiyasi
const currentTemplateName = ref(null)
const saveTemplateSettings = async () => {
  try {
    // 1. Tahrirlangan yoki tanlangan shablonni store-dan olamiz
    const template = printerStore.currentTemplate;

    if (!template || !template._id) {
      // Agar shablon hali tanlanmagan bo'lsa, xabar berish
      return; 
    }

    // 2. Agar tahrirlash rejimi yoqilgan bo'lsa, avval o'zgarishlarni bazaga saqlaymiz
    // (Siz yozgan LabelSettings ichidagi handleSave chaqiriladi)
    // await printerStore.saveTemplate(template);

    // 3. Tanlangan shablon ID-sini asosiy printer formasiga o'rnatamiz
    // Bu ID keyinchalik chop etishda backend-ga qaysi shablondan foydalanishni aytadi
    form.templateId = template._id;

    // 4. Modalni yopamiz
    isTemplateModalOpen.value = false;
    currentTemplateName.value=template.name
    // Konsolda tekshirish uchun
    console.log("Tanlangan shablon ID:", template.name);

  } catch (error) {
    console.error("Shablonni saqlashda xatolik:", error);
  }
};
onMounted(()=>{
  productStore.GetAll(),
  counterpartyStore.GetAll()

})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }

/* Animatsiyalar */
.queue-list-enter-active, .queue-list-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.queue-list-enter-from { opacity: 0; transform: scale(0.9) translateY(20px); }
.queue-list-leave-to { opacity: 0; transform: scale(0.9) translateX(50px); }

@keyframes shimmer { 100% { transform: translateX(100%); } }
.animate-shimmer { animation: shimmer 2.5s infinite; }

input::-webkit-outer-spin-button, 
input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
</style>