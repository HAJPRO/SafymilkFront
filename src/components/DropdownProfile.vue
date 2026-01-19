<template>
  <div class="relative inline-flex group/profile">
    <button
      ref="trigger"
      class="relative flex items-center justify-center focus:outline-none transition-all duration-500"
      aria-haspopup="true"
      :aria-expanded="dropdownOpen"
      @click.prevent="dropdownOpen = !dropdownOpen"
    >
      <div class="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-0 group-hover/profile:scale-125 transition-transform duration-700 pointer-events-none opacity-0 dark:opacity-100"></div>
      
      <div 
        class="w-11 h-11 rounded-[16px] p-[2px] transition-all duration-500 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 shadow-sm"
        :class="dropdownOpen ? 'rotate-[15deg] scale-90 ring-4 ring-indigo-500/20' : 'group-hover/profile:rotate-[-5deg]'"
      >
        <div class="w-full h-full rounded-[14px] overflow-hidden bg-white dark:bg-slate-900">
          <img
            class="w-full h-full object-cover grayscale-[0.2] group-hover/profile:grayscale-0 transition-all duration-500"
            :src="avatarUrl || 'https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg'"
            alt="User"
          />
        </div>
      </div>

      <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white dark:border-slate-900 rounded-full shadow-lg"></span>
    </button>

    <transition
      enter-active-class="transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
      enter-from-class="opacity-0 translate-y-8 scale-75 rotate-[-5deg]"
      enter-to-class="opacity-100 translate-y-0 scale-100 rotate-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-show="dropdownOpen"
        ref="dropdown"
        class="absolute right-0 mt-16 w-72 bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[32px] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/5 overflow-hidden z-[160]"
      >
        <div class="px-6 py-6 bg-gradient-to-b from-indigo-50/50 dark:from-indigo-900/20 to-transparent">
          <div class="flex flex-col items-center text-center">
             <div class="w-16 h-16 rounded-2xl bg-indigo-600 mb-3 flex items-center justify-center text-white text-xl font-black shadow-xl shadow-indigo-600/20">
                {{ fullname ? fullname.charAt(0) : 'U' }}
             </div>
             <h3 class="font-black text-slate-800 dark:text-slate-100 text-base leading-tight uppercase tracking-widest">{{ fullname || username }}</h3>
             <div class="mt-1 px-3 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-full">
                <span class="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[2px]">{{ department }} Bo'limi</span>
             </div>
          </div>
        </div>

        <div class="p-2">
          <ul class="space-y-1">
            <li v-for="item in menuItems" :key="item.name">
              <router-link
                :to="{ name: item.routeName }"
                class="flex items-center gap-4 px-4 py-3.5 rounded-[20px] transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 group/item"
                @click="dropdownOpen = false"
              >
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover/item:bg-white dark:group-hover/item:bg-slate-700 group-hover/item:text-indigo-600 transition-all">
                   <i :class="[item.icon, 'text-sm']"></i>
                </div>
                <div class="flex flex-col">
                  <span class="text-[13px] font-bold text-slate-700 dark:text-slate-200 group-hover/item:text-indigo-600 transition-colors">{{ item.label }}</span>
                  <span class="text-[9px] text-slate-400 uppercase font-black tracking-widest">{{ item.desc }}</span>
                </div>
              </router-link>
            </li>
          </ul>

          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <button
              @click="logout"
              class="w-full flex items-center gap-4 px-4 py-4 rounded-[20px] transition-all duration-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 group/logout"
            >
              <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 group-hover/logout:bg-rose-500 group-hover/logout:text-white transition-all">
                 <i class="fas fa-power-off text-sm"></i>
              </div>
              <div class="flex flex-col text-left">
                <span class="text-[13px] font-black text-rose-600 uppercase tracking-widest">Tizimdan Chiqish</span>
                <span class="text-[9px] text-slate-400 font-bold uppercase">Xavfsiz yakunlash</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const dropdownOpen = ref(false);
const trigger = ref(null);
const dropdown = ref(null);

// Get data from cookie
const account = JSON.parse(localStorage.getItem("account") || "{}");
const username = ref(account.username || "User");
const department = ref(account.department || "General");
const fullname = ref(account.fullname || "");
const avatarUrl = ref(account.avatar || null);

const menuItems = [
  { name: 'profile', label: 'Mening Profilim', routeName: 'profile_card', icon: 'fa-solid fa-id-badge', desc: 'Shaxsiy ma\'lumotlar' },
  { name: 'settings', label: 'Tizim Sozlamalari', routeName: 'profile_settings', icon: 'fa-solid fa-fingerprint', desc: 'Xavfsizlik va interfeys' },
];

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("account");
  dropdownOpen.value = false;
  // Professional reload logic
  document.body.style.opacity = '0';
  localStorage.removeItem("openTabs");
  setTimeout(() => window.location.reload(), 300);
};

const clickHandler = ({ target }) => {
  if (!dropdownOpen.value) return;
  if (!dropdown.value?.contains(target) && !trigger.value?.contains(target)) {
    dropdownOpen.value = false;
  }
};

const keyHandler = ({ keyCode }) => {
  if (dropdownOpen.value && keyCode === 27) dropdownOpen.value = false;
};

onMounted(() => {
  document.addEventListener("click", clickHandler);
  document.addEventListener("keydown", keyHandler);
});

onUnmounted(() => {
  document.removeEventListener("click", clickHandler);
  document.removeEventListener("keydown", keyHandler);
});
</script>

<style scoped>
/* 🔹 Interaction & Design Polish */

.active-dot {
  @apply absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)];
}

/* 🌀 Micro-animations */
.pop-reveal-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Custom shadow for profile image in dark mode */
.dark img {
  filter: brightness(0.9) contrast(1.1);
}

/* Smooth opacity transition for logout */
body {
  transition: opacity 0.3s ease-in-out;
}
</style>