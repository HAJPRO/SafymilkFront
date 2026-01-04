<script setup>
import { computed } from 'vue'
import { format } from "date-fns";

// Sana formati (Agar date-fns o'rnatilgan bo'lsa)
// Agar date-fns bo'lmasa, pastdagi nativeDate ni ishlating
const currentDate = computed(() => format(new Date(), "dd.MM.yyyy"));

// Versiya raqami (Professional tizimlarda bo'ladi)
const appVersion = "v1.0.0";
</script>

<template>
  <footer class="w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-3 px-6 transition-colors duration-300">
    
    <div class="flex flex-col md:flex-row items-center justify-between gap-2">
      
      <div class="text-[11px] md:text-xs font-medium text-slate-500 dark:text-slate-400">
        &copy; {{ new Date().getFullYear() }} 
        <span class="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer transition-colors">
        Safymilk company
        </span>
       <span class="hidden sm:inline"> | Tabiiatning mehirli ta'mi.</span>
      </div>

      <div class="flex items-center gap-4 text-[10px] md:text-[11px] font-semibold text-slate-400 dark:text-slate-500">
        
        <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
          <i class="fa-regular fa-calendar text-indigo-500"></i>
          <span>{{ currentDate }}</span>
        </div>

        <div class="hidden md:block opacity-70 hover:opacity-100 transition-opacity">
          System: <span class="text-slate-600 dark:text-slate-300">{{ appVersion }}</span>
        </div>
      </div>

    </div>
  </footer>
</template>

<style scoped>
/* Maxsus CSS shart emas, hammasi Tailwind bilan hal qilindi */
</style>