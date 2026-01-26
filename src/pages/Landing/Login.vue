<template>
  <div class="min-h-screen w-full flex font-sans overflow-hidden transition-colors duration-700 ease-in-out selection:bg-indigo-500 selection:text-white"
       :class="isDarkMode ? 'bg-[#0B0F19] text-white' : 'bg-[#F1F5F9] text-slate-800'"
       @mousemove="handleMouseMove">
    
    <button 
      @click="toggleTheme" 
      class="absolute top-6 left-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-lg border active:scale-90 hover:rotate-12"
      :class="isDarkMode 
        ? 'bg-white/10 border-white/10 text-yellow-400 hover:bg-white/20' 
        : 'bg-white/80 border-slate-200 text-indigo-600 hover:bg-white'"
    >
      <i class="fas text-lg" :class="isDarkMode ? 'fa-sun' : 'fa-moon'"></i>
    </button>

    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-700">
       <div class="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[120px] animate-blob transition-colors duration-700"
            :class="isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-300/30'"></div>
       <div class="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[120px] animate-blob animation-delay-2000 transition-colors duration-700"
            :class="isDarkMode ? 'bg-violet-900/20' : 'bg-cyan-300/30'"></div>
       
       <div class="particles-container">
          <div v-for="n in 15" :key="n" 
               class="particle transition-colors duration-700" 
               :class="isDarkMode ? 'bg-indigo-500/60 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-indigo-600/40 shadow-[0_0_5px_rgba(79,70,229,0.3)]'"
               :style="getParticleStyle(n)"></div>
       </div>

       <div class="absolute bottom-0 w-full h-[50vh] transform perspective-[2000px] rotate-x-[60deg] opacity-30 transition-all duration-700"
            :class="isDarkMode ? 'bg-gradient-to-b from-transparent to-indigo-900/10' : 'bg-gradient-to-b from-transparent to-indigo-200/20'">
          <div class="w-full h-full grid-pattern" 
               :class="isDarkMode ? 'dark-grid' : 'light-grid'"></div>
       </div>
    </div>

    <div class="w-full lg:w-[45%] flex flex-col justify-center items-center px-8 sm:px-16 relative z-20 backdrop-blur-sm transition-all duration-700 border-r"
         :class="isDarkMode ? 'bg-[#0B0F19]/60 border-white/5' : 'bg-white/60 border-slate-200'">
      
      <div class="w-full max-w-[420px] relative">
        
        <div class="absolute -left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-indigo-500 to-transparent opacity-50"></div>

        <div class="mb-12 animate-slide-in-left">
           <div class="flex gap-3 mb-4 items-center justify-center">
               <div class="relative w-12 h-12 flex items-center justify-center">
                  <div class="absolute inset-0 bg-indigo-500 rounded-xl rotate-6 opacity-20 animate-pulse"></div>
                 <div class="relative group">
  <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

  <div class="relative flex items-center justify-center w-16 h-16 rounded-xl rotate-[-3deg] shadow-2xl transition-all duration-500 ease-in-out transform group-hover:rotate-0 group-hover:scale-105"
       :class="isDarkMode ? 'bg-slate-900 border border-slate-700 shadow-indigo-500/20' : 'bg-white border border-indigo-50 shadow-indigo-200/50'">
    
    <img src="/public/unit_logo_1.png" 
         alt="Flow Logo"
         class="w-14 h-14 object-contain rounded-lg transition-all duration-500 filter"
         :class="isDarkMode ? 'brightness-125 contrast-110' : 'grayscale-0'">
  </div>
</div>
               </div>
               <div>
                  <h1 class="text-2xl font-bold tracking-tight transition-colors duration-500"
                      :class="isDarkMode ? 'text-white' : 'text-slate-800'">
                    Unit <span class="text-indigo-500">Eco System</span>
                  </h1>
                  <div class="flex items-center gap-2">
                     <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                     <span class="text-[10px] text-emerald-500 font-mono tracking-widest uppercase font-bold">System Online</span>
                  </div>
               </div>
           </div>
           <p class="text-sm leading-relaxed text-center transition-colors duration-500"
              :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">
             Har tomchida hayot, har soniyada nazorat.
           </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6 relative" autocomplete="off">
          
          <div class="group relative">
             <label class="block text-[11px] font-bold uppercase tracking-wider mb-2 transition-colors duration-300"
                    :class="isDarkMode ? 'text-indigo-300 group-focus-within:text-white' : 'text-slate-500 group-focus-within:text-indigo-600'">
                Foydalanuvchi nomi
             </label>
             <div class="relative overflow-hidden rounded-xl border transition-all duration-300"
                  :class="isDarkMode 
                    ? 'bg-white/5 border-white/10 hover:border-indigo-500/50 group-focus-within:bg-white/10 group-focus-within:border-indigo-500 shadow-indigo-500/10' 
                    : 'bg-white border-slate-200 hover:border-indigo-300 group-focus-within:border-indigo-500 group-focus-within:shadow-lg group-focus-within:shadow-indigo-100'">
                
                <input 
                   v-model="credentials.username"
                   type="text" 
                   class="w-full h-14 px-12 bg-transparent focus:outline-none font-medium tracking-wide transition-colors duration-300"
                   :class="isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'"
                   placeholder="ID raqam yoki Login"
                />
                
                <div class="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                     :class="isDarkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'">
                   <i class="fas fa-fingerprint text-lg"></i>
                </div>
                
                <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500 group-focus-within:w-full"></div>
             </div>
          </div>

          <div class="group relative">
             <label class="block text-[11px] font-bold uppercase tracking-wider mb-2 transition-colors duration-300"
                    :class="isDarkMode ? 'text-indigo-300 group-focus-within:text-white' : 'text-slate-500 group-focus-within:text-indigo-600'">
                Parol
             </label>
             <div class="relative overflow-hidden rounded-xl border transition-all duration-300"
                  :class="isDarkMode 
                    ? 'bg-white/5 border-white/10 hover:border-indigo-500/50 group-focus-within:bg-white/10 group-focus-within:border-indigo-500 shadow-indigo-500/10' 
                    : 'bg-white border-slate-200 hover:border-indigo-300 group-focus-within:border-indigo-500 group-focus-within:shadow-lg group-focus-within:shadow-indigo-100'">
                
                <input 
                   v-model="credentials.password"
                   :type="showPassword ? 'text' : 'password'" 
                   class="w-full h-14 px-12 bg-transparent focus:outline-none font-medium tracking-widest transition-colors duration-300"
                   :class="isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'"
                   placeholder="••••••••"
                />
                
                <div class="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
                     :class="isDarkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'">
                   <i class="fas fa-shield-alt text-lg"></i>
                </div>
                
                <button type="button" @click="showPassword = !showPassword" 
                        class="absolute right-4 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                        :class="isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-indigo-600'">
                   <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
                
                <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500 group-focus-within:w-full"></div>
             </div>
          </div>

          <div class="flex justify-between items-center text-xs">
             <label class="flex items-center gap-2 cursor-pointer group">
                <div class="w-4 h-4 rounded border flex items-center justify-center transition-all"
                     :class="isDarkMode ? 'bg-white/10 border-white/20 group-hover:border-indigo-400' : 'bg-white border-slate-300 group-hover:border-indigo-500'">
                   <input type="checkbox" class="appearance-none w-full h-full cursor-pointer checked:bg-indigo-500 rounded-sm transition-colors" />
                   <i class="fas fa-check text-white text-[10px] absolute opacity-0 pointer-events-none check-icon"></i>
                </div>
                <span class="transition-colors" :class="isDarkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-indigo-600'">Meni eslab qol</span>
             </label>
             <a href="#" class="hover:underline decoration-wavy decoration-indigo-500/30 transition-colors"
                :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'">Parolni tiklash</a>
          </div>

          <button 
             type="submit" 
             :disabled="isLoading"
             class="relative w-full h-14 rounded-xl overflow-hidden group transition-all transform active:scale-[0.98]"
             :class="isDarkMode 
               ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.6)] text-white' 
               : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 text-white'"
          >
             <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
             
             <div class="relative z-10 flex items-center justify-center gap-3 font-bold tracking-wider uppercase text-sm">
                <span v-if="!isLoading">Tizimga Ulanish</span>
                <i v-if="!isLoading" class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                
                <div v-else class="flex items-center gap-2">
                   <svg class="animate-spin h-5 w-5" :class="isDarkMode ? 'text-white' : 'text-indigo-100'" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   <span>Tekshirilmoqda...</span>
                </div>
             </div>

             <div class="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:animate-shine"></div>
          </button>

        </form>

        <div class="mt-10 flex justify-center gap-6 text-[10px] uppercase tracking-widest font-mono transition-colors duration-500"
             :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
           <span>v1.0.0 Stable</span>
           <span>•</span>
           <span>Server: Asia-1</span>
        </div>

      </div>
    </div>

    <div class="hidden lg:flex lg:w-[55%] relative items-center justify-center perspective-container z-10 transition-colors duration-700"
         :class="isDarkMode ? '' : 'bg-slate-50/50'">
       
       <div class="relative w-[600px] h-[600px] transition-transform duration-100 ease-out will-change-transform" 
            :style="parallaxStyle">
          
          <div class="absolute inset-0 border rounded-full animate-spin-slow-reverse transition-colors duration-500"
               :class="isDarkMode ? 'border-indigo-500/20' : 'border-indigo-200'"></div>
          <div class="absolute inset-[10%] border border-dashed rounded-full animate-spin-slow transition-colors duration-500"
               :class="isDarkMode ? 'border-indigo-400/30' : 'border-indigo-300/40'"></div>
          
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] backdrop-blur-xl rounded-2xl p-6 transition-all duration-500"
               :class="isDarkMode 
                 ? 'bg-[#0F172A]/80 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20' 
                 : 'bg-white/80 border border-white/60 shadow-2xl shadow-indigo-200/50'">
             
             <div class="flex justify-between items-center mb-6 border-b pb-4 transition-colors duration-500"
                  :class="isDarkMode ? 'border-white/5' : 'border-slate-100'">
                <div class="text-xs font-mono font-bold" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">STATUS MONITOR</div>
                <div class="flex gap-1">
                   <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                   <div class="w-1.5 h-1.5 rounded-full" :class="isDarkMode ? 'bg-indigo-500/50' : 'bg-indigo-300'"></div>
                   <div class="w-1.5 h-1.5 rounded-full" :class="isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'"></div>
                </div>
             </div>

             <div class="h-32 flex items-end justify-between gap-2 mb-6 relative overflow-hidden rounded-lg">
                <div class="absolute inset-0 bg-gradient-to-t transition-colors duration-500"
                     :class="isDarkMode ? 'from-indigo-500/10 to-transparent' : 'from-indigo-100/50 to-transparent'"></div>
                <div class="w-1/6 h-[40%] rounded-t animate-height-1 transition-colors duration-500" :class="isDarkMode ? 'bg-indigo-600/50' : 'bg-indigo-500'"></div>
                <div class="w-1/6 h-[70%] rounded-t animate-height-2 transition-colors duration-500" :class="isDarkMode ? 'bg-indigo-500/60' : 'bg-indigo-400'"></div>
                <div class="w-1/6 h-[50%] rounded-t animate-height-3 transition-colors duration-500" :class="isDarkMode ? 'bg-indigo-400/70' : 'bg-indigo-300'"></div>
                <div class="w-1/6 h-[85%] rounded-t animate-height-1 transition-colors duration-500" :class="isDarkMode ? 'bg-indigo-300/80' : 'bg-indigo-200'"></div>
                <div class="w-1/6 h-[60%] rounded-t animate-height-2 shadow-lg transition-colors duration-500" :class="isDarkMode ? 'bg-white/90 shadow-white/20' : 'bg-indigo-600 shadow-indigo-200'"></div>
             </div>

             <div class="grid grid-cols-2 gap-3">
                <div class="rounded-lg p-3 border transition-colors duration-300 hover:border-indigo-500/50"
                     :class="isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'">
                   <div class="text-[10px] uppercase mb-1" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">Suv bosimi</div>
                   <div class="text-xl font-bold font-mono" :class="isDarkMode ? 'text-white' : 'text-slate-800'">4.2 <span class="text-xs text-indigo-400">Bar</span></div>
                </div>
                <div class="rounded-lg p-3 border transition-colors duration-300 hover:border-indigo-500/50"
                     :class="isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'">
                   <div class="text-[10px] uppercase mb-1" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">Filtr Holati</div>
                   <div class="text-xl font-bold text-emerald-500 font-mono">98%</div>
                </div>
             </div>
          </div>

          <div class="absolute -right-10 top-20 backdrop-blur-md border p-3 rounded-xl animate-float-delay-1 w-40 transition-colors duration-500"
               :class="isDarkMode ? 'bg-black/60 border-indigo-500/40' : 'bg-white/80 border-slate-200 shadow-lg'">
              <div class="text-[10px] mb-1 font-bold" :class="isDarkMode ? 'text-indigo-300' : 'text-indigo-600'">System Load</div>
              <div class="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                 <div class="h-full bg-indigo-500 w-[65%] animate-pulse"></div>
              </div>
          </div>

          <div class="absolute -left-12 bottom-20 backdrop-blur-md border p-3 rounded-xl animate-float-delay-2 flex items-center gap-3 transition-colors duration-500"
               :class="isDarkMode ? 'bg-black/60 border-emerald-500/40' : 'bg-white/80 border-emerald-100 shadow-lg'">
              <div class="w-8 h-8 rounded flex items-center justify-center text-emerald-500" :class="isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'">
                 <i class="fas fa-leaf text-sm"></i>
              </div>
              <div>
                 <div class="text-[10px]" :class="isDarkMode ? 'text-slate-300' : 'text-slate-500'">Unit Mode</div>
                 <div class="text-xs font-bold" :class="isDarkMode ? 'text-white' : 'text-slate-800'">Active</div>
              </div>
          </div>

       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { AuthStore } from "../../stores/Auth/auth.js";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const store = AuthStore();
const credentials = reactive({ username: "", password: "" });
const showPassword = ref(false);
const isLoading = ref(false);
const parallaxStyle = ref({});
const isDarkMode = ref(true); // Standart holat Dark bo'lsin

// 🌓 Theme Toggle Logic
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
  
  // Tailwind classini html tegiga qo'shish (agar kerak bo'lsa)
  if(isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// 🖱️ Mouse Parallax Logic
const handleMouseMove = (e) => {
  const { clientX, clientY, innerWidth, innerHeight } = e;
  const xPos = (clientX / innerWidth - 0.5) * 20;
  const yPos = (clientY / innerHeight - 0.5) * 20;
  
  parallaxStyle.value = {
    transform: `rotateY(${xPos}deg) rotateX(${-yPos}deg) translateZ(20px)`
  };
};

const handleLogin = async () => {
  if (!credentials.username || !credentials.password) return;
  isLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    const isOk = await store.login(credentials);
  if (isOk) {
    // Electron uchun eng xavfsiz yo'naltirish
    router.push({ name: "StatisticSale" });
  }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const getParticleStyle = (n) => {
   const size = Math.random() * 4 + 2;
   return {
      left: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${Math.random() * 10 + 10}s`,
      animationDelay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5
   };
}

onMounted(() => {
  // Avvalgi tanlovni tiklash
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
  }
  
  if(isDarkMode.value) {
    document.documentElement.classList.add('dark');
  }
});
</script>

<style scoped>
/* 🌌 GENERAL LAYOUT */
.perspective-container {
   perspective: 1200px;
   transform-style: preserve-3d;
}

/* ✨ PARTICLES ANIMATION */
.particles-container {
   position: absolute;
   width: 100%;
   height: 100%;
}
.particle {
   position: absolute;
   bottom: -10px;
   border-radius: 50%;
   animation: rise linear infinite;
}

@keyframes rise {
   0% { transform: translateY(0) scale(1); opacity: 0; }
   10% { opacity: 0.8; }
   100% { transform: translateY(-100vh) scale(0); opacity: 0; }
}

/* 🌀 SPINNERS */
.animate-spin-slow { animation: spin 20s linear infinite; }
.animate-spin-slow-reverse { animation: spin 25s linear infinite reverse; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* 📊 CHART ANIMATIONS */
@keyframes heightChange {
   0%, 100% { height: 40%; }
   50% { height: 70%; }
}
.animate-height-1 { animation: heightChange 3s ease-in-out infinite; }
.animate-height-2 { animation: heightChange 4s ease-in-out infinite 1s; }
.animate-height-3 { animation: heightChange 2.5s ease-in-out infinite 0.5s; }

/* 🌟 SHINE & BLOB */
@keyframes shine {
   100% { left: 200%; }
}
.animate-shine { animation: shine 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

@keyframes blob {
   0% { transform: translate(0px, 0px) scale(1); }
   33% { transform: translate(30px, -50px) scale(1.1); }
   66% { transform: translate(-20px, 20px) scale(0.9); }
   100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob { animation: blob 10s infinite; }

/* ☁️ FLOAT */
@keyframes float {
   0%, 100% { transform: translateY(0); }
   50% { transform: translateY(-15px); }
}
.animate-float-delay-1 { animation: float 6s ease-in-out infinite 1s; }
.animate-float-delay-2 { animation: float 7s ease-in-out infinite 2s; }

/* Custom Checkbox Logic */
input:checked + .check-icon {
   opacity: 1;
   transform: scale(1);
}

/* 📏 GRID PATTERNS (CSS Generated) */
.grid-pattern {
  background-size: 50px 50px;
  transition: background-image 0.5s ease;
}

.dark-grid {
  background-image: 
    linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), 
    linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent);
}

.light-grid {
  background-image: 
    linear-gradient(0deg, transparent 24%, rgba(79, 70, 229, .08) 25%, rgba(79, 70, 229, .08) 26%, transparent 27%, transparent 74%, rgba(79, 70, 229, .08) 75%, rgba(79, 70, 229, .08) 76%, transparent 77%, transparent), 
    linear-gradient(90deg, transparent 24%, rgba(79, 70, 229, .08) 25%, rgba(79, 70, 229, .08) 26%, transparent 27%, transparent 74%, rgba(79, 70, 229, .08) 75%, rgba(79, 70, 229, .08) 76%, transparent 77%, transparent);
}
</style>