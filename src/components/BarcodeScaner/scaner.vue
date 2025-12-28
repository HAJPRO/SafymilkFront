<template>
  <Transition 
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0 scale-105"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 translate-y-full"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black overflow-hidden touch-none select-none">
      
      <div id="qr-reader" class="absolute inset-0 w-full h-full object-cover scale-[1.02]"></div>

      <div class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        
        <div class="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_30px_#3b82f6] animate-global-scan"></div>

        <div class="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          <div v-for="c in ['tl','tr','bl','br']" :key="c" 
               :class="['absolute w-8 h-8 border-blue-500/60 transition-all duration-1000 animate-pulse', 
                        c==='tl'?'top-0 left-0 border-t-2 border-l-2':'',
                        c==='tr'?'top-0 right-0 border-t-2 border-r-2':'',
                        c==='bl'?'bottom-0 left-0 border-b-2 border-l-2':'',
                        c==='br'?'bottom-0 right-0 border-b-2 border-r-2':'']">
          </div>
          
          <div class="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6] animate-ping"></div>
        </div>
      </div>

      <header class="absolute top-0 inset-x-0 z-30 p-6 pt-12 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
        <div class="flex flex-col gap-1">
          <h3 class="text-white font-black text-xl tracking-tighter leading-none">Smart Scan</h3>
          <p class="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse text-left">Autofocus Active</p>
        </div>
        
        <div class="flex gap-3">
          <button @click="toggleTorch" :class="isTorchOn ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'" class="w-12 h-12 rounded-2xl backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all active:scale-90">
            <i :class="isTorchOn ? 'fa-solid fa-bolt' : 'fa-solid fa-bolt-slash'" class="text-lg"></i>
          </button>
          <button @click="close" class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
      </header>

      <footer class="absolute bottom-0 inset-x-0 z-30 p-10 pb-16 flex flex-col items-center gap-8 bg-gradient-to-t from-black/80 to-transparent">
        
        <div class="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
          <p class="text-white/90 text-xs font-bold tracking-widest uppercase">
            Shtrix-kodni aniqlash kutilmoqda...
          </p>
        </div>

        <button @click="switchCamera" class="flex items-center gap-3 px-8 py-4 rounded-3xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl">
          <i class="fa-solid fa-camera-rotate text-lg"></i>
          Kamerani almashtirish
        </button>
      </footer>

      <div v-if="isLoading" class="absolute inset-0 z-50 bg-[#05070a] flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        <p class="mt-6 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Optika tayyorlanmoqda...</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue';
import { Html5Qrcode } from "html5-qrcode";

const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(['close', 'detected']);

const isLoading = ref(true);
const isTorchOn = ref(false);
let html5QrCode = null;

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.12);
  } catch (e) {}
};

const startScanner = async () => {
  isLoading.value = true;
  try {
    if (html5QrCode) await html5QrCode.stop().catch(() => {});
    html5QrCode = new Html5Qrcode("qr-reader");

    const config = {
      fps: 30,
      // Ramka yo'qligi sababli skanerlash maydonini kattaroq qilamiz
      qrbox: (w, h) => ({ width: w * 0.9, height: h * 0.5 }),
      aspectRatio: window.innerHeight / window.innerWidth
    };

    await html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
      playBeep();
      if (navigator.vibrate) navigator.vibrate(100);
      emit('detected', decodedText);
      close();
    });
    isLoading.value = false;
  } catch (err) {
    isLoading.value = false;
    close();
  }
};

const toggleTorch = async () => {
  try {
    isTorchOn.value = !isTorchOn.value;
    await html5QrCode.applyVideoConstraints({ advanced: [{ torch: isTorchOn.value }] });
  } catch (e) {}
};

const switchCamera = async () => {
  isLoading.value = true;
  await close();
  setTimeout(startScanner, 300);
};

const close = async () => {
  if (html5QrCode?.isScanning) await html5QrCode.stop().catch(() => {});
  emit('close');
};

watch(() => props.isOpen, (newVal) => { if (newVal) nextTick(() => setTimeout(startScanner, 400)); });
onUnmounted(close);
</script>

<style scoped>
/* Butun ekran bo'ylab harakatlanuvchi lazer */
.animate-global-scan {
  animation: global-laser 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes global-laser {
  0% { top: 10%; opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { top: 90%; opacity: 0; }
}

:deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
</style>