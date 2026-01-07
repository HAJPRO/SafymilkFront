<template>
  <li class="list-none select-none">
    <button 
      @click.stop="toggleSub"
      class="w-full flex items-center justify-between px-2 py-1 text-[13px] font-semibold transition-all duration-300 rounded-md group/sub"
      :class="[
        isSubOpen 
          ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
      ]"
    >
      <div class="flex items-center gap-2 overflow-hidden flex-1">
        <span 
          class="shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-300"
          :class="isSubOpen ? 'bg-indigo-500 scale-125 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-300 dark:bg-slate-600'"
        ></span>
        
        <div class="marquee-wrapper flex-1 overflow-hidden text-left">
          <span class="marquee-content inline-block whitespace-nowrap">
            <slot name="title" />
          </span>
        </div>
      </div>
      
      <svg 
        class="w-3 h-3 shrink-0 ml-auto fill-current transition-transform duration-300 ease-out"
        :class="{ 'rotate-180 text-indigo-500': isSubOpen, 'text-slate-400': !isSubOpen }"
        viewBox="0 0 12 12"
      >
        <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
      </svg>
    </button>
    
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[500px]"
    >
      <ul 
        v-show="isSubOpen" 
        class="pl-2 mt-1  space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700/70 overflow-hidden"
      >
        <div class="sub-items-container">
          <slot name="content" />
        </div>
      </ul>
    </transition>
  </li>
</template>

<script setup>
import { ref } from 'vue';
const isSubOpen = ref(false);
const toggleSub = () => { isSubOpen.value = !isSubOpen.value; };
</script>

<style scoped>
/* 1. Sarlavha Marquee */
.marquee-wrapper {
  mask-image: linear-gradient(to right, black 90%, transparent 100%);
}

.marquee-content {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group\/sub:hover .marquee-content {
  overflow: visible;
  text-overflow: clip;
  animation: marquee-scroll 6s linear infinite;
}

/* 2. ICHKI ELEMENTLAR UCHUN MARQUEE EFFEKTI */
.sub-items-container :deep(a) {
  @apply block py-1.5 px-3 text-[12.5px] rounded-md transition-all duration-200 
         text-slate-500 dark:text-slate-400 overflow-hidden whitespace-nowrap text-ellipsis;
}

/* Ichki link hover bo'lganda aylanishi */
.sub-items-container :deep(a:hover) {
  @apply text-indigo-500 dark:text-indigo-300 bg-slate-50 dark:bg-slate-800/40;
  text-overflow: clip;
  overflow: visible;
  animation: marquee-scroll 5s linear infinite;
  padding-left: 10%; /* Aylanish vaqti bo'shliq */
}

/* Aktiv link */
:deep(.active-link) {
  /* Asosiy pozitsiya va shrift */
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  font-weight: 700 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  
  /* Light Mode ranglari */
  color: #4f46e5 !important; /* Indigo-600 */
  background-color: rgba(79, 70, 229, 0.08) !important;
  
  /* Zamonaviy indikator (Chap chiziq) */
  /* Border-left o'rniga box-shadow ishlatish burchaklarni rounded qilishda xato bermaydi */
  box-shadow: inset 4px 0 0 0 #6366f1 !important;
  
  /* Glassmorphism effekti */
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Dark Mode uchun maxsus moslashuv */
:deep(.dark .active-link) {
  color: #818cf8 !important; /* Indigo-400 */
  background-color: rgba(129, 140, 248, 0.12) !important;
  
  /* Dark modeda indikatorga neon effekti (glow) qo'shamiz */
  box-shadow: 
    inset 4px 0 0 0 #818cf8,
    inset 10px 0 20px -10px rgba(99, 102, 241, 0.2) !important;
}

/* Aktiv link ichidagi ikonka uchun yorug'lik */
:deep(.active-link i) {
  filter: drop-shadow(0 0 3px rgba(99, 102, 241, 0.4));
  transform: scale(1.05);
}

/* Hover effekti - interaktivlikni oshirish uchun */
:deep(.active-link:hover) {
  background-color: rgba(79, 70, 229, 0.12) !important;
  @apply dark:bg-indigo-400/20 !important;
}

/* Umumiy Animatsiya */
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  20% { transform: translateX(0); }
  85% { transform: translateX(-100%); }
  100% { transform: translateX(0); }
}
</style>