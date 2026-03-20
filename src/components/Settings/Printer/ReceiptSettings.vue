<script setup>
import { ref, computed, onMounted } from 'vue';
import html2pdf from 'html2pdf.js';

// 1. ASOSIY HOLAT (STATE)
const config = ref({
  companyName: 'Unit Megamarket',
  address: 'Toshkent sh., Chilonzor tumani, 19-mavze',
  phone: '+998 71 123 45 67',
  socials: '@unit_market',
  welcomeMessage: 'Xaridingiz uchun rahmat!',
  logo: "https://via.placeholder.com/150?text=LOGO",
  fiscalQr: "https://avatars.mds.yandex.net/i?id=167e479fb4c140306ed8a3eb70cf82d7730940a8-4219883-images-thumbs&n=13",
  widthMm: 80,
  
  // Xodim va Kassa ma'lumotlari
  kassirName: 'Admin (N. Malikov)',
  terminalId: 'N10029384',
  kassaNomi: 'Kassa №1',
  chekRaqami: '000045',
  paymentType: 'KARTA', 
  
  // Hisob-kitoblar
  totalSum: 125000,
  serviceFeePercent: 10,
  discountSum: 5000,
  clientName: 'Azizov Alisher',
  clientBalance: 150000,

  // Toggles
  showAddress: true,
  showSocials: true,
  showFiscalQr: true,
  showDiscount: true,
  showClientBalance: true,
  showServiceFee: true,
  showKashback: true,
  showStaffInfo: true,
});

// 2. VAQT VA HISOBLASH
const currentDateTime = ref('');
const updateTime = () => {
  currentDateTime.value = new Intl.DateTimeFormat('uz-UZ', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date());
};

onMounted(() => {
  updateTime();
  setInterval(updateTime, 1000);
});

const serviceFeeAmount = computed(() => (config.value.totalSum * config.value.serviceFeePercent) / 100);
const finalTotal = computed(() => config.value.totalSum + serviceFeeAmount.value - config.value.discountSum);
const kashbackAmount = computed(() => Math.floor(config.value.totalSum * 0.01));

// 3. SHABLON PARAMETRLARI
const params = ref([
  { id: 'header', label: 'Sarlavha', value: 14, weight: 'Bold', spacing: 200 },
  { id: 'meta', label: 'Sana/Kassa', value: 8, weight: 'Normalniy', spacing: 50 },
  { id: 'info', label: 'Manzil/Aloqa', value: 9, weight: 'Normalniy', spacing: 100 },
  { id: 'products', label: 'Mahsulotlar', value: 10, weight: 'Normalniy', spacing: 400 },
  { id: 'total', label: 'Jami Summa', value: 16, weight: 'Bold', spacing: 200 },
  { id: 'greeting', label: 'Tashrif matni', value: 11, weight: 'Bold', spacing: 100 },
  { id: 'fiscal', label: 'Fiskal qism', value: 8, weight: 'Normalniy', spacing: 50 },
]);

const widthInPx = computed(() => config.value.widthMm * 3.78);

const getStyle = (id) => {
  const p = params.value.find(x => x.id === id);
  return {
    fontSize: `${p.value}px`,
    fontWeight: p.weight === 'Bold' ? '700' : '400',
    letterSpacing: `${p.spacing / 1000}px`,
  };
};

// 4. FUNKSIYALAR
const handleImageUpload = (event, type) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => config.value[type] = e.target.result;
    reader.readAsDataURL(file);
  }
};

const exportToPdf = () => {
  const element = document.getElementById('receipt-canvas');
  const opt = {
    margin: 0,
    filename: `Chek_${config.value.chekRaqami}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true },
    jsPDF: { unit: 'mm', format: [config.value.widthMm, 220], orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
};
</script>

<template>
  <div class="flex flex-col lg:flex-row h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans">
    
    <div class="w-full lg:w-[680px] bg-white dark:bg-slate-900 border-r border-slate-200 p-6 overflow-y-auto custom-scroll shadow-2xl">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 class="text-2xl font-black text-slate-800 dark:text-white tracking-tighter italic underline decoration-blue-500 underline-offset-8">POS DESIGNER</h1>
        <button @click="exportToPdf" class="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">
          💾 PDF CHIQARISH
        </button>
      </div>

      <div class="mb-8 space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-200 dark:border-slate-700">
        <h2 class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Asosiy Ma'lumotlar</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-[10px] font-bold ml-2">Korxona Nomi</label>
            <input v-model="config.companyName" placeholder="Unit Megamarket" class="input-full">
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold ml-2">Manzil</label>
            <input v-model="config.address" placeholder="Toshkent sh., ..." class="input-full">
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold ml-2">Telefon</label>
            <input v-model="config.phone" placeholder="+998..." class="input-full">
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold ml-2">Ijtimoiy tarmoq</label>
            <input v-model="config.socials" placeholder="@tg_kanali" class="input-full">
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div class="space-y-1">
          <label class="text-[9px] font-black uppercase text-blue-500 ml-1">Kassir</label>
          <input v-model="config.kassirName" class="input-full">
        </div>
        <div class="space-y-1">
          <label class="text-[9px] font-black uppercase text-blue-500 ml-1">Chek №</label>
          <input v-model="config.chekRaqami" class="input-full">
        </div>
        <div class="space-y-1">
          <label class="text-[9px] font-black uppercase text-blue-500 ml-1">To'lov</label>
          <select v-model="config.paymentType" class="input-full">
            <option>NAQD</option>
            <option>KARTA</option>
            <option>UZUM</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-[9px] font-black uppercase text-blue-500 ml-1">Eni (mm)</label>
          <input type="number" v-model="config.widthMm" class="input-full">
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div v-for="param in params" :key="param.id" class="p-3 bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl shadow-sm">
          <label class="text-[8px] font-black text-slate-400 uppercase block mb-1">{{ param.label }}</label>
          <input type="number" v-model="param.value" class="input-mini mb-1">
          <select v-model="param.weight" class="input-mini">
            <option>Normalniy</option>
            <option>Bold</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-10">
        <button v-for="(val, key) in {
          showAddress: 'Manzil', showSocials: 'Aloqa', 
          showFiscalQr: 'Fiskal QR', showKashback: 'Kashbek',
          showClientBalance: 'Balans', showStaffInfo: 'Meta',
          showServiceFee: 'Xizmat', showDiscount: 'Skidka'
        }" :key="key" @click="config[key] = !config[key]" 
        :class="config[key] ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 border-slate-200'"
        class="text-[9px] font-bold p-3 rounded-xl transition-all uppercase border flex justify-between items-center">
          {{ val }}
          <div :class="config[key] ? 'bg-blue-400' : 'bg-slate-200'" class="w-1.5 h-1.5 rounded-full"></div>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-10">
        <div class="upload-zone border-blue-400">
          <input type="file" @change="e => handleImageUpload(e, 'logo')" class="hidden-input">
          <span class="text-[10px] font-bold text-blue-600">🖼 LOGO YUKLASH</span>
        </div>
        <div class="upload-zone border-indigo-400">
          <input type="file" @change="e => handleImageUpload(e, 'fiscalQr')" class="hidden-input">
          <span class="text-[10px] font-bold text-indigo-600">🔳 QR YUKLASH</span>
        </div>
      </div>
    </div>

    <div class="flex-1 flex justify-center items-start p-4 lg:p-10 bg-slate-200 dark:bg-slate-950 overflow-y-auto custom-scroll">
      <div id="receipt-canvas" class="bg-white text-black p-8 shadow-2xl relative" :style="{ width: widthInPx + 'px', fontFamily: 'monospace' }">
        
        <div v-if="config.logo" class="flex justify-center mb-6">
          <img :src="config.logo" class="max-w-[120px] grayscale opacity-90">
        </div>

        <div class="text-center mb-4">
          <h1 :style="getStyle('header')" class="uppercase leading-tight mb-2 px-2">{{ config.companyName }}</h1>
          <p v-if="config.showAddress" :style="getStyle('info')" class="opacity-70 px-4 italic leading-tight">{{ config.address }}</p>
          <p v-if="config.showSocials" :style="getStyle('info')" class="mb-3 opacity-60">
             Tel: {{ config.phone }}<br>{{ config.socials }}
           </p>
        </div>

        <div v-if="config.showStaffInfo" :style="getStyle('meta')" class="border-y-2 border-black border-dotted py-3 mb-6 space-y-1 uppercase">
          <div class="flex justify-between">
            <span>Chek №: {{ config.chekRaqami }}</span>
            <span>{{ config.kassaNomi }}</span>
          </div>
          <div class="flex justify-between">
            <span>Sana: {{ currentDateTime }}</span>
          </div>
          <div class="flex justify-between">
            <span>Kassir:</span>
            <span class="font-bold">{{ config.kassirName }}</span>
          </div>
          <div class="flex justify-between text-[7px] opacity-60">
            <span>Terminal: {{ config.terminalId }}</span>
            <span>To'lov: {{ config.paymentType }}</span>
          </div>
        </div>

        <div :style="getStyle('products')" class="space-y-2 mb-6">
          <div class="flex justify-between font-black border-b border-black pb-1 uppercase text-[9px]">
            <span>Nomi</span>
            <span>Summa</span>
          </div>
          <div class="flex justify-between">
            <span>TOVAR 001 (1x)</span>
            <span>{{ config.totalSum.toLocaleString() }}</span>
          </div>
          <div v-if="config.showServiceFee" :style="getStyle('products')"  class="flex justify-between  italic opacity-60">
            <span>Xizmat haqi ({{ config.serviceFeePercent }}%):</span>
            <span>+{{ serviceFeeAmount.toLocaleString() }}</span>
          </div>
          <div v-if="config.showDiscount" :style="getStyle('products')"  class="flex justify-between  text-red-600 font-bold italic">
            <span>Chegirma:</span>
            <span>-{{ config.discountSum.toLocaleString() }}</span>
          </div>
        </div>

        <div class="border-t-2 border-black border-double pt-4 mb-6">
          <div :style="getStyle('total')" class="flex justify-between items-center leading-none">
            <span>JAMI:</span>
            <span>{{ finalTotal.toLocaleString() }} UZS</span>
          </div>
          
          <div v-if="config.showKashback" class="mt-4 flex justify-between bg-slate-100 border-2 border-slate-200 p-2 rounded-lg text-[10px] font-black">
            <span>🎁 KASHBEK (1%):</span>
            <span>+{{ kashbackAmount.toLocaleString() }} UZS</span>
          </div>
        </div>

        <div v-if="config.showClientBalance" :style="getStyle('info')" class="mb-8  p-2 bg-slate-50 py-2">
           <div class="opacity-50 text-[8px] uppercase font-bold mb-1">Mijoz: {{ config.clientName }}</div>
           <div class="flex justify-between">
             <span>Balans:</span>
             <span class="font-black text-blue-700">{{ config.clientBalance.toLocaleString() }} UZS</span>
           </div>
        </div>

        <div class="text-center py-4 border-t border-slate-300 border-dashed">
           
           <p :style="getStyle('greeting')" class="uppercase tracking-widest  text-black px-1 py-1 inline-block">
             {{ config.welcomeMessage }}
           </p>
        </div>

   <div v-if="config.showFiscalQr" class="fiscal-section flex flex-col items-center pt-6 border-t-2 border-dashed border-gray-300 mt-6">
  
  <div :style="getStyle('fiscal')" class="w-full text-[10px] leading-relaxed font-mono text-gray-600 uppercase mb-4">
    <div class="flex justify-between">
      <span>Seriya raqami:</span>
      <span class="font-bold text-black">100307</span>
    </div>
    <div class="flex justify-between">
      <span>FM raqami:</span>
      <span class="font-bold text-black">VG298430011007</span>
    </div>
    <div class="flex justify-between">
      <span>Chek raqami:</span>
      <span class="font-bold text-black">5522</span>
    </div>
    <div class="flex justify-between border-t border-gray-100 pt-1 mt-1 italic">
      <span>Fiskal belgi:</span>
      <span>931371327789</span>
    </div>
  </div>

  <div v-if="config.fiscalQr" class="qr-wrapper p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
    <img :src="config.fiscalQr" alt="Fiscal QR" class="w-28 h-28 object-contain">
  </div>
  
</div>
        <div class="absolute -bottom-1 left-0 right-0 flex justify-around opacity-10">
           <div v-for="i in 18" :key="i" class="w-3 h-3 bg-black rotate-45 -mb-2"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-mini { @apply w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-[9px] outline-none focus:ring-1 ring-blue-500 transition-all; }
.input-full { @apply w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs outline-none focus:ring-2 ring-blue-600 dark:text-white transition-all shadow-sm font-medium; }
.upload-zone { @apply relative border-2 border-dashed rounded-3xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer overflow-hidden; }
.hidden-input { @apply absolute inset-0 opacity-0 cursor-pointer z-10; }

.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { @apply bg-slate-300 dark:bg-slate-700 rounded-full; }

@media (max-width: 1023px) {
  .lg\:w-\[680px\] { height: 45vh; border-r: 0; border-b: 2px solid #e2e8f0; }
  .h-screen { height: auto; min-height: 100vh; overflow: auto; }
}
</style>