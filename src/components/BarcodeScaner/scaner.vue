<template>
  <Transition 
    enter-active-class="transition duration-[800ms] cubic-bezier(0.05, 0.7, 0.1, 1)"
    enter-from-class="opacity-0 scale-95 blur-2xl"
    enter-to-class="opacity-100 scale-100 blur-0"
    leave-active-class="transition duration-400 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-105 blur-3xl"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 font-sans overflow-hidden touch-none p-0 sm:p-4 md:p-8">
      
      <div class="relative w-full h-full sm:h-[90vh] lg:w-[60%] lg:max-w-[1000px] aspect-auto md:aspect-square lg:aspect-video bg-[#050505] sm:rounded-[4rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] border-none sm:border border-white/10 flex flex-col transition-all">
        
        <div 
          class="relative flex-1 bg-black overflow-hidden flex items-center justify-center cursor-pointer"
          @click="triggerManualFocus"
        >
          <div id="qr-reader" class="absolute inset-0 w-full h-full"></div>
          
          <div v-if="focusPoint.show" 
               class="absolute z-[60] w-16 h-16 border-2 border-white/40 rounded-full animate-focus-ring pointer-events-none"
               :style="{ left: focusPoint.x + 'px', top: focusPoint.y + 'px', transform: 'translate(-50%, -50%)' }">
          </div>

          <div v-if="!lastResult && !errorState" class="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            <div class="relative w-[70vw] h-[70vw] sm:w-[45vh] sm:h-[45vh] max-w-[400px]">
              <div v-for="c in ['tl', 'tr', 'bl', 'br']" :key="c" 
                :class="['absolute w-12 h-12 border-indigo-500 transition-all duration-700', 
                  c === 'tl' ? 'top-0 left-0 border-t-4 border-l-4 rounded-tl-[2.5rem]' : '',
                  c === 'tr' ? 'top-0 right-0 border-t-4 border-r-4 rounded-tr-[2.5rem]' : '',
                  c === 'bl' ? 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-[2.5rem]' : '',
                  c === 'br' ? 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-[2.5rem]' : '']">
              </div>
              <div class="absolute inset-x-10 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_40px_rgba(99,102,241,1)] animate-laser-premium"></div>
            </div>
          </div>
        </div>

        <div class="absolute inset-x-0 bottom-0 md:inset-x-auto md:right-8 md:top-1/2 md:-translate-y-1/2 z-40 p-6 md:p-0">
          <div class="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 sm:gap-6 bg-white/5 backdrop-blur-3xl p-4 md:p-6 rounded-[2.5rem] md:rounded-full border border-white/10 shadow-2xl">
            <button @click="close" class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center active:scale-75 order-last md:order-first"><i class="fa-solid fa-xmark text-xl"></i></button>
            <div class="flex flex-row md:flex-col items-center gap-4 sm:gap-6">
              <button @click="toggleTorch" :class="isTorchOn ? 'bg-amber-400 text-black shadow-lg scale-110' : 'bg-white/5 text-white/40'" class="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all"><i class="fa-solid fa-bolt-lightning text-lg"></i></button>
              <label class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 text-white/40 flex items-center justify-center cursor-pointer active:scale-90"><i class="fa-solid fa-image text-lg"></i><input type="file" accept="image/*" class="hidden" @change="onFileChange"></label>
              <button @click="cycleZoom" class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-500/10 text-indigo-400 flex flex-col items-center justify-center border border-indigo-500/20"><span class="text-[9px] font-black italic tracking-tighter">{{ zoomValue.toFixed(1) }}x</span></button>
            </div>
            <button @click="switchCamera" class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 text-white/40 flex items-center justify-center"><i class="fa-solid fa-camera-rotate text-lg"></i></button>
          </div>
        </div>

        <Transition enter-active-class="transition duration-600 cubic-bezier(0.17, 0.67, 0.83, 0.67)" enter-from-class="translate-y-20 opacity-0 scale-95" enter-to-class="translate-y-0 opacity-100 scale-100">
          <div v-if="lastResult || errorState" class="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
            <div class="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] p-10 shadow-3xl text-center relative overflow-hidden">
              <div :class="lastResult ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'" class="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border shadow-xl">
                <i :class="lastResult ? 'fa-solid fa-check-double' : 'fa-solid fa-triangle-exclamation'" class="text-3xl"></i>
              </div>
              <h4 class="text-white font-black text-xl mb-1 tracking-widest uppercase italic font-mono">{{ lastResult ? 'CODE DETECTED' : 'SCAN ERROR' }}</h4>
              <p class="text-white/20 text-[9px] uppercase tracking-[0.5em] mb-10 font-bold italic">{{ lastResult ? "Ma'lumotlar o'qildi" : "Kodni aniqlab bo'lmadi" }}</p>
              <div :class="lastResult ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-red-500/5 border-red-500/10'" class="rounded-2xl p-6 border mb-10">
                <p :class="lastResult ? 'text-indigo-200 font-mono' : 'text-red-200 font-medium'" class="break-all text-xl md:text-2xl font-black select-all tracking-tighter leading-none">{{ lastResult || errorMsg }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4" v-if="lastResult">
                <button @click="lastResult = null; restartScanner()" class="py-5 rounded-2xl bg-white/5 text-white/40 font-bold hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest border border-white/5">Qayta</button>
                <button @click="confirmResult" class="py-5 rounded-2xl bg-indigo-600 text-white font-black shadow-2xl hover:bg-indigo-500 transition-all text-[10px] uppercase tracking-widest">OK</button>
              </div>
              <button v-else @click="errorState = false; restartScanner()" class="w-full py-5 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest border border-white/5">Tushunarli</button>
            </div>
          </div>
        </Transition>

        <div v-if="isLoading" class="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div class="w-16 h-16 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick, reactive } from 'vue';
import { Html5Qrcode } from "html5-qrcode";

const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(['close', 'detected']);

const isLoading = ref(true);
const isTorchOn = ref(false);
const zoomValue = ref(1.0);
const lastResult = ref(null);
const errorState = ref(false);
const errorMsg = ref("");
const currentFacingMode = ref("environment");
const focusPoint = reactive({ x: 0, y: 0, show: false });
let html5QrCode = null;

// Audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const playSound = (type) => {
  const masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  if (type === 'success') {
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc2.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.05);
    [osc1, osc2].forEach(o => { o.connect(masterGain); o.start(); o.stop(audioCtx.currentTime + 0.2); });
  } else {
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    osc.connect(masterGain); osc.start(); osc.stop(audioCtx.currentTime + 0.3);
  }
};

const speak = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

// --- MANUAL FOCUS FUNCTION ---
const triggerManualFocus = async (event) => {
  if (!html5QrCode?.isScanning) return;
  const rect = event.currentTarget.getBoundingClientRect();
  focusPoint.x = (event.clientX || (event.touches ? event.touches[0].clientX : 0)) - rect.left;
  focusPoint.y = (event.clientY || (event.touches ? event.touches[0].clientY : 0)) - rect.top;
  focusPoint.show = true;
  setTimeout(() => focusPoint.show = false, 600);

  try {
    // Brauzer fokusni yangilashi uchun kichik zoom o'zgarishini yuboramiz
    await html5QrCode.applyVideoConstraints({
      advanced: [{ 
        focusMode: 'continuous',
        zoom: zoomValue.value > 1 ? zoomValue.value : 1.001 
      }]
    });
    setTimeout(async () => {
      await html5QrCode.applyVideoConstraints({ advanced: [{ zoom: zoomValue.value }] });
    }, 100);
  } catch (e) { console.warn("Manual focus not supported", e); }
};

const startScanner = async () => {
  isLoading.value = true;
  lastResult.value = null;
  errorState.value = false;
  try {
    if (html5QrCode) {
      if (html5QrCode.isScanning) await html5QrCode.stop();
      html5QrCode.clear();
    }
    html5QrCode = new Html5Qrcode("qr-reader");
    const config = {
      fps: 60,
      qrbox: (w, h) => ({ width: Math.min(w, h) * 0.8, height: Math.min(w, h) * 0.8 }),
      aspectRatio: 1.0,
      videoConstraints: {
        facingMode: "environment",
        focusMode: "continuous",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60 }
      }
    };
    await html5QrCode.start({ facingMode: "environment" }, config, (text) => {
      playSound('success');
      speak("Code Detected");
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      lastResult.value = text;
      html5QrCode.stop();
    });
    zoomValue.value = 1.0;
    isLoading.value = false;
  } catch (err) {
    isLoading.value = false;
    errorState.value = true;
    errorMsg.value = "Kamera ulanishda xatolik yuz berdi.";
    speak("Scan error");
  }
};

const cycleZoom = async () => {
  if (!html5QrCode?.isScanning) return;
  const caps = html5QrCode.getRunningTrackCapabilities();
  if (!caps.zoom) return;
  let nextZoom = zoomValue.value + 0.5;
  if (nextZoom > 3.0) nextZoom = 1.0;
  zoomValue.value = nextZoom;
  await html5QrCode.applyVideoConstraints({ advanced: [{ zoom: nextZoom }] });
};

const toggleTorch = async () => {
  if (!html5QrCode?.isScanning) return;
  try {
    isTorchOn.value = !isTorchOn.value;
    await html5QrCode.applyVideoConstraints({ advanced: [{ torch: isTorchOn.value }] });
  } catch (e) { isTorchOn.value = false; }
};

const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  isLoading.value = true;
  try {
    if (html5QrCode.isScanning) await html5QrCode.stop();
    const result = await html5QrCode.scanFile(file, true);
    lastResult.value = result;
    playSound('success');
    speak("Code found");
  } catch (err) {
    errorState.value = true;
    errorMsg.value = "Rasmda kod aniqlanmadi.";
    playSound('error');
    speak("Failed");
  } finally { isLoading.value = false; }
};

const switchCamera = () => { currentFacingMode.value = currentFacingMode.value === "environment" ? "user" : "environment"; startScanner(); };
const confirmResult = () => { emit('detected', lastResult.value); close(); };
const restartScanner = () => startScanner();
const close = async () => { if (html5QrCode?.isScanning) await html5QrCode.stop(); emit('close'); };

watch(() => props.isOpen, (val) => { if (val) nextTick(() => setTimeout(startScanner, 400)); });
onUnmounted(close);
</script>

<style scoped>
@keyframes focus-ring {
  0% { width: 80px; height: 80px; opacity: 1; border-width: 4px; }
  100% { width: 40px; height: 40px; opacity: 0; border-width: 1px; }
}
.animate-focus-ring { animation: focus-ring 0.6s ease-out forwards; }
.animate-laser-premium { animation: laser-move-premium 2.5s infinite; }
@keyframes laser-move-premium { 0% { top: 5%; opacity: 0; } 20%, 80% { opacity: 1; } 100% { top: 95%; opacity: 0; } }

:deep(video) { 
  width: 100% !important; 
  height: 100% !important; 
  object-fit: cover !important; 
  filter: none !important; /* Hech qanday filtr qo'shmaslik */
}

:deep(.qr-shaded-region), :deep(#qr-shaded-region), :deep(canvas), :deep(#qr-reader__dashboard), :deep(#qr-reader__status_span) { 
  display: none !important; 
}

button:active { transform: scale(0.92); }
</style>