<template>
  <Transition 
    enter-active-class="transition duration-[800ms] cubic-bezier(0.19, 1, 0.22, 1)"
    enter-from-class="opacity-0 scale-95 blur-2xl"
    enter-to-class="opacity-100 scale-100 blur-0"
    leave-active-class="transition duration-400 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-105 blur-3xl"
  >
    <div v-if="modelValue" class="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020408]/98 backdrop-blur-3xl font-sans overflow-hidden touch-none p-0 sm:p-4 md:p-8">
      
      <div class="relative w-full h-full sm:h-[85vh] lg:w-[60%] lg:max-w-[1100px] bg-black sm:rounded-[3.5rem] overflow-hidden shadow-2xl border-none sm:border border-white/5 flex flex-col transition-all">
        
        <div class="absolute top-6 left-6 right-6 z-[110] flex items-center justify-between pointer-events-none">
          <button 
            @click="isAudioMuted = !isAudioMuted" 
            class="pointer-events-auto w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all shadow-lg"
          >
            <i :class="['fa-solid', isAudioMuted ? 'fa-volume-xmark opacity-50' : 'fa-volume-high text-indigo-400', 'text-lg']"></i>
          </button>

          <button 
            @click="handleClose" 
            class="pointer-events-auto w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all shadow-lg hover:bg-red-500/20"
          >
            <i class="fa-solid fa-xmark text-xl text-red-400"></i>
          </button>
        </div>

        <div class="relative flex-1 bg-black overflow-hidden flex items-center justify-center cursor-crosshair" @click="triggerManualFocus">
          <div id="qr-reader" class="absolute inset-0 w-full h-full"></div>
          
          <div v-if="focusPoint.show" class="absolute z-[60] w-14 h-14 border border-white/50 rounded-full animate-focus-ring pointer-events-none" :style="{ left: focusPoint.x + 'px', top: focusPoint.y + 'px', transform: 'translate(-50%, -50%)' }"></div>

          <div v-if="!lastResult && !errorState" class="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            <div class="relative w-[70vw] h-[70vw] sm:w-[45vh] sm:h-[45vh] max-w-[450px]">
              <div v-for="c in ['tl', 'tr', 'bl', 'br']" :key="c" 
                :class="['absolute w-10 h-10 border-indigo-500/80 transition-all duration-1000', 
                  c === 'tl' ? 'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-3xl' : '', 
                  c === 'tr' ? 'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-3xl' : '', 
                  c === 'bl' ? 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-3xl' : '', 
                  c === 'br' ? 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-3xl' : '']">
              </div>
              <div class="absolute inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_25px_rgba(99,102,241,0.8)] animate-laser-soft"></div>
              <div class="absolute inset-0 rounded-3xl border border-white/5 animate-pulse-slow"></div>
            </div>
            <p class="mt-12 text-white/30 text-[10px] uppercase tracking-[0.6em] font-medium animate-pulse">Skanerlash...</p>
          </div>
        </div>

        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[450px]">
          <div class="flex items-center justify-between bg-white/5 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <button @click="toggleTorch" :class="isTorchOn ? 'bg-amber-400 text-black shadow-lg scale-110' : 'text-white/60'" class="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-75">
              <i class="fa-solid fa-bolt-lightning text-xl"></i>
            </button>
            
            <div class="w-[1px] h-6 bg-white/10"></div>

            <label class="w-12 h-12 rounded-full text-white/60 flex items-center justify-center cursor-pointer active:scale-90 transition-all">
              <i class="fa-solid fa-image text-xl"></i>
              <input type="file" accept="image/*" class="hidden" @change="onFileChange">
            </label>
            
            <div class="w-[1px] h-6 bg-white/10"></div>

            <button @click="cycleZoom" class="w-12 h-12 rounded-full text-white/60 font-mono text-[10px] font-bold active:scale-90">
              {{ zoomValue.toFixed(1) }}x
            </button>

            <div class="w-[1px] h-6 bg-white/10"></div>

            <button @click="switchCamera" class="w-12 h-12 rounded-full text-white/60 flex items-center justify-center transition-all active:scale-75">
              <i class="fa-solid fa-camera-rotate text-xl"></i>
            </button>
          </div>
        </div>

        <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="translate-y-10 opacity-0" enter-to-class="translate-y-0 opacity-100">
          <div v-if="lastResult || errorState" class="absolute inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl text-center">
            <div class="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 shadow-3xl">
              <div :class="lastResult ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'" class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border shadow-xl">
                <i :class="lastResult ? 'fa-solid fa-check' : 'fa-solid fa-triangle-exclamation'" class="text-2xl"></i>
              </div>
              <h4 class="text-white font-bold text-lg mb-2 tracking-widest uppercase">{{ lastResult ? 'Aniqlandi' : 'Xatolik' }}</h4>
              <p class="text-white/40 text-[11px] mb-8 font-mono break-all">{{ lastResult || errorMsg }}</p>
              <div class="flex gap-3">
                <button v-if="lastResult" @click="lastResult = null; restartScanner()" class="flex-1 py-4 rounded-2xl bg-white/5 text-white text-xs font-bold uppercase tracking-widest border border-white/5">Qayta</button>
                <button @click="confirmResult" class="flex-1 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest shadow-xl">{{ lastResult ? confirmText : 'Urinish' }}</button>
              </div>
            </div>
          </div>
        </Transition>

        <div v-if="isLoading" class="absolute inset-0 z-[130] bg-black flex flex-col items-center justify-center"><div class="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onUnmounted,onMounted, nextTick, reactive } from 'vue';
import { Html5Qrcode } from "html5-qrcode";

const props = defineProps({
  modelValue: Boolean,
  confirmText: { type: String, default: 'DAVOM ETTIRISH' },
  audioFeedback: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'detected', 'close']);

const isLoading = ref(false);
const isTorchOn = ref(false);
const isAudioMuted = ref(false);
const zoomValue = ref(1.0);
const lastResult = ref(null);
const errorState = ref(false);
const errorMsg = ref("");
const focusPoint = reactive({ x: 0, y: 0, show: false });

let html5QrCode = null;
let audioCtx = null;
let beepInterval = null;

// --- AUDIO ---
const playTone = (freq, vol, duration, type = 'sine') => {
  if (isAudioMuted.value || !props.audioFeedback) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
};

const startWorkingBeep = () => {
  stopWorkingBeep();
  beepInterval = setInterval(() => {
    if (!isAudioMuted.value && !lastResult.value && !errorState.value) {
      playTone(1800, 0.01, 0.08, 'sine'); 
    }
  }, 2000);
};

const stopWorkingBeep = () => { if (beepInterval) clearInterval(beepInterval); };
const playSuccessSound = () => { playTone(950, 0.3, 0.15); setTimeout(() => playTone(1450, 0.3, 0.2), 80); };
const playErrorSound = () => { playTone(220, 0.4, 0.3, 'triangle'); setTimeout(() => playTone(180, 0.4, 0.4, 'triangle'), 150); };

// --- SCANNER ---
const stopScannerInstance = async () => {
  stopWorkingBeep();
  if (html5QrCode) {
    try {
      if (html5QrCode.isScanning) await html5QrCode.stop();
      html5QrCode.clear();
      html5QrCode = null;
    } catch (e) {}
  }
};

const startScanner = async () => {
  await stopScannerInstance();
  isLoading.value = true;
  lastResult.value = null;
  errorState.value = false;
  try {
    await nextTick();
    const container = document.getElementById("qr-reader");
    if (!container) return;
    html5QrCode = new Html5Qrcode("qr-reader", { experimentalFeatures: { useBarCodeDetectorIfSupported: true } });
    const config = {
      fps: 20,
      qrbox: (w, h) => { const size = Math.min(w, h) * 0.75; return { width: size, height: size }; },
      aspectRatio: 1.0,
      videoConstraints: { facingMode: "environment", focusMode: "continuous" }
    };
    await html5QrCode.start({ facingMode: "environment" }, config, (text) => {
      playSuccessSound();
      lastResult.value = text;
      stopWorkingBeep();
      stopScannerInstance();
    });
    isLoading.value = false;
    startWorkingBeep();
  } catch (err) {
    isLoading.value = false;
    errorState.value = true;
    playErrorSound();
    errorMsg.value = err.toString().includes("NotAllowedError") ? "Kameraga ruxsat berilmadi." : "Kamera ulanmadi.";
  }
};

const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  isLoading.value = true;
  await stopScannerInstance();
  try {
    const fs = new Html5Qrcode("qr-reader");
    const result = await fs.scanFile(file, true);
    lastResult.value = result;
    playSuccessSound();
    fs.clear();
  } catch (err) {
    errorState.value = true;
    errorMsg.value = "Rasmda kod aniqlanmadi.";
    playErrorSound();
  } finally { isLoading.value = false; event.target.value = ""; }
};

const handleClose = async () => { await stopScannerInstance(); emit('update:modelValue', false); emit('close'); };
const confirmResult = () => { if (lastResult.value) { emit('detected', lastResult.value); handleClose(); } else { restartScanner(); } };
const triggerManualFocus = async (event) => {
  if (!html5QrCode?.isScanning) return;
  const rect = event.currentTarget.getBoundingClientRect();
  focusPoint.x = (event.clientX || event.touches[0].clientX) - rect.left;
  focusPoint.y = (event.clientY || event.touches[0].clientY) - rect.top;
  focusPoint.show = true;
  setTimeout(() => focusPoint.show = false, 600);
  try { await html5QrCode.applyVideoConstraints({ advanced: [{ focusMode: 'continuous', zoom: zoomValue.value + 0.01 }] }); } catch (e) {}
};
const cycleZoom = async () => {
  if (!html5QrCode?.isScanning) return;
  zoomValue.value = zoomValue.value >= 3.0 ? 1.0 : zoomValue.value + 0.5;
  try { await html5QrCode.applyVideoConstraints({ advanced: [{ zoom: zoomValue.value }] }); } catch (e) {}
};
const toggleTorch = async () => {
  if (!html5QrCode?.isScanning) return;
  isTorchOn.value = !isTorchOn.value;
  try { await html5QrCode.applyVideoConstraints({ advanced: [{ torch: isTorchOn.value }] }); } catch (e) { isTorchOn.value = false; }
};
const switchCamera = () => startScanner();
const restartScanner = () => startScanner();

watch(() => props.modelValue, (isOpen) => { if (isOpen) setTimeout(startScanner, 400); else handleClose(); });
onUnmounted(handleClose);




//barkodeskaner
let scannerBuffer = "";
let lastKeyTime = Date.now();

const handleExternalScanner = (event) => {
  const currentTime = Date.now();
  
  // Agar tugmalar orasidagi farq juda qisqa bo'lsa (skaner tez yozadi)
  if (currentTime - lastKeyTime > 50) {
    scannerBuffer = ""; // Agar odam qo'lda yozsa, buferni tozalaymiz
  }
  
  lastKeyTime = currentTime;

  if (event.key === 'Enter') {
    if (scannerBuffer.length > 2) {
      playSuccessSound();
      lastResult.value = scannerBuffer;
      // Agar skaner o'qisa, kamerani to'xtatish ixtiyoriy
      stopScannerInstance(); 
      scannerBuffer = "";
    }
  } else {
    // Faqat belgilarni yig'amiz (Shift, Ctrl kabilarni tashlab ketamiz)
    if (event.key.length === 1) {
      scannerBuffer += event.key;
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleExternalScanner);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleExternalScanner);
  handleClose();
});
</script>

<style scoped>
@keyframes focus-ring { 0% { width: 100px; height: 100px; opacity: 1; } 100% { width: 40px; height: 40px; opacity: 0; } }
.animate-focus-ring { animation: focus-ring 0.5s ease-out forwards; }
@keyframes laser-soft { 0% { top: 10%; opacity: 0; } 20%, 80% { opacity: 1; } 100% { top: 90%; opacity: 0; } }
.animate-laser-soft { animation: laser-soft 3s ease-in-out infinite; }
.animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
:deep(video) { width: 100% !important; height: 100% !important; object-fit: cover !important; }
:deep(.qr-shaded-region), :deep(#qr-shaded-region), :deep(canvas), :deep(#qr-reader__dashboard) { display: none !important; }
</style>