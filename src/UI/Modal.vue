<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Ma\'lumot oynasi' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'fa-solid fa-layer-group' },
  width: { type: String, default: '800px' }, // Default kenglik
  showClose: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'close']);

// --- HOLATLAR (STATES) ---
const modalRef = ref(null);
const isDragging = ref(false);
const isResizing = ref(false);

// Koordinata va o'lchamlar
const position = ref({ x: 0, y: 0 });
const size = ref({ width: props.width, height: '500px' }); // Default bo'yi va eni

// Modalni yopish
const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

// --- DRAG AND DROP (SURISH) ---
let startX, startY;

const initDrag = (e) => {
  if (e.target.closest('.drag-handle') && !e.target.closest('button')) {
    isDragging.value = true;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    startX = clientX - position.value.x;
    startY = clientY - position.value.y;

    document.addEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', doDrag, { passive: false });
    document.addEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', stopDrag);
  }
};

const doDrag = (e) => {
  if (!isDragging.value) return;
  if (e.cancelable) e.preventDefault(); 

  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  
  position.value = {
    x: clientX - startX,
    y: clientY - startY
  };
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', doDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', doDrag);
  document.removeEventListener('touchend', stopDrag);
};

// --- RESIZE (WIDTH VA HEIGHTNI CHO'ZISH) ---
const initResize = (e) => {
  isResizing.value = true;
  e.preventDefault();
  e.stopPropagation();
  
  const initialX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const initialY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  const initialWidth = modalRef.value.offsetWidth;
  const initialHeight = modalRef.value.offsetHeight;

  const doResize = (ev) => {
    const currentX = ev.type.includes('touch') ? ev.touches[0].clientX : ev.clientX;
    const currentY = ev.type.includes('touch') ? ev.touches[0].clientY : ev.clientY;
    
    // Minimal o'lchamlar: kenglik 380px, bo'yi 250px
    const newWidth = Math.max(380, initialWidth + (currentX - initialX));
    const newHeight = Math.max(250, initialHeight + (currentY - initialY));
    
    size.value = { 
      width: `${newWidth}px`, 
      height: `${newHeight}px` 
    };
  };

  const stopResize = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('touchmove', doResize);
    document.removeEventListener('touchend', stopResize);
  };

  document.addEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', doResize, { passive: false });
  document.addEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', stopResize);
};

// Modal har safar ochilganda markazga qaytarish
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    position.value = { x: 0, y: 0 };
    size.value = { width: props.width, height: '500px' };
  }
});

const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.modelValue) close();
};

onMounted(() => document.addEventListener('keydown', handleKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Transition name="modal-spring">
    <div v-if="modelValue" class="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden pointer-events-none">
      
      <div 
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px] pointer-events-auto transition-opacity"
        @click="closeOnBackdrop && close()"
      ></div>

      <div 
        ref="modalRef"
        class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] flex flex-col border border-slate-200 dark:border-slate-700 pointer-events-auto overflow-hidden transition-shadow"
        :class="{ 'ring-2 ring-indigo-500/50 shadow-indigo-500/20': isDragging || isResizing }"
        :style="{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: size.width,
          height: size.height,
          maxWidth: '98vw',
          maxHeight: '96vh'
        }"
      >
        
        <div 
          @mousedown="initDrag" 
          @touchstart="initDrag"
          class="drag-handle cursor-grab active:cursor-grabbing px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center select-none shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20"
        >
          <div class="flex items-center gap-4 pointer-events-none">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <i :class="[icon, 'text-xl']"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-white leading-tight">{{ title }}</h3>
              <p v-if="subtitle" class="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{{ subtitle }}</p>
            </div>
          </div>
          
          <button 
            v-if="showClose"
            @click="close" 
            class="w-10 h-10 rounded-full flex items-center justify-center text-slate-400  hover:text-rose-500 transition-all active:scale-90 border border-transparent hover:border-rose-500"
          >
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white dark:bg-slate-900">
          <slot />
        </div>

        <div v-if="$slots.footer" class="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
          <slot name="footer" :close="close" />
        </div>

        <div 
          @mousedown="initResize"
          @touchstart="initResize"
          class="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-50 flex items-end justify-end p-2 group"
        >
          <div class="w-3 h-3 border-r-4 border-b-4 border-slate-300 dark:border-slate-600 group-hover:border-indigo-500 transition-colors rounded-br-sm"></div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Spring Animation */
.modal-spring-enter-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.modal-spring-leave-active {
  transition: all 0.25s ease-in;
}
.modal-spring-enter-from, .modal-spring-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(40px);
}

/* Professional Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { 
  @apply bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-indigo-400 dark:hover:bg-indigo-500; 
}
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

.drag-handle {
  touch-action: none; /* Mobilda drag ishlashi uchun zarur */
}

/* Matn tanlanishini cheklash */
.select-none {
  user-select: none;
}
</style>