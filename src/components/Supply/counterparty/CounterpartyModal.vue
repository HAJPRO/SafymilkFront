<script setup>
import { onMounted, ref, reactive, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from "../../../UI/utils/useToast";

const { toast } = useToast();

// --- STORES ---
import { CounterpartyStore } from "../../../stores/Supply/counterparty/counterparty.store";
import { AddressStore } from "../../../stores/Helpers/address/address.store";

// --- CUSTOM UI COMPONENTS ---
import Modal from "../../../UI/Modal.vue";
import Select from "../../../UI/Select.vue";
import Button from "../../../UI/Button.vue";
import Input from "../../../UI/Input.vue";
import MapView from "../../../components/Customers/customerManagment/MapView.vue";

const store_address = AddressStore();
const store_counterparty = CounterpartyStore();

const { regions, districts, neighborhoods } = storeToRefs(store_address);
const { custom_modal, modal, TitleAction } = storeToRefs(store_counterparty);

// --- STATE ---
const isMapOpen = ref(false);
const activeTab = ref('basic');
const isSubmitting = ref(false);

const counterpartyTypes = [
  { id: 'legal', name: "Fermer", icon: 'fa-building-wheat', desc: 'Yuridik' },
  { id: 'physical', name: "Aholi", icon: 'fa-house-user', desc: 'Jismoniy' },
];

const tabs = [
  { id: 'basic', name: 'Asosiy', icon: 'fa-id-card', subtitle: 'Shaxsiy' },
  { id: 'bank', name: 'Moliya', icon: 'fa-file-invoice-dollar', subtitle: 'Rekvizit' },
  { id: 'address', name: 'Manzil', icon: 'fa-map-location-dot', subtitle: 'GPS' }
];

// --- 🧠 SMART LOGIC ---

const completionRate = computed(() => {
  const m = modal.value.model;
  const fields = [m.fullname, m.phoneNumber, m.code, m.address.region, m.address.district];
  const filled = fields.filter(f => !!f).length;
  return Math.round((filled / fields.length) * 100);
});

watch(() => modal.value.model.inn, (newInn) => {
  if (newInn?.length >= 1) {
    const firstDigit = newInn[0];
    if (['2', '3'].includes(firstDigit)) modal.value.model.type = 'legal';
    else if (['4', '5', '6'].includes(firstDigit)) modal.value.model.type = 'physical';
  }
});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) return toast.warning("Rasm hajmi 2MB dan oshmasligi kerak");
  const reader = new FileReader();
  reader.onload = (e) => { 
    modal.value.model.image = e.target.result; 
    toast.success("Rasm biriktirildi");
  };
  reader.readAsDataURL(file);
};

const generateSupplierCode = () => {
  const prefix = modal.value.model.type === 'legal' ? 'FRM' : 'AHL';
  const randomNum = Math.floor(1000 + Math.random() * 9999);
  modal.value.model.code = `${prefix}-${randomNum}`;
};

const handleLocationSelected = (coords) => {
  modal.value.model.location = { lat: Number(coords.lat), long: Number(coords.long) };
  modal.value.model.is_location = true;
  isMapOpen.value = false;
  toast.success("GPS koordinatalar tasdiqlandi");
};

const handleClose = () => { store_counterparty.custom_modal = false; activeTab.value = 'basic'; };

const saveCounterparty = async () => {
  if (!modal.value.model.fullname || !modal.value.model.phoneNumber || !modal.value.model.code) {
    activeTab.value = 'basic';
    return toast.warning("Majburiy maydonlarni to'ldiring!");
  }
  isSubmitting.value = true;
  try {
    await store_counterparty.Create(modal.value.model);
    handleClose();
  } catch (error) {
    toast.error("Xatolik yuz berdi");
  } finally {
    isSubmitting.value = false;
  }
};

const handleRegionChange = async (val) => {
  if (val && val.id) {
    modal.value.model.address.region = val.name;
    await store_address.Districts(val.id);
    modal.value.model.address.district = "";
  }
};

const handleDistrictChange = async (val) => {
  if (val && val.id) {
    modal.value.model.address.district = val.name;
    await store_address.Neighborhoods(val.id);
  }
};

onMounted(() => store_address.Regions());
</script>

<template>
  <Modal v-model="custom_modal" :title="TitleAction.title || 'Kontragent'" width="max-w-7xl" @close="handleClose" class="premium-modal">
    
    <div class="flex flex-col lg:flex-row gap-0 lg:gap-8 h-full min-h-[500px] lg:min-h-[640px]">
      
      <Modal v-model="isMapOpen" title="Nuqtani aniqlash" width="max-w-4xl">
        <div class="h-[400px] lg:h-[550px] w-full rounded-2xl lg:rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl">
           <MapView @locationSelected="handleLocationSelected" />
        </div>
      </Modal>

      <aside class="w-full lg:w-72 flex-none bg-slate-50/50 dark:bg-slate-900/40 lg:rounded-[3rem] p-4 lg:p-6 border-b lg:border border-slate-100 dark:border-slate-800/50 sticky top-0 z-50 backdrop-blur-xl lg:static">
        <div class="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 lg:px-0">
          <button 
            v-for="tab in tabs" :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-none lg:w-full flex items-center gap-3 lg:gap-5 p-3 lg:p-5 rounded-2xl lg:rounded-[2.2rem] transition-all duration-500 relative group min-w-[120px] lg:min-w-0"
            :class="activeTab === tab.id ? 'bg-white dark:bg-slate-800 shadow-xl shadow-indigo-500/10 scale-[1.02] lg:translate-x-3' : 'hover:bg-white/40 dark:hover:bg-slate-800/20 text-slate-400'"
          >
            <div class="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center text-lg lg:text-2xl transition-all duration-500 shadow-sm"
              :class="activeTab === tab.id ? 'bg-indigo-600 text-white rotate-6' : 'bg-slate-200/50 dark:bg-slate-700/50 group-hover:rotate-3'">
              <i :class="['fa-solid', tab.icon]"></i>
            </div>
            <div class="text-left">
              <div class="text-xs lg:text-sm font-black tracking-tight" :class="activeTab === tab.id ? 'text-slate-900 dark:text-white' : ''">{{ tab.name }}</div>
              <div class="text-[8px] lg:text-[10px] uppercase font-bold tracking-widest opacity-40 hidden sm:block">{{ tab.subtitle }}</div>
            </div>
          </button>
        </div>

        <div class="mt-12 p-6 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden hidden lg:block shadow-2xl shadow-indigo-500/30 group">
          <div class="relative z-10 text-left">
            <h4 class="text-[10px] font-black uppercase opacity-60">To'ldirish foizi</h4>
            <p class="text-4xl font-black mt-1 tabular-nums">{{ completionRate }}%</p>
            <div class="w-full h-1.5 bg-white/20 rounded-full mt-4 overflow-hidden"><div class="h-full bg-white transition-all duration-1000" :style="{ width: completionRate + '%' }"></div></div>
          </div>
          <i class="fa-solid fa-rocket absolute -right-4 -bottom-4 text-7xl opacity-10 -rotate-12 transition-all duration-1000 group-hover:rotate-0"></i>
        </div>
      </aside>

      <div class="flex-1 py-4 lg:py-4 overflow-y-auto custom-scrollbar px-3 lg:pr-6">
        
        <div v-if="activeTab === 'basic'" class="space-y-6 lg:space-y-12 animate-in pt-2">
          <div class="flex flex-col xl:flex-row gap-8 lg:gap-14 items-center xl:items-start">
            
            <div class="flex-none flex flex-col items-center gap-6">
              <div class="relative group">
                <div class="w-48 h-48 lg:w-64 lg:h-64 rounded-[3.5rem] lg:rounded-[5rem] p-1.5 bg-slate-100 dark:bg-slate-800 shadow-2xl overflow-hidden ring-4 ring-slate-50 dark:ring-slate-800">
                   <div class="w-full h-full rounded-[3rem] lg:rounded-[4.5rem] overflow-hidden bg-white dark:bg-slate-900 border-2 border-white flex items-center justify-center relative shadow-inner">
                      <img v-if="modal.model.image" :src="modal.model.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                      <i v-else class="fa-solid fa-user-tie text-5xl lg:text-7xl text-slate-200"></i>
                   </div>
                </div>
                <label class="absolute -bottom-2 -right-2 lg:-bottom-4 lg:-right-4 w-12 h-12 lg:w-16 lg:h-16 bg-indigo-600 text-white rounded-2xl lg:rounded-3xl flex items-center justify-center cursor-pointer shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 lg:border-8 border-white dark:border-slate-900">
                  <i class="fa-solid fa-plus text-lg lg:text-2xl"></i>
                  <input type="file" class="hidden" @change="handleFileUpload" accept="image/*">
                </label>
              </div>

              <div class="w-full bg-slate-50/80 dark:bg-slate-900/50 p-4 lg:p-6 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div class="grid grid-cols-2 gap-3">
                  <button v-for="t in counterpartyTypes" :key="t.id" @click="modal.model.type = t.id"
                    class="p-3 lg:p-4 rounded-2xl lg:rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-2"
                    :class="modal.model.type === t.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl translate-y-[-2px]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'">
                    <i :class="['fa-solid', t.icon, 'text-lg lg:text-xl']"></i>
                    <span class="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">{{ t.name }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex-1 w-full space-y-6 lg:space-y-10">
                <div class="p-6 lg:p-10 bg-white dark:bg-slate-800/40 rounded-[2.5rem] lg:rounded-[4.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
                  <div class="grid grid-cols-12 gap-5 lg:gap-8 text-left">
                    <div class="col-span-12">
                       <label class="form-label required">Kod</label>
                       <div class="flex gap-3">
                          <div class="flex-1 bg-slate-50 dark:bg-slate-950 px-6 py-2 rounded-2xl lg:rounded-3xl border-2 border-dashed border-indigo-100 dark:border-indigo-900 font-mono font-black text-indigo-600 text-xl lg:text-3xl flex items-center justify-center shadow-inner tracking-widest">{{ modal.model.code || '------' }}</div>
                          <Button @click="generateSupplierCode" variant="primary" size="lg" class="!rounded-2xl lg:!rounded-3xl !px-6 lg:!px-10"><i class="fa-solid fa-sync"></i></Button>
                       </div>
                    </div>
                    <div class="col-span-12">
                      <Input v-model="modal.model.fullname" label="F.I.O / Korxona nomi" placeholder="To'liq nomini kiriting..." required icon-pre="fa-solid fa-signature" size="large" />
                    </div>
                    <div class="col-span-12 lg:col-span-6">
                      <Input v-model="modal.model.phoneNumber" label="Telefon raqami" placeholder="90 123 45 67" required mask="+998 ## ### ## ##" size="large" />
                    </div>
                    <div class="col-span-12 lg:col-span-6">
                      <Input v-model="modal.model.inn" label="STIR (INN)" placeholder="INN raqami" maxlength="9" icon-pre="fa-solid fa-fingerprint" size="large" />
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'bank'" class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 animate-in pt-2">
          <div class="p-8 lg:p-10 rounded-[3rem] lg:rounded-[4rem] bg-indigo-50/40 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 space-y-8 text-left relative overflow-hidden group shadow-xl">
            <div class="relative z-10">
              <div class="flex items-center gap-5 text-indigo-600 mb-6">
                <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg flex items-center justify-center"><i class="fa-solid fa-university text-xl"></i></div>
                <h5 class="text-sm font-black uppercase tracking-widest">Bank hisobi</h5>
              </div>
              <Input v-model="modal.model.bank_details.bank_account" label="Hisob raqam" placeholder="2020 8000 ..." font-mono maxlength="20" size="large" />
              <div class="pt-6"><Input v-model="modal.model.bank_details.bank_name" label="Bank nomi" placeholder="Agrobank ATB" icon-pre="fa-solid fa-landmark-flag" size="large" /></div>
            </div>
            <i class="fa-solid fa-wallet absolute -right-12 -top-12 text-[15rem] opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000"></i>
          </div>

          <div class="p-8 lg:p-10 rounded-[3rem] lg:rounded-[4rem] bg-emerald-50/40 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 space-y-8 text-left relative overflow-hidden group shadow-xl">
            <div class="relative z-10">
              <div class="flex items-center gap-5 text-emerald-600 mb-6">
                <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-center"><i class="fa-solid fa-file-contract text-xl"></i></div>
                <h5 class="text-sm font-black uppercase tracking-widest">Shartnoma</h5>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input v-model="modal.model.contract.number" label="№" placeholder="№ 123" size="large" />
                <Input v-model="modal.model.contract.date" label="Sana" type="date" size="large" icon-pre="fa-regular fa-calendar" />
              </div>
              <div class="pt-6 relative group">
                  <Input v-model="modal.model.contract.milk_price" label="Kelishilgan narx" type="number" icon-pre="fa-solid fa-coins" size="large" class="!font-black !text-3xl !text-emerald-600" />
                  <span class="absolute right-6 bottom-4 text-xs font-black text-emerald-600 opacity-40 uppercase tracking-widest italic">UZS / Liter</span>
              </div>
            </div>
            <i class="fa-solid fa-hand-holding-dollar absolute -right-12 -top-12 text-[15rem] opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000"></i>
          </div>
        </div>

        <div v-if="activeTab === 'address'" class="space-y-6 lg:space-y-10 animate-in text-left pt-2">
          <div class="p-6 lg:p-10 bg-white dark:bg-slate-800 rounded-3xl lg:rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Select v-model="modal.model.address.region" :options="regions" labelKey="name" valueKey="name" searchable placeholder="Viloyat" @change="handleRegionChange" size="large" />
              <Select v-model="modal.model.address.district" :options="districts" labelKey="name" valueKey="name" searchable :disabled="!modal.model.address.region" placeholder="Tuman" @change="handleDistrictChange" size="large" />
              <Select v-model="modal.model.address.neighborhood" :options="neighborhoods" labelKey="name" valueKey="name" searchable :disabled="!modal.model.address.district" placeholder="Mahalla" size="large" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-slate-50 dark:border-slate-700/50 pt-8">
                <Input v-model="modal.model.address.street" label="Ko'cha / Massiv" size="large" />
                <Input v-model="modal.model.address.house" label="Uy" size="large" />
            </div>
          </div>

          <div class="relative group min-h-[300px] lg:h-[400px] rounded-[3rem] lg:rounded-[5rem] border-4 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-6 text-center transition-all hover:border-indigo-400 overflow-hidden shadow-2xl">
             <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

             <div v-if="!modal.model.is_location" class="relative z-10 flex flex-col items-center">
                <div class="w-24 h-24 lg:w-40 lg:h-40 bg-white dark:bg-slate-800 rounded-[2.5rem] lg:rounded-[3.5rem] flex items-center justify-center text-indigo-600 text-4xl lg:text-6xl mb-6 shadow-xl rotate-6 transition-transform duration-700"><i class="fa-solid fa-map-location-dot"></i></div>
                <h4 class="text-xl lg:text-2xl font-black text-slate-800 dark:text-white uppercase mb-6 tracking-tighter">GPS Geolokatsiya</h4>
                <Button @click="isMapOpen = true" variant="primary" size="large" class="!px-16 !rounded-2xl shadow-2xl shadow-indigo-500/30 active:scale-95">Xaritani ochish</Button>
             </div>
             
             <div v-else class="relative z-10 space-y-6 lg:space-y-10 animate-in text-center">
                <div class="w-20 h-20 bg-emerald-500 text-white rounded-3xl shadow-xl flex items-center justify-center text-4xl mx-auto ring-8 ring-emerald-500/10 animate-bounce-slow"><i class="fa-solid fa-check-double"></i></div>
                <div class="flex flex-col sm:flex-row gap-4 lg:gap-12 justify-center items-center">
                   <div class="flex flex-col gap-1"><span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lat</span><code class="text-md font-bold text-indigo-600 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl tabular-nums">{{ modal.model.location?.lat ? Number(modal.model.location.lat).toFixed(6) : '0.00' }}</code></div>
                   <div class="flex flex-col gap-1"><span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Long</span><code class="text-md font-bold text-indigo-600 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl tabular-nums">{{ modal.model.location?.long ? Number(modal.model.location.long).toFixed(6) : '0.00' }}</code></div>
                </div>
                <Button @click="isMapOpen = true" variant="light" size="sm" class="!rounded-[1.2rem] border-slate-200 px-10 hover:bg-slate-100">O'zgartirish</Button>
             </div>
          </div>
        </div>

      </div>
    </div>

    <template #footer>
      <div class="flex flex-col sm:flex-row justify-between items-center w-full gap-4 px-6 lg:px-10 py-3 lg:py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800/50">
        <div class="hidden lg:flex items-center gap-4 text-left">
           <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"></div>
           <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Xavfsiz tizim Online</span>
        </div>

        <div class="flex gap-4 w-full lg:w-auto">
          <Button variant="danger" @click="handleClose" left-icon="fas fa-xmark">Bekor qilish</Button>
          <Button 
            :loading="isSubmitting"
            :variant="TitleAction.action === 'create' ? 'primary' : 'success'" 
            left-icon="fas fa-check"
            @click="saveCounterparty"
          >
            {{ TitleAction.action === 'create' ? "Ro'yxatga olish" : "Yangilash" }}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.form-label { @apply block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-[0.2em] ml-5; }

.animate-in { animation: slide-up 0.7s cubic-bezier(0.2, 1, 0.2, 1); }
@keyframes slide-up {
  from { opacity: 0; transform: translateY(40px) scale(0.97); filter: blur(15px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-indigo-500 transition-colors; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.premium-modal :deep(.modal-container) {
  @apply rounded-[3rem] lg:rounded-[5rem] border-none shadow-[0_0_150px_rgba(0,0,0,0.15)] overflow-hidden;
  background: rgba(255, 255, 255, 0.99);
  backdrop-filter: blur(40px);
}

.dark .premium-modal :deep(.modal-container) { background: rgba(15, 23, 42, 0.98); }

/* Mobile Touch Optimization */
@media (max-width: 1023px) {
  aside {
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
    margin-bottom: 1rem;
  }
}

/* Date input professional style */
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover {
  background: rgba(79, 70, 229, 0.1);
  filter: invert(0.2);
}
</style>