<template>
  <router-view />
  <ToastContainer/>
  <ConfirmDialog ref="globalConfirm" />
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 transform scale-95"
    enter-to-class="opacity-100 transform scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 transform scale-100"
    leave-to-class="opacity-0 transform scale-95"
  >
    <div
      v-if="isOffline"
      class="fixed inset-0 flex items-center justify-center z-[9999] px-4"
    >
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"></div>

      <div class="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-slate-100 dark:border-slate-700 overflow-hidden">
        
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

        <div class="mb-6 relative flex justify-center">
            <div class="absolute inset-0 flex items-center justify-center">
                <span class="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-red-400 opacity-20"></span>
            </div>
            
            <svg class="w-32 h-32 text-red-500 drop-shadow-lg floating-animation" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-30"/>
                <path d="M2 12L22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 4" class="opacity-50"/>
                <path d="M8.5 8.5L15.5 15.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15.5 8.5L8.5 15.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>

        <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Aloqa uzildi
        </h2>
        <p class="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Internetga ulanishda muammo borga o‘xshaydi. Iltimos, tarmog‘ingizni tekshiring.
        </p>

        <button
          @click="reloadPage"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/30 active:scale-95"
        >
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Qayta yuklash
          </span>
        </button>
      </div>
    </div>
  </Transition>

</template>

<script setup>
  import socketService from './socket/socket';
import { onMounted, onUnmounted, onBeforeUnmount, ref,provide} from "vue";
import ToastContainer from "./UI/Toast.vue";
import ConfirmDialog from './UI/ConfirmDialog.vue';

const globalConfirm = ref(null);
provide('confirm', (config) => globalConfirm.value.open(config));

const isOffline = ref(false);

// Holatni yangilash funksiyasi
const updateNetworkStatus = () => {
  // navigator.onLine API yordamida internet holatini tekshirish
  isOffline.value = !navigator.onLine;
};

onMounted(() => {
  
  // Network listenerlari
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  
  // Dastlabki tekshiruv
  updateNetworkStatus();
  socketService.connect();
});



onBeforeUnmount(() => {
  // Listenerlarni to'g'ri tozalash
  window.removeEventListener("online", updateNetworkStatus);
  window.removeEventListener("offline", updateNetworkStatus);
});

const reloadPage = () => {
  window.location.reload();
};
</script>

<style scoped>
/* Suzib yuruvchi animatsiya (Icon uchun) */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.floating-animation {
  animation: float 3s ease-in-out infinite;
}
</style>