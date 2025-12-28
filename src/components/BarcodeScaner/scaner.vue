<template>
  <Transition 
    enter-active-class="transition duration-700 cubic-bezier(0.19, 1, 0.22, 1)"
    enter-from-class="opacity-0 translate-y-10 blur-xl"
    enter-to-class="opacity-100 translate-y-0 blur-0"
    leave-active-class="transition duration-400 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/98 backdrop-blur-2xl p-0 sm:p-6 md:p-10 font-sans overflow-hidden touch-none selection:bg-indigo-500/30">
      
      <div class="relative w-full h-full sm:h-auto sm:aspect-[4/3] md:aspect-video max-w-6xl bg-black sm:rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border-none sm:border border-white/5 flex flex-col md:flex-row">
        
        <div class="relative flex-1 overflow-hidden order-2 md:order-1 group bg-black">
          <div id="qr-reader" class="absolute inset-0 w-full h-full"></div>
          
          <div v-if="!lastResult" class="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            <div class="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[38vh] md:h-[38vh] max-w-[500px]">
              <div v-for="c in ['tl', 'tr', 'bl', 'br']" :key="c" 
                   :class="['absolute w-14 h-14 border-indigo-500 transition-all duration-700 group-hover:scale-105', 
                            c === 'tl' ? 'top-0 left-0 border-t-[4px] border-l-[4px] rounded-tl-[2.5rem]' : '',
                            c === 'tr' ? 'top-0 right-0 border-t-[4px] border-r-[4px] rounded-tr-[2.5rem]' : '',
                            c === 'bl' ? 'bottom-0 left-0 border-b-[4px] border-l-[4px] rounded-bl-[2.5rem]' : '',
                            c === 'br' ? 'bottom-0 right-0 border-b-[4px] border-r-[4px] rounded-br-[2.5rem]' : '']">
              </div>
              <div class="absolute inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_30px_#6366f1] animate-laser"></div>
            </div>
          </div>
        </div>

        <div class="relative md:w-32 lg:w-36 z-40 p-5 md:py-12 flex md:flex-col justify-between items-center bg-slate-900/50 md:bg-black/40 border-b md:border-b-0 md:border-l border-white/5 order-1 md:order-2 backdrop-blur-xl">
          
          <button @click="close" class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>

          <div class="flex md:flex-col items-center gap-4 md:gap-8">
            <button @click="toggleTorch" 
              :class="isTorchOn ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]' : 'bg-white/5 text-slate-300 hover:bg-white/10'" 
              class="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all active:scale-90">
              <i class="fa-solid fa-bolt-lightning text-lg"></i>
            </button>
            
            <div class="hidden md:flex flex-col gap-3">
              <button @click="changeZoom(0.5)" class="w-12 h-12 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10">
                <i class="fa-solid fa-plus text-xs"></i>
              </button>
              <button @click="changeZoom(-0.5)" class="w-12 h-12 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10">
                <i class="fa-solid fa-minus text-xs"></i>
              </button>
            </div>

            <label class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 text-slate-300 flex items-center justify-center cursor-pointer hover:bg-white/10 active:scale-95 border border-white/5">
              <i class="fa-solid fa-images text-lg"></i>
              <input type="file" accept="image/*" class="hidden" @change="onFileChange">
            </label>
          </div>

          <button @click="switchCamera" class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all active:scale-90">
            <i class="fa-solid fa-camera-rotate text-lg"></i>
          </button>
        </div>

        <Transition 
          enter-active-class="transition duration-600 cubic-bezier(0.34, 1.56, 0.64, 1)" 
          enter-from-class="scale-90 opacity-0 blur-2xl" 
          enter-to-class="scale-100 opacity-100 blur-0"
        >
          <div v-if="lastResult" class="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md">
            <div class="w-full max-w-md bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-3xl text-center">
              <div class="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <i class="fa-solid fa-check text-3xl"></i>
              </div>
              <h4 class="text-white font-black text-2xl mb-2 tracking-tight">ANIQLANDI</h4>
              <p class="text-slate-500 text-[10px] uppercase tracking-widest mb-8 font-bold">Kod muvaffaqiyatli o'qildi</p>
              
              <div class="bg-black/40 rounded-3xl p-6 border border-white/5 mb-8">
                <p class="text-indigo-300 font-mono break-all text-xl font-bold tracking-wider select-all leading-relaxed">{{ lastResult }}</p>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <button @click="lastResult = null; restartScanner()" class="py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5 active:scale-95 text-xs uppercase tracking-widest">Qayta</button>
                <button @click="confirmResult" class="py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 text-xs uppercase tracking-widest">Tasdiqlash</button>
              </div>
            </div>
          </div>
        </Transition>

        <div v-if="isLoading" class="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div class="w-16 h-16 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
          <p class="mt-8 text-indigo-200/40 text-[9px] font-black uppercase tracking-[0.6em] animate-pulse">Kamera yuklanmoqda...</p>
        </div>

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
const zoomValue = ref(1);
const lastResult = ref(null);
const currentFacingMode = ref("environment");
let html5QrCode = null;

const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {}
};

const startScanner = async () => {
  isLoading.value = true;
  lastResult.value = null;
  try {
    if (html5QrCode) {
      if (html5QrCode.isScanning) await html5QrCode.stop();
      html5QrCode.clear();
    }
    
    html5QrCode = new Html5Qrcode("qr-reader");
    const config = {
      fps: 30,
      qrbox: (w, h) => {
        const size = Math.min(w, h) * 0.7;
        return { width: size, height: size };
      },
      aspectRatio: 1.0
    };

    await html5QrCode.start(
      { facingMode: currentFacingMode.value }, 
      config, 
      (text) => handleSuccess(text)
    );

    isLoading.value = false;
  } catch (err) {
    console.error("Scanner Error:", err);
    isLoading.value = false;
  }
};

const handleSuccess = async (text) => {
  playBeep();
  if (navigator.vibrate) navigator.vibrate(100);
  lastResult.value = text;
  if (html5QrCode.isScanning) await html5QrCode.stop();
};

const toggleTorch = async () => {
  if (!html5QrCode || !html5QrCode.isScanning) return;
  try {
    isTorchOn.value = !isTorchOn.value;
    await html5QrCode.applyVideoConstraints({
      advanced: [{ torch: isTorchOn.value }]
    });
  } catch (e) {
    isTorchOn.value = false;
    alert("Flashlight ushbu qurilmada mavjud emas");
  }
};

const changeZoom = async (step) => {
  if (!html5QrCode || !html5QrCode.isScanning) return;
  try {
    const capabilities = html5QrCode.getRunningTrackCapabilities();
    if (!capabilities.zoom) return;
    
    let newZoom = zoomValue.value + step;
    newZoom = Math.max(capabilities.zoom.min, Math.min(newZoom, capabilities.zoom.max));
    
    zoomValue.value = newZoom;
    await html5QrCode.applyVideoConstraints({ advanced: [{ zoom: newZoom }] });
  } catch (e) {}
};

const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file || !html5QrCode) return;
  isLoading.value = true;
  try {
    if (html5QrCode.isScanning) await html5QrCode.stop();
    const result = await html5QrCode.scanFile(file, true);
    handleSuccess(result);
  } catch (err) {
    alert("Kodni aniqlab bo'lmadi!");
    startScanner();
  } finally {
    isLoading.value = false;
  }
};

const switchCamera = async () => {
  currentFacingMode.value = currentFacingMode.value === "environment" ? "user" : "environment";
  await startScanner();
};

const confirmResult = () => {
  emit('detected', lastResult.value);
  close();
};

const restartScanner = () => startScanner();

const close = async () => {
  if (html5QrCode && html5QrCode.isScanning) {
    try { await html5QrCode.stop(); html5QrCode.clear(); } catch (e) {}
  }
  emit('close');
};

watch(() => props.isOpen, (val) => {
  if (val) nextTick(() => setTimeout(startScanner, 400));
});

onUnmounted(close);
</script>

<style scoped>
.animate-laser {
  animation: laser-move 2.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}
@keyframes laser-move {
  0% { top: 10%; opacity: 0; }
  20%, 80% { opacity: 1; }
  100% { top: 90%; opacity: 0; }
}
:deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
:deep(.qr-shaded-region), :deep(#qr-shaded-region), :deep(canvas), :deep(#qr-reader__dashboard) {
  display: none !important;
}
</style>