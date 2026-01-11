<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: { type: [Object, File, String, Array], default: null },
  type: { 
    type: String, 
    default: 'file', 
    validator: (v) => ['file', 'image'].includes(v) 
  },
  multiple: { type: Boolean, default: false },
  label: { type: String, default: '' },
  accept: { type: String, default: '*' },
  maxSize: { type: Number, default: 10 }, 
  error: { type: [String, Boolean], default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  progress: { type: Number, default: 0 }, 
  rounded: { type: String, default: 'rounded-[2rem]' }
});

const emit = defineEmits(['update:modelValue', 'change', 'remove']);

const fileInput = ref(null);
const isDragging = ref(false);
const previewModal = ref(null);

// 1. API URL ni aniqlash (.env dan yoki default)
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// 2. URL shakllantirish funksiyasi (Muhim!)
const resolveUrl = (file) => {
  if (!file) return '';
  
  // 1. Yangi tanlangan fayl (File Object)
  if (file instanceof File) {
    return URL.createObjectURL(file);
  }
  
  // 2. String bo'lsa (URL, Path yoki Base64)
  if (typeof file === 'string') {
    // Agar rasm allaqachon to'liq URL yoki Base64 bo'lsa
    // Base64 odatda 'data:image/...' bilan boshlanadi
    if (file.startsWith('http') || file.startsWith('data:image')) {
      return file; 
    }
    
    // Agar shunchaki serverdagi yo'l bo'lsa (uploads/...)
    const cleanApiUrl = API_URL.replace(/\/+$/, '');
    const cleanFilePath = file.replace(/^\/+/, '');
    return `${cleanApiUrl}/${cleanFilePath}`;
  }
  
  return '';
};

// Fayl ma'lumotlarini olish (ikonkalar uchun)
const getFileInfo = (file) => {
  if (!file) return null;
  const name = typeof file === 'string' ? file : file.name;
  const ext = name?.split('.').pop().toLowerCase();
  
  const config = {
    pdf:  { icon: 'fa-file-pdf', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    doc:  { icon: 'fa-file-word', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    docx: { icon: 'fa-file-word', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    xls:  { icon: 'fa-file-excel', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    xlsx: { icon: 'fa-file-excel', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    zip:  { icon: 'fa-file-zipper', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    jpg:  { icon: 'fa-file-image', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    png:  { icon: 'fa-file-image', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  };
  return config[ext] || { icon: 'fa-file-lines', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10' };
};

// Preview qilish funksiyasi
const openPreview = (file) => {
  const url = resolveUrl(file);
  const fileName = typeof file === 'string' ? file : file.name;
  const ext = fileName.split('.').pop().toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    previewModal.value = { type: 'image', url };
  } else {
    window.open(url, '_blank');
  }
};

const handleFiles = (newFiles) => {
  if (props.disabled || props.loading) return;
  let filesArray = Array.from(newFiles).filter(f => f.size <= props.maxSize * 1024 * 1024);

  if (props.multiple) {
    const updatedList = [...(Array.isArray(props.modelValue) ? props.modelValue : []), ...filesArray];
    emit('update:modelValue', updatedList);
    emit('change', updatedList);
  } else {
    emit('update:modelValue', filesArray[0]);
    emit('change', filesArray[0]);
  }
};

const removeFile = (index) => {
  if (props.loading) return;
  if (props.multiple && Array.isArray(props.modelValue)) {
    const updatedList = props.modelValue.filter((_, i) => i !== index);
    emit('update:modelValue', updatedList);
    emit('remove', index);
  } else {
    emit('update:modelValue', null);
    emit('remove', 0);
  }
};

// Image Previews computed (Lokal va Server URL lari bilan ishlaydi)
const imagePreviews = computed(() => {
  if (!props.modelValue) return [];
  const vals = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue];
  return vals.map(file => resolveUrl(file)).filter(u => u !== '');
});
</script>

<template>
  <div class="flex flex-col w-full gap-2 font-sans">
    <label v-if="label" class="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">
      {{ label }}
    </label>

    <div
      @dragover.prevent="!(disabled || loading) && (isDragging = true)"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="isDragging = false; handleFiles($event.dataTransfer.files)"
      :class="[
        'relative group transition-all duration-500 border-2 border-dashed flex items-center justify-center overflow-hidden',
        type === 'image' && !multiple ? 'aspect-square ' + rounded : 'min-h-[115px] rounded-[1.5rem]',
        isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950',
        error ? 'border-rose-400 bg-rose-50/20' : 'hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/40',
        disabled || loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      <input type="file" ref="fileInput" class="hidden" :multiple="multiple" :accept="type === 'image' ? 'image/*' : accept" @change="handleFiles($event.target.files)" />

      <div v-if="loading" class="absolute inset-0 z-20 bg-white/90 dark:bg-slate-950/90 flex flex-col items-center justify-center p-4">
        <svg class="w-12 h-12 -rotate-90 mb-2">
          <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent" class="text-slate-100 dark:text-slate-800"/>
          <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent" 
            stroke-dasharray="125.6" :stroke-dashoffset="125.6 - (125.6 * progress) / 100" class="text-indigo-600 transition-all duration-300 stroke-round"/>
        </svg>
        <span class="text-[10px] font-bold text-slate-500">{{ progress }}%</span>
      </div>

      <div v-if="(!modelValue || (Array.isArray(modelValue) && modelValue.length === 0)) && !loading" @click="fileInput.click()" class="flex flex-col items-center gap-2 p-6">
        <div class="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-300 border border-slate-100 dark:border-slate-800 shadow-sm">
          <i :class="['fa-solid', type === 'image' ? 'fa-images' : 'fa-cloud-arrow-up', 'text-xl']"></i>
        </div>
        <span class="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
          {{ multiple ? 'Fayllarni yuklash' : 'Faylni tanlang' }}
        </span>
      </div>

      <div v-else-if="type === 'image' && multiple && !loading" class="w-full p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
        <div v-for="(img, idx) in imagePreviews" :key="idx" class="relative aspect-square rounded-2xl overflow-hidden group/item shadow-sm">
          <img :src="img" class="w-full h-full object-cover" @error="(e) => e.target.src = '/no-image.png'" />
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-all flex items-center justify-center gap-2">
             <button @click.stop="openPreview(Array.isArray(modelValue) ? modelValue[idx] : modelValue)" class="w-7 h-7 rounded-full bg-white text-indigo-600 flex items-center justify-center text-[10px] hover:scale-110"><i class="fa-solid fa-eye"></i></button>
             <button @click.stop="removeFile(idx)" class="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] hover:scale-110"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
        <button @click.stop="fileInput.click()" class="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-all"><i class="fa-solid fa-plus"></i></button>
      </div>

      <template v-else-if="type === 'image' && !multiple && !loading">
        <img :src="imagePreviews[0]" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" @error="(e) => e.target.src = '/no-image.png'" />
        <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
          <button @click.stop="openPreview(modelValue)" class="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white hover:text-indigo-600"><i class="fa-solid fa-eye"></i></button>
          <button @click.stop="fileInput.click()" class="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white hover:text-indigo-600"><i class="fa-solid fa-camera-rotate"></i></button>
          <button @click.stop="removeFile(0)" class="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-rose-500"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </template>

      <div v-else-if="type === 'file' && !loading" class="w-full p-3 flex flex-col gap-2">
         <div v-for="(file, idx) in (Array.isArray(modelValue) ? modelValue : [modelValue])" :key="idx" 
              class="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div @click.stop="openPreview(file)" class="flex items-center gap-3 min-w-0 cursor-zoom-in">
              <div :class="['w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg', getFileInfo(file).bg, getFileInfo(file).color]">
                <i :class="['fa-solid', getFileInfo(file).icon]"></i>
              </div>
              <div class="flex flex-col min-w-0 text-left">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{{ typeof file === 'string' ? file.split('/').pop() : file.name }}</span>
                <span class="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Ko'rish uchun bosing</span>
              </div>
            </div>
            <button @click.stop="removeFile(idx)" class="w-8 h-8 text-slate-300 hover:text-rose-500 transition-all"><i class="fa-solid fa-circle-xmark text-lg"></i></button>
         </div>
         <button v-if="multiple" @click="fileInput.click()" class="w-full py-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest">+ Fayl qo'shish</button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="previewModal" @click="previewModal = null" class="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
        <button class="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
        <img v-if="previewModal.type === 'image'" :src="previewModal.url" class="max-w-full max-h-[90vh] rounded-xl shadow-2xl transition-transform" @click.stop />
      </div>
    </transition>

    <transition name="slide-up">
      <p v-if="error" class="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1.5 mt-1">
        <i class="fa-solid fa-circle-exclamation animate-bounce"></i> {{ error }}
      </p>
    </transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(-8px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.stroke-round { stroke-linecap: round; }
circle { transition: stroke-dashoffset 0.35s; transform-origin: 50% 50%; }
</style>