<template>
  <ThemeSidebar
    :visible="themeSidebarOpen"
    @close="themeSidebarOpen = false"
    class="z-[150] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
  />
   <SettingDrawer class="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-10" v-model="settingOpen" 
  title="Sozlamalar" 
  subtitle="Printer va tizim parametrlarini boshqarish" />

  <header class="sticky top-0 z-[50] w-full select-none transition-all duration-700">
    <div class="absolute inset-0 bg-white/60 dark:bg-[#020617]/80 backdrop-blur-[30px] border-b border-slate-200/50 dark:border-white/5 shadow-sm transition-all duration-700"></div>
    
    <div class="absolute -top-16 left-1/3 w-1/3 h-32 bg-indigo-500/10 dark:bg-indigo-400/10 blur-[120px] rounded-full animate-pulse pointer-events-none transition-opacity duration-1000"></div>
    
    <HeaderAnimatsion class="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-10" :season="selectedAnimationTheme" />
   

    <div class="relative z-10 px-4 lg:px-12">
      <div class="flex items-center justify-between h-16 sm:h-20 gap-4">
        
        <div class="flex items-center gap-4">
          <button
            @click.stop="$emit('toggle-sidebar')"
            class="lg:hidden w-11 h-11 flex items-center justify-center rounded-2xl 
                   bg-indigo-50/80 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 
                   active:scale-90 transition-all duration-300 border border-indigo-100/50 dark:border-white/5"
          >
            <i class="fa-solid fa-align-left text-lg"></i>
          </button>

          <nav class="hidden sm:flex items-center p-1.5 gap-1 bg-slate-100/40 dark:bg-slate-900/40 rounded-[20px] border border-slate-200/50 dark:border-white/5 backdrop-blur-md">
            <button @click="goBack" class="evo-nav-btn"><i class="fa-solid fa-arrow-left fa-lg"></i></button>
            <button @click="goForward" class="evo-nav-btn"><i class="fa-solid fa-arrow-right fa-lg"></i></button>
            <div class="w-[1px] h-3.5 bg-slate-300 dark:bg-slate-700 mx-1"></div>
            <button @click="goReload" class="evo-nav-btn group-hover:rotate-180 duration-1000"><i class="fa-solid fa-rotate fa-lg"></i></button>
          </nav>
        </div>

        <div class="flex-1 flex items-center justify-center overflow-hidden h-full">
          <div class="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-6 mask-fade-edges scroll-smooth">
            <transition-group name="tab-morph">
              <div
                v-for="tab in openTabs"
                :key="tab.path"
                @click="goToTab(tab.path)"
                class="evo-tab group/tab"
                :class="tab.path === route.path ? 'tab-active' : 'tab-inactive'"
              >
                <div v-if="tab.path === route.path" class="liquid-dot"></div>
                
                <span class="max-w-[160px] truncate text-[10px] font-black uppercase tracking-[2.5px]">{{ tab.label }}</span>
                
                <button @click.stop="closeTab(tab.path)" class="tab-close">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </transition-group>
          </div>
        </div>

        <div class="flex items-center gap-3 sm:gap-5">
          <div class="hidden xl:flex items-center gap-6 px-6 py-2 bg-white/20 dark:bg-slate-900/30 rounded-[22px] border border-white/20 dark:border-white/5 shadow-inner backdrop-blur-lg">
            <div class="flex flex-col items-start border-r border-slate-300/50 dark:border-slate-700/50 pr-6">
              <span class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">Tizim</span>
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981] animate-pulse"></span>
                <span class="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Onlayn</span>
              </div>
            </div>
            <div class="flex flex-col items-end min-w-[90px]">
              <span class="text-[13px] font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tighter leading-none mb-1">{{ currentTime }}</span>
              <span class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ currentDate }}</span>
            </div>
          </div>

     <div class="relative inline-flex" ref="dropdownRef">
  <button
    @click="dropdownOpen = !dropdownOpen"
    class="relative w-11 h-11 rounded-[20px] bg-indigo-600 dark:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 
           hover:shadow-indigo-600/50 hover:scale-105 active:scale-90 transition-all duration-500 flex items-center justify-center 
           group/btn z-10 overflow-hidden"
    :class="{ 'rotate-90': dropdownOpen }"
  >
    <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
    
    <i class="fa-solid fa-gear fa-grid-2 text-lg transition-transform duration-700 group-hover/btn:rotate-12"></i>
  </button>

  <transition
    enter-active-class="transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
    enter-from-class="opacity-0 translate-y-12 scale-75 blur-sm"
    enter-to-class="opacity-100 translate-y-0 scale-100 blur-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-90 translate-y-4"
  >
    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-16 w-80 bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[40px] 
             shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/5 py-8 z-[160] overflow-hidden"
    >
      <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none"></div>

      <div class="px-8 pb-4 mb-4 border-b border-slate-100 dark:border-white/5 relative">
        <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[4px]">Tizim Modullari</p>
      </div>

      <div class="px-3 space-y-1 relative">
        <div 
          v-for="item in actions" 
          :key="item.value" 
          @click="handleMobileAction(item.value)" 
          class="flex items-center gap-5 px-5 py-4 rounded-[28px] cursor-pointer transition-all duration-500 
                 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/30 group/item"
        >
          <div class="w-12 h-12 rounded-[18px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center 
                      text-indigo-600 dark:text-indigo-400 shadow-sm border border-white dark:border-slate-700/50
                      group-hover/item:bg-indigo-600 group-hover/item:text-white group-hover/item:scale-110 
                      group-hover/item:rotate-12 transition-all duration-500">
            <i :class="[item.icon, 'text-base']"></i>
          </div>

          <div class="flex flex-col text-left">
            <span class="text-[13px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
              {{ item.label }}
            </span>
            <span class="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Tezkor kirish
            </span>
          </div>

          <div class="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity">
            <i class="fa-solid fa-chevron-right text-[10px] text-indigo-400"></i>
          </div>
        </div>
      </div>

     
    </div>
  </transition>
</div>

          <UserMenu class="hover:scale-110 hover:ring-4 hover:ring-indigo-500/10 rounded-full transition-all duration-500" />
        </div>
      </div>
    </div>
    
    <SearchModal id="search-modal" :modalOpen="searchModalOpen" @close-modal="searchModalOpen = false" class="z-[200]" />
  </header>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import ThemeSidebar from "./Settings/ThemeSidebar.vue";
import HeaderAnimatsion from "./Settings/HeaderAnimatsion.vue";
import SearchModal from "../components/ModalSearch.vue";
import UserMenu from "../components/DropdownProfile.vue";
import SettingDrawer from "../components/Settings/Printer/SettingDrawe.vue";

const props = defineProps(["sidebarOpen"]);
const emit = defineEmits(["toggle-sidebar"]);

const router = useRouter();
const route = useRoute();
const themeSidebarOpen = ref(false);
const settingOpen = ref(false);
const dropdownOpen = ref(false);
const dropdownRef = ref(null);
const searchModalOpen = ref(false);
const currentTime = ref("");
const currentDate = ref("");
const selectedAnimationTheme = ref(localStorage.getItem("animation") || "0");

// --- 1. TABLARNI INITIALIZE QILISH ---
// LocalStorage'dan o'qiymiz, agar bo'sh bo'lsa bo'sh massiv []
const openTabs = ref(JSON.parse(localStorage.getItem("openTabs") || "[]"));

// --- 2. LOCALSTORAGE'GA SAQLASH ---
const saveTabs = () => {
  localStorage.setItem("openTabs", JSON.stringify(openTabs.value));
};

// --- 3. ROUTERNI KUZATISH (TABLARNI YIG'ISH) ---
watch(
  () => route.path,
  (newPath) => {
    // Tizimga kirish yoki xato sahifalarida tab yaratmaymiz
    if (newPath === '/login' || newPath === '/404' || newPath === '/auth') return;

    const exists = openTabs.value.find((t) => t.path === newPath);
    
    if (!exists) {
      // Router meta'da label bo'lmasa, name'ni yoki pathni chiroyli qilib olamiz
      const tabLabel = route.meta?.label || route.name || newPath.split('/').pop() || 'Bosh sahifa';
      
      openTabs.value.push({
        path: newPath,
        label: tabLabel.toString().toUpperCase(),
        name: route.name
      });
      saveTabs();
    }
  },
  { immediate: true }
);

// --- 4. TABNI YOPISH ---
const closeTab = (path) => {
  const index = openTabs.value.findIndex(t => t.path === path);
  if (index === -1) return;

  openTabs.value.splice(index, 1);
  saveTabs();

  // Agar yopilgan tabda turgan bo'lsak, boshqa tabga yo'naltiramiz
  if (route.path === path) {
    if (openTabs.value.length > 0) {
      // Oxirgi qolgan tabga o'tish
      router.push(openTabs.value[openTabs.value.length - 1].path);
    } else {
      router.push("/"); // Hamma tab yopilsa dashboardga
    }
  }
};


// --- 6. VAQT VA INTERFEYS ---
const updateTime = () => {
  const now = new Date();
  currentDate.value = now.toLocaleDateString("uz-UZ", { day: 'numeric', month: 'short' });
  currentTime.value = now.toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' });
};

const closeDropdownOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false;
  }
};

onMounted(() => {
  updateTime();
  const timer = setInterval(updateTime, 1000);
  window.addEventListener("click", closeDropdownOutside);
  
  onBeforeUnmount(() => {
    clearInterval(timer);
    window.removeEventListener("click", closeDropdownOutside);
  });
});

// --- 7. NAVIGATION ACTIONS ---
const handleMobileAction = (action) => {
  dropdownOpen.value = false;
  if (action === "theme") themeSidebarOpen.value = true;
  if (action === "settings") settingOpen.value = true;
  else if (action === "search") searchModalOpen.value = true;
};

const goBack = () => router.go(-1);
const goForward = () => router.go(1);
const goReload = () => window.location.reload();
const goToTab = (path) => router.push(path);

const actions = [
  { value: "settings", label: "Sozlamalar", icon: "fa-solid fa-wrench" },
  { value: "edo", label: "Hujjatlar", icon: "fa-solid fa-folder-tree" },
  { value: "chat", label: "Xabarlar", icon: "fa-solid fa-comments" },
  { value: "search", label: "Qidiruv", icon: "fa-solid fa-magnifying-glass" },
  { value: "theme", label: "Dizayn", icon: "fa-solid fa-palette" },
];
</script>

<style scoped>
/* 🎨 ENTERPRISE DESIGN LANGUAGE */

.evo-nav-btn {
  @apply w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 transition-all duration-300 text-[10px];
}

/* 🔹 PREMIUM ADAPTIVE TABS */
.evo-tab {
  @apply relative h-10 px-6 rounded-[22px] flex items-center gap-3 cursor-pointer border transition-all duration-500 shrink-0 select-none border-transparent;
}
.tab-active {
  @apply bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-white/40 dark:border-white/5 shadow-[0_15px_35px_-10px_rgba(99,102,241,0.25)];
}
.tab-inactive {
  @apply text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40;
}

.liquid-dot {
  @apply absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,1)];
}

.tab-close {
  @apply w-4 h-4 flex items-center justify-center rounded-lg hover:bg-rose-500 hover:text-white transition-all text-[8px] opacity-0 group-hover/tab:opacity-100;
}

/* 🔹 ACTION DRAWER */
.menu-action {
  @apply flex items-center gap-5 px-8 py-4 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition-all duration-300;
}
.icon-pod {
  @apply w-11 h-11 rounded-[18px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm shadow-sm transition-all;
}

/* 🌀 TRANSITIONS */
.pop-reveal-enter-active { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-reveal-enter-from { opacity: 0; transform: translateY(20px) scale(0.9); }

.tab-morph-enter-active, .tab-morph-leave-active { transition: all 0.4s ease; }
.tab-morph-enter-from, .tab-morph-leave-to { opacity: 0; transform: scale(0.9) translateY(10px); }

.mask-fade-edges {
  mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
}
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>