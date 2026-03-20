<template>
  <div class="p-6 bg-[#F8FAFC] min-h-screen font-sans text-slate-700">
    
    <header class="mb-8 flex flex-wrap items-center justify-between gap-6 bg-white/70 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-sm border border-white sticky top-0 z-[100]">
      <div class="flex items-center gap-8">
        <div class="space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hisobot Davri</label>
          <input type="month" v-model="selectedPeriod" @change="rebuildTabel" 
                 class="bg-white border border-slate-200 rounded-2xl px-5 py-2.5 text-sm font-bold text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" />
        </div>
        
        <div class="h-12 w-px bg-slate-200/60 hidden md:block"></div>
        
        <div class="space-y-1.5">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hujjat Holati</span>
          <div class="flex items-center gap-2">
            <CustomBadge variant="amber" text="Loyixa" dot outline />
            <CustomBadge v-if="isModified" variant="indigo" text="O'zgarishlar bor" small />
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <CustomButton variant="secondary" outline @click="handleAutoFill" leftIcon="fa-solid fa-bolt-lightning">
          Avto-to'ldirish
        </CustomButton>
        <CustomButton variant="primary" @click="handleFinalize" leftIcon="fa-solid fa-check-double">
          1C-ga o'tkazish
        </CustomButton>
        <ExportDropdown @select="handleExport" />
      </div>
    </header>

    <DataTable 
      :items="employees" 
      :columns="tabelColumns" 
      :loading="isLoading"
      class="shadow-2xl shadow-slate-200/50 border border-slate-200/60 rounded-[3rem] overflow-hidden"
    >
      <template #employee="{ row }">
        <div class="flex items-center gap-4 py-1 cursor-pointer group" @click="openEmployeeProfile(row)">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:rotate-6 transition-transform">
            {{ row.name.split(' ').map(n => n[0]).join('') }}
          </div>
          <div class="overflow-hidden">
            <div class="font-black text-slate-700 text-sm truncate group-hover:text-indigo-600 transition-colors">{{ row.name }}</div>
            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{{ row.position }}</div>
          </div>
        </div>
      </template>

      <template v-for="day in calendarDays" :key="day.key" #[day.key]="{ row }">
        <div class="relative w-full h-full flex items-center justify-center">
          <input 
            type="text" 
            v-model="row.attendance[day.dayNumber]" 
            @focus="$event.target.select()"
            @input="isModified = true"
            :class="[
              getCodeStyle(row.attendance[day.dayNumber], day.isWeekend),
              'w-full h-[60px] text-center bg-transparent outline-none font-black text-sm transition-all uppercase focus:bg-white focus:ring-4 focus:ring-inset focus:ring-indigo-500/10'
            ]"
            maxlength="2"
          />
        </div>
      </template>

      <template #total="{ row }">
        <div class="flex flex-col items-center justify-center py-2">
          <span class="text-sm font-black text-indigo-700">{{ calculateSummary(row.attendance).hours }}s</span>
          <span class="text-[9px] font-bold text-slate-400 uppercase">{{ calculateSummary(row.attendance).days }} kun</span>
        </div>
      </template>
    </DataTable>

    <CustomModal v-model="isModalOpen" :title="selectedEmp?.name" subtitle="Xodimning shaxsiy kartochkasi" icon="fa-solid fa-user-gear" width="900px">
      <CustomTabs v-model="activeTab" :tabs="[
        {id: 'general', label: 'Asosiy ma\'lumotlar'},
        {id: 'files', label: 'Hujjatlar & Skanerlar'},
        {id: `history', label: 'O'tgan oylar`}
      ]" />

      <div class="mt-8 space-y-6">
        <div v-if="activeTab === 'general'" class="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">F.I.O</label>
            <input v-model="selectedEmp.name" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lavozimi</label>
            <input v-model="selectedEmp.position" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all" />
          </div>
        </div>

        <div v-if="activeTab === 'files'" class="animate-in fade-in slide-in-from-bottom-4">
          <FileUpload v-model="selectedEmp.docs" multiple label="Diplom, Pasport nusxalari (PDF, JPG)" />
        </div>
      </div>

      <template #footer="{ close }">
        <CustomButton variant="secondary" outline @click="close">Bekor qilish</CustomButton>
        <CustomButton variant="primary" @click="saveEmployeeData">Saqlash</CustomButton>
      </template>
    </CustomModal>

    <section class="mt-8 flex flex-wrap gap-4">
      <div v-for="(info, code) in classifiers" :key="code" 
           class="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-[1.5rem] text-[11px] font-black shadow-sm group hover:border-indigo-300 transition-all">
        <span class="w-8 h-8 rounded-xl flex items-center justify-center font-black group-hover:rotate-12 transition-transform shadow-sm" 
              :style="{ backgroundColor: info.bg, color: info.color }">{{ code }}</span>
        <span class="text-slate-500 uppercase tracking-widest">{{ info.desc }}</span>
      </div>
    </section>

    <ConfirmDialog ref="confirmRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import DataTable from '../../../UI/DataTable.vue';
import CustomBadge from '../../../UI/Badge.vue';
import CustomButton from '../../../UI/Button.vue';
import CustomModal from '../../../UI/Modal.vue';
import FileUpload from '../../../UI/Upload.vue';
import CustomTabs from '../../../UI/BaseTabs.vue';
import ConfirmDialog from '../../../UI/ConfirmDialog.vue';
import ExportDropdown from '../../../UI/ExportDropdown.vue';

// --- STATE ---
const selectedPeriod = ref("2026-02");
const isLoading = ref(false);
const isModified = ref(false);
const isModalOpen = ref(false);
const activeTab = ref('general');
const selectedEmp = ref(null);
const confirmRef = ref(null);
const calendarDays = ref([]);

const classifiers = {
  'Y':  { desc: 'Yovka (8s)', color: '#059669', bg: '#ecfdf5' },
  'D':  { desc: 'Dam olish', color: '#64748b', bg: '#f8fafc' },
  'O':  { desc: 'Ta\'til',   color: '#d97706', bg: '#fffbeb' },
  'K':  { desc: 'Kasallik',  color: '#dc2626', bg: '#fef2f2' },
  'XS': { desc: 'Xizmat safari', color: '#7c3aed', bg: '#f5f3ff' },
};

const employees = ref([
  { id: 1, name: 'Abdullayev Jaloliddin', position: 'Bosh muhandis', attendance: {}, docs: [] },
  { id: 2, name: 'Sodiqova Guli', position: 'Sifat nazorati', attendance: {}, docs: [] },
  { id: 3, name: 'Nurmatov Alisher', position: 'Texnolog', attendance: {}, docs: [] },
]);

// --- DATATABLE COLUMN GENERATION ---
const tabelColumns = computed(() => {
  const cols = [
    { key: 'employee', label: 'Xodim va Lavozim', width: '300px', fixed: 'left', sortable: true }
  ];

  calendarDays.value.forEach(day => {
    cols.push({
      key: day.key,
      label: `${day.dayNumber}\n${day.weekdayShort}`,
      width: '55px',
      align: 'center',
      headerClass: day.isWeekend ? 'bg-rose-50/50 text-rose-500' : ''
    });
  });

  cols.push({ key: 'total', label: 'Jami', width: '100px', fixed: 'right', align: 'center' });
  return cols;
});

// --- LOGIC ---
const rebuildTabel = () => {
  const [year, month] = selectedPeriod.value.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month - 1, i);
    days.push({
      key: `day_${i}`,
      dayNumber: i,
      weekdayShort: date.toLocaleDateString('uz-UZ', { weekday: 'short' }),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    });
  }
  calendarDays.value = days;
};

const getCodeStyle = (val, isWeekend) => {
  if (!val) return isWeekend ? 'bg-rose-50/20' : '';
  const c = val.toUpperCase();
  if (c === 'Y') return 'text-emerald-600 bg-emerald-50/40';
  if (c === 'D') return 'text-slate-300 bg-slate-50/50';
  if (c === 'O' || c === 'K') return 'text-rose-600 bg-rose-50/70';
  if (c === 'XS') return 'text-indigo-600 bg-indigo-50/60';
  return 'text-slate-700 bg-indigo-50/20';
};

const calculateSummary = (att) => {
  let hours = 0;
  let days = 0;
  Object.values(att).forEach(v => {
    if (v.toUpperCase() === 'Y' || v.toUpperCase() === 'XS') {
      hours += 8; days++;
    } else if (!isNaN(v) && v !== '') {
      hours += parseInt(v); if(parseInt(v) > 0) days++;
    }
  });
  return { hours, days };
};

const openEmployeeProfile = (emp) => {
  selectedEmp.value = JSON.parse(JSON.stringify(emp));
  isModalOpen.value = true;
};

const handleAutoFill = async () => {
  const ok = await confirmRef.value.open({
    title: "Avto-to'ldirish",
    message: "Bo'sh kataklar ish grafigi bo'yicha to'ldiriladi.",
    variant: 'warning'
  });
  if (ok) {
    employees.value.forEach(e => {
      calendarDays.value.forEach(d => {
        if (!e.attendance[d.dayNumber]) e.attendance[d.dayNumber] = d.isWeekend ? 'D' : 'Y';
      });
    });
    isModified.value = true;
  }
};

const handleFinalize = async () => {
  const ok = await confirmRef.value.open({
    title: "1C-ga Export",
    message: "Tabelni tasdiqlaysizmi? Amaldan so'ng tahrirlash imkoni bo'lmaydi.",
    variant: 'primary'
  });
  if (ok) {
    isLoading.value = true;
    setTimeout(() => { isLoading.value = false; isModified.value = false; }, 1500);
  }
};

const saveEmployeeData = () => {
  const idx = employees.value.findIndex(e => e.id === selectedEmp.value.id);
  employees.value[idx] = selectedEmp.value;
  isModalOpen.value = false;
};

onMounted(rebuildTabel);
</script>

<style scoped>
/* Sening DataTable'ing uchun maxsus scroll va interaktivlik */
:deep(.data-table-container) {
  max-height: 72vh;
  scrollbar-gutter: stable;
}

input::selection {
  background: #818cf8;
  color: white;
}
</style>