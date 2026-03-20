<script setup>
import { ref, reactive } from 'vue';
import DrawerBase from '../../../UI/Drawer.vue'; 
import GeneralSettings from './GeneralSettings.vue';
import LabelSettings from './LabelSettings.vue';
import ReceiptSettings from './ReceiptSettings.vue';

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue']);

const activeTab = ref('general');
const printers = ref(['P1 Label Printer', 'XP-80 Receipt', 'Canon LBP6030']);
const labelTemplates = ref(['40x30', '30x20', '35x60', '60x30', '60x40']);

const settings = reactive({
  labelPrinter: 'P1 Label Printer',
  receiptPrinter: '',
  scale: 80,
  pcMode: true
});

const clearLocalDatabase = () => {
  if(confirm("Lokal ma'lumotlarni tozalamoqchimisiz?")) {
    localStorage.clear();
    window.location.reload();
  }
};

const saveSettings = () => {
  localStorage.setItem('sys_settings', JSON.stringify(settings));
  emit('update:modelValue', false);
};
</script>

<template>
  <DrawerBase 
    :modelValue="modelValue" 
    @update:modelValue="val => emit('update:modelValue', val)"
    title="Sozlamalar"
    subtitle="Printer va tizim parametrlarini boshqarish"
    maxWidth="100%"
  >
    <div class="flex gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl mb-8 border dark:border-white/5">
      <button 
        v-for="tab in [
          {id: 'general', label: 'Asosiy Sozlamalar', icon: 'fa-gear'},
          {id: 'label', label: 'Narx belgisi', icon: 'fa-barcode'},
          {id: 'receipt', label: 'Checkni sozlash', icon: 'fa-receipt'}
        ]" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2',
          activeTab === tab.id ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700']"
      >
        <i :class="['fa-solid', tab.icon]"></i> {{ tab.label }}
      </button>
    </div>

    <GeneralSettings 
      v-if="activeTab === 'general'" 
      :settings="settings" 
      :printers="printers" 
      @clear-db="clearLocalDatabase" 
    />
    
    <LabelSettings 
      v-if="activeTab === 'label'" 
      :templates="labelTemplates" 
    />
    
    <ReceiptSettings 
      v-if="activeTab === 'receipt'" 
    />

    <!-- <template #footer-actions>
      <div class="flex gap-4 w-full">
        <button @click="emit('update:modelValue', false)" class="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 font-black uppercase text-[11px] tracking-widest">
          Bekor qilish
        </button>
        <button @click="saveSettings" class="flex-[2] py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-500/30 hover:-translate-y-1 transition-all">
          Saqlash
        </button>
      </div>
    </template> -->
  </DrawerBase>
</template>