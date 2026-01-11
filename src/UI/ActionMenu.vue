<script setup>
import { ref, computed, nextTick, onBeforeUnmount, onMounted } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
   
  },
  title: {
    type: String,
    default: 'Amallar'
  }
});

const isOpen = ref(false);
const triggerRef = ref(null);
const menuRef = ref(null);
const menuStyles = ref({ top: '0px', left: '0px', transformOrigin: 'top right' });

const visibleItems = computed(() => props.items.filter(item => item.show !== false));

const calculatePosition = async () => {
  if (!triggerRef.value) return;

  const rect = triggerRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  await nextTick();
  const menuRect = menuRef.value ? menuRef.value.getBoundingClientRect() : { width: 240, height: 200 };

  let top = rect.bottom + window.scrollY + 10;
  let left = rect.left + rect.width - menuRect.width;
  let originY = 'top';
  let originX = 'right';

  if (rect.bottom + menuRect.height > viewportHeight) {
    top = rect.top + window.scrollY - menuRect.height - 10;
    originY = 'bottom';
  }

  if (left < 10) {
    left = 10;
    originX = 'left';
  }

  menuStyles.value = {
    top: `${top}px`,
    left: `${left}px`,
    transformOrigin: `${originY} ${originX}`
  };
};

const toggleMenu = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await nextTick();
    calculatePosition();
    setupEventListeners();
  } else {
    removeEventListeners();
  }
};

const handleAction = (item) => {
  if (item.onClick) item.onClick();
  closeMenu();
};

const closeMenu = () => {
  isOpen.value = false;
  removeEventListeners();
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape') closeMenu();
};

const setupEventListeners = () => {
  window.addEventListener('scroll', calculatePosition, true);
  window.addEventListener('resize', calculatePosition);
  window.addEventListener('keydown', handleKeyDown);
};

const removeEventListeners = () => {
  window.removeEventListener('scroll', calculatePosition, true);
  window.removeEventListener('resize', calculatePosition);
  window.removeEventListener('keydown', handleKeyDown);
};

const handleClickOutside = (event) => {
  if (isOpen.value && triggerRef.value && !triggerRef.value.contains(event.target) && !menuRef.value?.contains(event.target)) {
    closeMenu();
  }
};

onMounted(() => window.addEventListener('mousedown', handleClickOutside));
onBeforeUnmount(() => {
  removeEventListeners();
  window.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
  <div class="inline-block">
    <button
      ref="triggerRef"
      @click.stop="toggleMenu"
      type="button"
      :class="[
        'group relative w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300',
        isOpen 
          ? 'bg-slate-900 text-white shadow-xl scale-95 dark:bg-white dark:text-slate-900' 
          : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
      ]"
    >
      <i :class="['fa-solid fa-ellipsis text-lg transition-transform duration-300', isOpen ? 'rotate-90' : '']"></i>
    </button>

    <Teleport to="body">
      <Transition name="premium-dropdown">
        <div
          v-if="isOpen"
          ref="menuRef"
          :style="menuStyles"
          class="fixed z-[9999] w-64 overflow-hidden bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/40 dark:border-slate-800/50 p-2"
        >
          <div class="px-4 py-3 mb-1">
            <h4 class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {{ title }}
            </h4>
          </div>

          <div class="space-y-1">
            <button
              v-for="(item, index) in visibleItems"
              :key="index"
              @click.stop="handleAction(item)"
              class="w-full group flex items-start gap-3.5 px-3 py-2.5 rounded-[1rem] transition-all duration-200 text-left"
              :class="[
                item.variant === 'danger'
                  ? 'hover:bg-red-50 dark:hover:bg-red-950/30'
                  : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              ]"
            >
              <div 
                class="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                :class="[
                  item.variant === 'danger'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700'
                ]"
              >
                <i :class="[item.icon, 'text-base']"></i>
              </div>

              <div class="flex flex-col min-w-0 pt-0.5">
                <span :class="[
                  'text-sm font-semibold tracking-tight leading-none mb-1',
                  item.variant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                ]">
                  {{ item.label }}
                </span>
                <span v-if="item.description" class="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                  {{ item.description }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.premium-dropdown-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.7, 0, 0.84, 0);
}

.premium-dropdown-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(10px);
}

.premium-dropdown-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* Glassmorphism uchun qo'shimcha border effekti */
.fixed {
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>