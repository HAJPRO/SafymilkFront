<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useScreen } from "@/utils/TableOptions/useTableOptions"; // Yo'lni tekshiring

// --- PROPS ---
const props = defineProps({
  tabs: { type: Array, required: true, default: () => [] },
  modelValue: { type: [Number, String], required: true },
  counts: { type: Object, default: () => ({}) },
  searchPlaceholder: { type: String, default: "Bo'limni izlash..." }
});

// --- EMITS ---
const emit = defineEmits(['update:modelValue', 'change']);

const { isMobile } = useScreen();
const search = ref("");
const isDropdownOpen = ref(false); // Dropdown holati

// --- ACTIONS ---
const handleTabClick = (id) => {
  if (props.modelValue !== id) {
    emit('update:modelValue', id);
    emit('change', id);
  }
};

// Mobile uchun: Tab tanlash va yopish
const selectTabMobile = (id) => {
  handleTabClick(id);
  isDropdownOpen.value = false;
  search.value = ""; // Qidiruvni tozalash
};

// Mobile uchun: Hozirgi tanlangan tabni topish (Labelni ko'rsatish uchun)
const currentTab = computed(() => 
  props.tabs.find(t => t.id === props.modelValue) || props.tabs[0]
);

// --- COMPUTED (Filter) ---
const filteredTabs = computed(() =>
  props.tabs.filter((t) =>
    t.label.toLowerCase().includes(search.value.toLowerCase())
  )
);

// Click Outside (Tashqariga bosganda yopish uchun)
const closeDropdown = (e) => {
    if(isDropdownOpen.value && !e.target.closest('.mobile-dropdown-container')) {
        isDropdownOpen.value = false;
    }
}

onMounted(() => window.addEventListener('click', closeDropdown));
onUnmounted(() => window.removeEventListener('click', closeDropdown));
</script>

<template>
  <div class="w-full bg-transparent dark:bg-transparent rounded-xl shadow-sm   px-2 transition-colors duration-300">
    
    <div v-if="!isMobile" class="w-full">
      <div class="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 px-1 relative">
        <button
          v-for="tab in props.tabs"
          :key="tab.id"
          @click="handleTabClick(tab.id)"
          class="group relative flex items-center gap-2 py-3 px-1 text-[13px] font-medium transition-all duration-300 outline-none"
          :class="[
            modelValue === tab.id
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          <i 
            v-if="tab.icon"
            :class="[tab.icon, modelValue === tab.id ? 'transform scale-110' : 'opacity-70 group-hover:opacity-100']"
            class="text-md mb-0.5 transition-transform duration-300"
          ></i>

          <span>{{ tab.label }}</span>

          <span
            v-if="counts && counts[tab.key] > 0"
            class="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors"
            :class="[
              modelValue === tab.id
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
            ]"
          >
            {{ counts[tab.key] }}
          </span>

          <span 
            class="absolute bottom-0 left-0 w-full h-[2px] rounded-t-sm transition-all duration-300 ease-in-out"
            :class="modelValue === tab.id ? 'bg-indigo-600 dark:bg-indigo-500 scale-x-100 opacity-100' : 'bg-transparent scale-x-0 opacity-0'"
          ></span>
        </button>
      </div>
    </div>

    <div v-else class="p-2 relative mobile-dropdown-container">
        
        <button 
            @click.stop="isDropdownOpen = !isDropdownOpen"
            class="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm transition-all active:scale-[0.99]"
            :class="{'ring-2 ring-indigo-500/20 border-indigo-500': isDropdownOpen}"
        >
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-white dark:bg-slate-600 shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <i :class="currentTab?.icon || 'fa-solid fa-layer-group'"></i>
                </div>
                <div class="text-left">
                    <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Bo'lim</div>
                    <div class="font-semibold text-slate-700 dark:text-slate-200">{{ currentTab?.label }}</div>
                </div>
            </div>
            
            <div class="flex items-center gap-2">
                <span v-if="counts && counts[currentTab?.key] > 0" class="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-md">
                    {{ counts[currentTab?.key] }}
                </span>
                <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-300" :class="{'rotate-180': isDropdownOpen}"></i>
            </div>
        </button>

        <transition name="dropdown-slide">
            <div v-if="isDropdownOpen" class="absolute top-full left-0 right-0 mt-2 mx-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden flex flex-col max-h-[400px]">
                
                <div class="p-3 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
                    <div class="relative">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input 
                            v-model="search" 
                            type="text" 
                            :placeholder="props.searchPlaceholder"
                            class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
                        >
                    </div>
                </div>

                <div class="overflow-y-auto p-2 space-y-1">
                    <button 
                        v-for="tab in filteredTabs" 
                        :key="tab.id"
                        @click="selectTabMobile(tab.id)"
                        class="w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all"
                        :class="[
                            modelValue === tab.id 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                        ]"
                    >
                        <div class="flex items-center gap-3">
                            <i :class="[tab.icon, 'text-base w-5 text-center', modelValue === tab.id ? 'text-indigo-600' : 'text-slate-400']"></i>
                            <span>{{ tab.label }}</span>
                        </div>
                        
                        <div class="flex items-center gap-2">
                             <span v-if="counts && counts[tab.key] > 0" class="text-xs px-2 py-0.5 rounded-md"
                                :class="modelValue === tab.id ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'bg-slate-100 dark:bg-slate-600 text-slate-500'">
                                {{ counts[tab.key] }}
                             </span>
                             <i v-if="modelValue === tab.id" class="fa-solid fa-check text-indigo-600"></i>
                        </div>
                    </button>
                    
                    <div v-if="filteredTabs.length === 0" class="text-center py-4 text-slate-400 text-xs">
                        Ma'lumot topilmadi
                    </div>
                </div>
            </div>
        </transition>

        <transition name="fade">
            <div v-if="isDropdownOpen" class="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" @click="isDropdownOpen = false"></div>
        </transition>

    </div>
  </div>
</template>

<style scoped>
/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.dark ::-webkit-scrollbar-thumb { background: #475569; }

/* Animations */
.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>