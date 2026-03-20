<script setup>
/**
 * EmptyState.vue
 * Ma'lumot topilmaganda chiqadigan universal komponent.
 */

defineProps({
  // Qidiruv so'zi (agar bor bo'lsa)
  searchTerm: {
    type: String,
    default: ''
  },
  // Asosiy sarlavha
  title: {
    type: String,
    default: "Hmm, bu yerda hech narsa yo'q..."
  },
  // Pastdagi izoh
  description: {
    type: String,
    default: "So'rovingiz bo'yicha ma'lumot topilmadi. Qidiruvni o'zgartirib ko'ring."
  },
  // Tugma matni (agar bo'sh bo'lsa tugma chiqmaydi)
  actionLabel: {
    type: String,
    default: "Qidiruvni tozalash"
  },
  // Rasm turi (agar kelajakda o'zgartirmoqchi bo'lsangiz)
  imageType: {
    type: String,
    default: 'shrug' // 'shrug' | 'search' | 'sad'
  }
});

const emit = defineEmits(['action']);

// Tugma bosilganda ota komponentga xabar berish
const handleAction = () => {
  emit('action');
};
</script>

<template>
  <div class="  flex flex-col items-center justify-center w-full min-h-[600px] p-8 text-center rounded-3xl bg-white dark:bg-slate-800  dark:border-slate-800 transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-900/50 group">
    
    <div class="relative w-48 h-48 mb-6 perspective-1000">
        
        <div class="absolute inset-0 bg-indigo-500/20 rounded-full blur-[50px] animate-pulse-slow"></div>

        <img 
          src="../../../../public/not_search.avif" 
          alt="No Data Person" 
          class="w-full h-full object-contain drop-shadow-2xl animate-float relative z-10 rounded-full"
        />

        <div class="absolute top-0 right-4 animate-bounce-slow z-20">
            <div class="bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
                <i class="fa-solid fa-question text-2xl text-amber-500 font-bold"></i>
            </div>
        </div>
        
        <div class="absolute bottom-4 left-0 animate-ping-slow z-0">
             <div class="w-12 h-12 bg-indigo-400/20 rounded-full"></div>
        </div>
    </div>

    <div class="relative z-10 max-w-md">
        <h3 class="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
            {{ title }}
        </h3>
        
        <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            <span v-if="searchTerm" class="inline-block bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-500/30 mr-1">
                "{{ searchTerm }}"
            </span>
            {{ description }}
        </p>

        <button 
            v-if="actionLabel"
            @click="handleAction"
            class="group relative inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-1 active:scale-95 overflow-hidden"
        >
            <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            <i class="fa-solid fa-rotate-left group-hover:-rotate-180 transition-transform duration-500"></i>
            <span>{{ actionLabel }}</span>
        </button>
    </div>

  </div>
</template>

<style scoped>
/* FLOAT ANIMATION (Suzish) */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(2deg); }
}
.animate-float {
  animation: float 5s ease-in-out infinite;
}

/* BOUNCE (Savol belgisi) */
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

/* SHIMMER (Tugma yaltirashi) */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.group-hover\:animate-shimmer:hover {
  animation: shimmer 1s infinite;
}

/* PULSE (Orqa fon nuri) */
@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.1); }
}
.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}
</style>