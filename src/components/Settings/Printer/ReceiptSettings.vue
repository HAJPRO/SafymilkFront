<template>
  <div class="flex gap-6 animate-in">
    <div class="w-2/3 grid grid-cols-2 gap-x-4 gap-y-3 pr-2 overflow-y-auto h-[400px] custom-drawer-scroll">
      <div v-for="i in 8" :key="i" class="space-y-1">
        <span class="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Parametr #0{{i}}</span>
        <div class="flex gap-2">
          <input type="text" value="10" class="w-12 bg-slate-50 dark:bg-slate-900 border dark:border-white/10 rounded-lg p-2 text-xs dark:text-white text-center">
          <select class="flex-1 bg-slate-50 dark:bg-slate-900 border dark:border-white/10 rounded-lg p-2 text-xs dark:text-white outline-none">
            <option>Normalniy</option>
            <option>Bold</option>
          </select>
          <input type="text" value="600" class="w-14 bg-slate-50 dark:bg-slate-900 border dark:border-white/10 rounded-lg p-2 text-xs dark:text-white text-center">
        </div>
      </div>
    </div>
    <div class="w-1/3 bg-white p-4 rounded-xl shadow-inner border border-slate-200 text-slate-900 h-fit sticky top-0">
      <div class="w-full h-8 bg-slate-100 rounded mb-4 flex items-center justify-center font-black text-[10px] text-slate-400">LOGO</div>
      <p class="text-[10px] font-bold uppercase tracking-tighter text-center mb-2 italic">Alliance Megamarket</p>
      <div class="border-b border-dashed border-slate-300 my-2"></div>
      <div class="text-[8px] space-y-1 font-mono">
        <div class="flex justify-between"><span>Tovuq Go'shti:</span><span>45 000</span></div>
        <div class="flex justify-between"><span>Pepsi 1.5L:</span><span>12 000</span></div>
        <div class="border-b border-slate-100 my-1"></div>
        <div class="flex justify-between font-bold text-[10px]"><span>JAMI:</span><span>57 000 SUM</span></div>
      </div>
    </div>
  </div>
</template>