<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, useSlots } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number, Object, Array], default: null },
  options: { type: Array, default: () => [] },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  iconKey: { type: String, default: 'icon' },
  
  // Rejimlar
  multiple: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  allowAdd: { type: Boolean, default: false },
  
  // Kontent & Dizayn
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Tanlang...' },
  iconPre: { type: String, default: '' },
  dropdownWidth: { type: String, default: 'trigger' },
  size: { type: String, default: 'middle', validator: (v) => ['small', 'middle', 'large'].includes(v) },
  
  // Holatlar
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: [Boolean, String], default: false },
  required: { type: Boolean, default: false },
  
  // Matnlar
  noDataText: { type: String, default: "Ma'lumot topilmadi" },
  addText: { type: String, default: "yangi element sifatida qo'shish" }
});

const emit = defineEmits(['update:modelValue', 'change', 'add', 'clear']);
const slots = useSlots();

const sizeMap = {
  small: { h: 'min-h-[38px]', text: 'text-[12px]', icon: 'text-sm', rounded: 'rounded-xl' },
  middle: { h: 'min-h-[46px]', text: 'text-[14px]', icon: 'text-base', rounded: 'rounded-2xl' },
  large: { h: 'min-h-[54px]', text: 'text-[16px]', icon: 'text-lg', rounded: 'rounded-[22px]' }
};
const config = computed(() => sizeMap[props.size]);

const isOpen = ref(false);
const triggerRef = ref(null);
const dropdownRef = ref(null);
const searchInputRef = ref(null);
const searchQuery = ref('');
const dropdownPlacement = ref('bottom');

const hasValue = computed(() => {
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.length > 0;
  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '';
});

// --- UNIVERSAL QIDIRUV (Barcha atributlar bo'yicha) ---
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.options;
  
  const q = searchQuery.value.toLowerCase().trim();
  
  return props.options.filter(opt => {
    // Obyektdagi barcha qiymatlarni (fullname, phoneNumber, id, h.k) tekshirish
    return Object.values(opt).some(val => 
      val && String(val).toLowerCase().includes(q)
    );
  });
});

const selectedOptions = computed(() => {
  if (!hasValue.value) return props.multiple ? [] : null;
  const values = props.multiple ? (Array.isArray(props.modelValue) ? props.modelValue : []) : [props.modelValue];
  const found = props.options.filter(opt => values.some(v => String(v) === String(opt[props.valueKey])));
  return props.multiple ? found : (found[0] || null);
});

const isSelected = (option) => {
  const val = option[props.valueKey];
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.includes(val);
  return String(props.modelValue) === String(val);
};

const handleClear = () => {
  const emptyValue = props.multiple ? [] : null;
  emit('update:modelValue', emptyValue);
  emit('change', emptyValue);
  emit('clear');
  searchQuery.value = '';
  if (isOpen.value) close();
};

const handleSelect = (option) => {
  const val = option[props.valueKey];
  if (props.multiple) {
    const res = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const idx = res.indexOf(val);
    if (idx > -1) res.splice(idx, 1);
    else res.push(val);
    emit('update:modelValue', res);
    emit('change', res);
  } else {
    emit('update:modelValue', val);
    emit('change', option);
    close();
  }
};

const updatePosition = () => {
  if (!triggerRef.value || !isOpen.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  dropdownPlacement.value = (window.innerHeight - rect.bottom < 320) ? 'top' : 'bottom';
  
  if (dropdownRef.value) {
    dropdownRef.value.style.width = props.dropdownWidth === 'trigger' ? `${rect.width}px` : props.dropdownWidth;
    dropdownRef.value.style.left = `${rect.left}px`;
    
    if (dropdownPlacement.value === 'bottom') {
      dropdownRef.value.style.top = `${rect.bottom + 6}px`;
      dropdownRef.value.style.transformOrigin = 'top';
    } else {
      dropdownRef.value.style.bottom = `${window.innerHeight - rect.top + 6}px`;
      dropdownRef.value.style.transformOrigin = 'bottom';
    }
  }
};

const open = () => { if (!props.disabled && !props.loading) { isOpen.value = true; nextTick(() => { updatePosition(); searchInputRef.value?.focus(); window.addEventListener('scroll', updatePosition, true); }); } };
const close = () => { isOpen.value = false; searchQuery.value = ''; window.removeEventListener('scroll', updatePosition, true); };
const handleAdd = () => { if (searchQuery.value.trim()) { emit('add', searchQuery.value.trim()); searchQuery.value = ''; if (!props.multiple) close(); } };

onMounted(() => document.addEventListener('mousedown', (e) => { if (!triggerRef.value?.contains(e.target) && !dropdownRef.value?.contains(e.target)) close(); }));
</script>

<template>
  <div class="w-full font-sans antialiased">
    <label v-if="label" class="inline-block mb-1.5 ml-1 text-[10px] font-bold text-slate-500 dark:text-slate-400  tracking-wider">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </label>

    <div ref="triggerRef" @click="isOpen ? close() : open()"
      :class="[
        'relative flex items-center transition-all duration-300 border-2 cursor-pointer outline-none select-none px-4 gap-3',
        config.h, config.rounded,
        isOpen ? 'border-indigo-500 bg-white dark:bg-slate-900 ring-4 ring-indigo-500/10 shadow-lg' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700',
        error ? 'border-rose-500 bg-rose-50/20' : '',
        disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''
      ]"
    >
      <slot name="prefix"><i v-if="iconPre" :class="[iconPre, config.icon, 'text-slate-400 dark:text-slate-600']"></i></slot>

      <div class="flex-1 flex items-center gap-2 overflow-hidden py-1">
        <template v-if="multiple && Array.isArray(selectedOptions)">
          <div class="flex flex-wrap gap-1.5 overflow-hidden">
            <div v-for="opt in selectedOptions" :key="opt[valueKey]"
              class="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/10 animate-in zoom-in duration-200">
              <i v-if="opt[iconKey]" :class="opt[iconKey]" class="text-[10px]"></i>
              {{ opt[labelKey] }}
              <i @click.stop="handleSelect(opt)" class="fa-solid fa-xmark cursor-pointer opacity-60 hover:opacity-100 ml-1"></i>
            </div>
          </div>
          <span v-if="selectedOptions.length === 0" class="text-slate-400 dark:text-slate-600 truncate" :class="config.text">{{ placeholder }}</span>
        </template>
        <template v-else>
          <div v-if="selectedOptions" class="flex items-center gap-2.5 truncate">
            <i v-if="selectedOptions[iconKey]" :class="[selectedOptions[iconKey], 'text-indigo-500']"></i>
            <span class="font-bold text-slate-800 dark:text-slate-100 truncate tracking-tight" :class="config.text">{{ selectedOptions[labelKey] }}</span>
          </div>
          <span v-else class="text-slate-400 dark:text-slate-600 truncate italic" :class="config.text">{{ placeholder }}</span>
        </template>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <button v-if="clearable && hasValue && !disabled" @click.stop="handleClear" type="button" class="p-1 rounded-full text-slate-300 hover:text-rose-500 transition-colors">
          <i class="fa-solid fa-circle-xmark text-sm"></i>
        </button>
        <i :class="['fa-solid fa-chevron-down text-[10px] text-slate-300 transition-transform duration-500', isOpen ? 'rotate-180 text-indigo-500' : '']"></i>
      </div>
    </div>

    <Teleport to="body">
      <transition name="pop">
        <div v-if="isOpen" ref="dropdownRef" class="fixed z-[99999] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[24px] overflow-hidden">
          
          <div v-if="searchable" class="p-3 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/50">
            <div class="relative group">
              <input ref="searchInputRef" v-model="searchQuery" class="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-1.5 pl-10 pr-4 text-sm focus:border-indigo-500/50 dark:text-white transition-all shadow-sm" placeholder="Qidiruv..." @click.stop />
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-xs"></i>
            </div>
          </div>

          <ul class="flex-1 overflow-y-auto p-2 custom-scrollbar max-h-[350px]">
            <li v-if="filteredOptions.length === 0" class="py-12 px-6 text-center">
               <div v-if="allowAdd && searchQuery.trim()" class="flex flex-col items-center gap-4 animate-in zoom-in">
                  <div class="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                    <i class="fa-solid fa-plus text-2xl"></i>
                  </div>
                  <div class="space-y-1">
                    <p class="text-base font-bold text-slate-700 dark:text-slate-200 italic">"{{ searchQuery }}"</p>
                    <p class="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black">{{ addText }}</p>
                  </div>
                  <button @click="handleAdd" type="button" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                    YANGI QO'SHISH
                  </button>
               </div>
               <div v-else class="flex flex-col items-center gap-3 opacity-20 py-8">
                 <i class="fa-solid fa-box-open text-4xl text-slate-400"></i>
                 <span class="text-[12px] font-black uppercase tracking-widest text-slate-500">{{ noDataText }}</span>
               </div>
            </li>

            <li v-for="opt in filteredOptions" :key="opt[valueKey]" @click="handleSelect(opt)"
              :class="[
                'flex items-center justify-between px-4 py-3.5 mb-1.5 rounded-2xl cursor-pointer transition-all duration-300 group/item relative overflow-hidden',
                isSelected(opt) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 translate-x-1' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:translate-x-1.5'
              ]"
            >
              <div class="flex items-center gap-4 z-10 w-full">
                 <div v-if="multiple" class="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0"
                    :class="isSelected(opt) ? 'bg-white border-white' : 'border-slate-200 dark:border-slate-800 group-hover/item:border-indigo-500'">
                    <i v-if="isSelected(opt)" class="fa-solid fa-check text-[10px] text-indigo-600 font-black"></i>
                 </div>
                 
                 <slot name="option" :option="opt">
                    <div class="flex items-center gap-3">
                        <i v-if="opt[iconKey]" :class="opt[iconKey]" class="w-4 text-center opacity-80 group-hover/item:scale-125 transition-transform duration-500"></i>
                        <span class="text-[15px] font-bold tracking-tight">{{ opt[labelKey] }}</span>
                    </div>
                 </slot>
              </div>
              
              <i v-if="!multiple && isSelected(opt)" class="fa-solid fa-circle-check text-white text-lg animate-in zoom-in duration-500 shrink-0 ml-2"></i>
            </li>
          </ul>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-indigo-500; }
.pop-enter-active { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { animation: pop-in 0.25s reverse ease-in; }
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.9) translateY(15px); filter: blur(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
}
.list-move, .list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(10px); }
</style>