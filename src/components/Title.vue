<script setup>
// Bu komponent "Sticky" bo'lib, sahifa scroll bo'lganda tepada qotib turadi.
// Composition API ishlatildi.
</script>

<template>
  <div
    class="sticky top-0 z-20 mb-1
           flex items-center justify-center
           px-6 py-3 rounded-2xl
           bg-white/90 dark:bg-slate-800/90 backdrop-blur-md
           border border-indigo-100 dark:border-slate-600/50
           shadow-lg shadow-indigo-500/10 dark:shadow-none
           text-slate-700 dark:text-indigo-100
           transition-all duration-300 ease-in-out"
  >
    <h2 class="text-lg  flex items-center gap-2 font-black italic tracking-tight">
      <slot name="title">
        <span>Sarlavha</span>
      </slot>
    </h2>
  </div>
</template>

<style scoped>
/* Qo'shimcha animatsiyalar shart emas, Tailwind hammasini bajaradi.
   Lekin agar "Glass" effekti eski brauzerlarda ishlamasa, orqa fon to'liq bo'ladi. */
</style>