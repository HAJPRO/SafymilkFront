<template>
  <div class="p-6 bg-[#F8FAFC] min-h-screen font-sans space-y-8">
    
    <header class="flex items-center justify-between bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-sm border border-white sticky top-0 z-50">
      <div class="flex items-center gap-5">
        <div class="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-100 ring-4 ring-emerald-50">
          <i class="fa-solid fa-user-tie text-2xl"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-black text-slate-800 tracking-tight">Ishga qabul qilish</h1>
            <CustomBadge variant="emerald" text="YANGI HUJJAT" small dot />
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">1C: HR-System / Priem na rabotu</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <CustomButton variant="secondary" outline @click="resetForm">Tozalash</CustomButton>
        <CustomButton variant="primary" color="emerald" leftIcon="fa-solid fa-check-double" @click="handleHiring">
          Buyruqni tasdiqlash
        </CustomButton>
      </div>
    </header>

    <div class="grid grid-cols-12 gap-8">
      
      <aside class="col-span-12 lg:col-span-4 space-y-6">
        <div class="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-8 flex items-center gap-2">
            <i class="fa-solid fa-id-card-clip text-sm"></i> Shaxsiy ma'lumotlar
          </h3>
          
          <div class="space-y-6">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">F.I.SH (To'liq)</label>
              <input v-model="form.fullName" placeholder="Falonchiyev Pismadonchi..." 
                     class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tug'ilgan sana</label>
                <input type="date" v-model="form.birthDate" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jinsi</label>
                <select v-model="form.gender" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-bold outline-none cursor-pointer">
                  <option value="male">Erkak</option>
                  <option value="female">Ayol</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon va Aloqa</label>
              <div class="relative">
                <span class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">+998</span>
                <input v-model="form.phone" placeholder="90 123 45 67" 
                       class="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-5 py-4 text-sm font-bold outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6 relative overflow-hidden shadow-2xl">
          <i class="fa-solid fa-shield-halved absolute -right-6 -bottom-6 text-9xl opacity-10 -rotate-12"></i>
          <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400">Tizim holati</h4>
          <div class="space-y-4 relative z-10">
            <div class="flex justify-between items-center pb-4 border-b border-slate-800">
              <span class="text-xs text-slate-400 italic">Shtat birligi:</span>
              <CustomBadge variant="emerald" text="Bo'sh joy bor" small dot outline />
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-400 italic">MS shartnomasi:</span>
              <span class="text-[10px] font-black uppercase tracking-widest">Generatsiya qilinadi</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="col-span-12 lg:col-span-8 space-y-6">
        
        <section class="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-8 flex items-center gap-3">
            <span class="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            Ish joyi va Mehnat tartibi
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bo'linma (Otdel)</label>
                <select v-model="form.department" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/10">
                  <option value="it">Dasturlash va IT</option>
                  <option value="hr">Inson resurslari</option>
                  <option value="fin">Buxgalteriya va Moliya</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lavozim (Doljnost)</label>
                <select v-model="form.position" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/10">
                  <option value="senior">Senior Specialist</option>
                  <option value="mid">Middle Specialist</option>
                  <option value="jun">Junior Specialist</option>
                </select>
              </div>
            </div>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ish boshlash sanasi</label>
                <input type="date" v-model="form.hireDate" class="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl px-5 py-4 text-sm font-black text-emerald-700 outline-none" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ish grafigi (1C Engine)</label>
                <select v-model="form.schedule" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black outline-none cursor-pointer">
                  <option v-for="s in schedules" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section class="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
          <div class="flex items-center justify-between">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">Mehnatga haq to'lash (Calculation)</h3>
            <div class="flex gap-4">
              <div class="text-right">
                <p class="text-[8px] font-black text-slate-400 uppercase">Sinov muddati</p>
                <div class="flex items-center gap-2">
                  <input v-model="form.probation" type="number" class="w-12 bg-transparent text-sm font-black text-slate-700 outline-none border-b border-slate-200 text-center" />
                  <span class="text-[10px] font-bold text-slate-400 uppercase">oy</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-2 group hover:bg-white hover:border-emerald-200 transition-all">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asosiy tarif (Oklad)</span>
              <div class="flex items-center gap-2">
                <input v-model="form.salary" type="number" class="w-full bg-transparent text-2xl font-black text-slate-800 outline-none" />
                <span class="text-[10px] font-bold text-slate-400 uppercase">UZS</span>
              </div>
            </div>

            <div class="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stavka ulushi</span>
              <select v-model="form.rate" class="w-full bg-transparent text-2xl font-black text-slate-800 outline-none cursor-pointer">
                <option :value="1">1.0 Full</option>
                <option :value="0.75">0.75 Part</option>
                <option :value="0.5">0.5 Half</option>
              </select>
            </div>

            <div class="p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-1">
              <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Jami hisob (Brutto)</span>
              <div class="text-2xl font-black text-emerald-700 tracking-tighter">
                {{ formatMoney(form.salary * form.rate) }}
              </div>
              <p class="text-[8px] font-bold text-emerald-400">Ushlanmalargacha</p>
            </div>
          </div>

          <div class="rounded-[2rem] border border-slate-100 overflow-hidden">
            <DataTable :items="taxCalculation" :columns="taxColumns" hide-pagination />
          </div>
        </section>
      </main>
    </div>

    <ConfirmDialog ref="confirmRef" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

// Proyektdagi UI komponentlar chaqirilishi
import DataTable from '../../../UI/DataTable.vue';
import CustomBadge from '../../../UI/Badge.vue';
import CustomButton from '../../../UI/Button.vue';
import ConfirmDialog from '../../../UI/ConfirmDialog.vue';

const confirmRef = ref(null);

const schedules = [
  { id: 1, name: 'Asosiy 5/2 (8:00 - 17:00)' },
  { id: 2, name: 'Smena A 2/2' },
  { id: 3, name: 'Sutka-uch (Siklichniy)' }
];

const form = reactive({
  fullName: '',
  birthDate: '1998-05-15',
  gender: 'male',
  phone: '',
  department: 'it',
  position: 'senior',
  hireDate: new Date().toISOString().split('T')[0],
  schedule: 1,
  salary: 12000000,
  rate: 1,
  probation: 3
});

// UI Komponent: DataTable ustunlari
const taxColumns = [
  { key: 'label', label: 'TO\'LOV VA USHLANMALAR TURI', width: '300px' },
  { key: 'percent', label: 'KOEFFITSIENT', align: 'center' },
  { key: 'value', label: 'SUMMA (UZS)', align: 'right' },
];

// Logika: 1C kabi soliq hisob-kitobini simulyatsiya qilish
const taxCalculation = computed(() => {
  const gross = form.salary * form.rate;
  const incomeTax = gross * 0.12; // 12% JShDS
  const net = gross - incomeTax;

  return [
    { label: 'Hisoblangan ish haqi (Oklad)', percent: '1.0', value: formatMoney(gross) },
    { label: 'Daromad solig\'i (JShDS)', percent: '12%', value: formatMoney(incomeTax) },
    { label: 'Qo\'lga tegadigan summa (Netto)', percent: '88%', value: formatMoney(net) }
  ];
});

const formatMoney = (val) => {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(val));
};

const handleHiring = async () => {
  if (!form.fullName) {
    alert("Xodim F.I.SHini kiritish majburiy!");
    return;
  }

  // UI Komponent: ConfirmDialog asinxron muloqot
  const confirmed = await confirmRef.value.open({
    title: "Buyruqni tasdiqlash",
    message: `${form.fullName} uchun ishga qabul qilish buyrug'ini rasmiylashtirmoqchimisiz?`,
    variant: 'primary'
  });

  if (confirmed) {
    console.log("Saving Hiring Prikaz...", { ...form });
    alert("Hujjat muvaffaqiyatli saqlandi!");
  }
};

const resetForm = () => {
  form.fullName = '';
  form.salary = 5000000;
};
</script>

<style scoped>
/* Input raqamlaridagi arrowlarni yashirish */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
</style>