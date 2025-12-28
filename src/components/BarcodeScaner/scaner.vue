<template>
  <Transition 
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0 scale-95 blur-md"
    enter-to-class="opacity-100 scale-100 blur-0"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100 scale-100 blur-0"
    leave-to-class="opacity-0 blur-md"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden touch-none select-none p-0 md:p-8 font-sans">
      
      <div class="relative w-full h-full md:w-1/2 md:max-w-3xl md:h-[85vh] bg-black md:rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-500 border-none md:border md:border-white/10">
        
        <div id="qr-reader" class="absolute inset-0 w-full h-full object-cover scale-[1.05]"></div>

        <div v-if="!lastResult" class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div class="relative w-[75vw] h-[75vw] md:w-[45vh] md:h-[45vh] max-w-[400px] max-h-[400px]">
            <div v-for="c in ['tl', 'tr', 'bl', 'br']" :key="c" 
                 :class="['absolute w-12 h-12 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.6)]', 
                          c === 'tl' ? 'top-0 left-0 border-t-[6px] border-l-[6px] rounded-tl-[2.5rem]' : '',
                          c === 'tr' ? 'top-0 right-0 border-t-[6px] border-r-[6px] rounded-tr-[2.5rem]' : '',
                          c === 'bl' ? 'bottom-0 left-0 border-b-[6px] border-l-[6px] rounded-bl-[2.5rem]' : '',
                          c === 'br' ? 'bottom-0 right-0 border-b-[6px] border-r-[6px] rounded-br-[2.5rem]' : '']">
            </div>
            <div class="absolute inset-x-4 h-[2.5px] bg-indigo-400 shadow-[0_0_30px_#6366f1] animate-scan-indigo"></div>
          </div>
        </div>

        <header class="absolute top-0 inset-x-0 z-40 p-4 pt-10 md:p-8 flex justify-center items-center bg-gradient-to-b from-black/80 to-transparent text-white">
          <div class="flex items-center gap-2 md:gap-4 bg-black/30 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <button @click="toggleTorch" :class="isTorchOn ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/70'" class="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-inner">
              <i class="fa-solid fa-bolt text-lg"></i>
            </button>
            <button @click="updateZoom(-0.5)" class="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/5 text-white/70 flex items-center justify-center active:scale-90"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
            <label class="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/5 text-white/70 flex items-center justify-center active:scale-90 cursor-pointer"><i class="fa-solid fa-image"></i><input type="file" accept="image/*" class="hidden" @change="onFileChange"></label>
            <button @click="updateZoom(0.5)" class="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/5 text-white/70 flex items-center justify-center active:scale-90"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
            <button @click="switchCamera" class="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/5 text-white/70 flex items-center justify-center active:scale-90"><i class="fa-solid fa-camera-rotate"></i></button>
            <div class="w-[1px] h-8 bg-white/10 mx-1"></div>
            <button @click="close" class="w-11 h-11 md:w-12 md:h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center active:scale-90"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </header>

        <Transition enter-active-class="transition duration-500 delay-200 cubic-bezier(0.16, 1, 0.3, 1)" enter-from-class="translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100">
          <div v-if="lastResult" class="absolute bottom-10 inset-x-6 z-50">
            <div class="bg-indigo-950/50 backdrop-blur-3xl border border-indigo-400/30 rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.6)] text-center">
              <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 animate-bounce">
                <i class="fa-solid fa-check text-2xl"></i>
              </div>
              <h4 class="text-white font-black text-xl mb-1 uppercase tracking-tighter">Kod aniqlandi</h4>
              <p class="text-indigo-300/60 text-[10px] font-bold tracking-widest uppercase mb-6">Muvaffaqiyatli skanerlandi</p>
              
              <div class="bg-black/40 rounded-2xl p-4 border border-white/5 mb-8">
                <p class="text-indigo-100 font-mono break-all text-lg select-all">{{ lastResult }}</p>
              </div>

              <div class="flex gap-4">
                <button @click="lastResult = null; restartScanner()" class="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold text-xs uppercase tracking-[0.2em] border border-white/10 active:scale-95 transition-all">
                  Qayta skaner
                </button>
                <button @click="confirmResult" class="flex-1 py-4 rounded-2xl bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(99,102,241,0.4)] active:scale-95 transition-all">
                  Tasdiqlash
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <footer v-if="!lastResult" class="absolute bottom-10 inset-x-0 z-30 flex justify-center px-10 pointer-events-none">
          <div class="px-8 py-3 rounded-full bg-indigo-600/10 backdrop-blur-xl border border-indigo-500/20">
            <p class="text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase">Scan Active</p>
          </div>
        </footer>

        <div v-if="isLoading" class="absolute inset-0 z-[100] bg-[#05070a] flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
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
const zoomLevel = ref(1);
const lastResult = ref(null);
let html5QrCode = null;

// PROFESSIONAL BEEP SOUND LOGIC
const playScanSuccessSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Skanerlash uchun xos "high-pitched" qisqa tovush
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // 1.2kHz
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.warn("Audio Context blocked by browser policy");
  }
};

const startScanner = async () => {
  isLoading.value = true;
  lastResult.value = null;
  try {
    if (html5QrCode) {
      if (html5QrCode.isScanning) await html5QrCode.stop().catch(() => {});
      html5QrCode.clear();
    }
    html5QrCode = new Html5Qrcode("qr-reader");
    const config = {
      fps: 30,
      qrbox: (w, h) => {
        const size = Math.min(w, h) * 0.75;
        return { width: size, height: size };
      },
      aspectRatio: 1.0
    };
    await html5QrCode.start({ facingMode: "environment" }, config, (text) => {
      handleSuccess(text);
    });
    isLoading.value = false;
  } catch (err) {
    isLoading.value = false;
    close();
  }
};

const handleSuccess = async (text) => {
  // 1. Ovoz chiqarish
  playScanSuccessSound();
  
  // 2. Vibratsiya (Ikki marta qisqa)
  if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
  
  // 3. Natijani ko'rsatish
  lastResult.value = text;
  
  // 4. Kamerani to'xtatish
  if (html5QrCode.isScanning) {
    await html5QrCode.stop();
  }
};

const confirmResult = () => {
  emit('detected', lastResult.value);
  close();
};

const restartScanner = () => {
  startScanner();
};

const updateZoom = async (step) => {
  try {
    const caps = html5QrCode.getRunningTrackCapabilities();
    let newZoom = zoomLevel.value + step;
    if (newZoom < (caps.zoom.min || 1)) newZoom = caps.zoom.min;
    if (newZoom > (caps.zoom.max || 5)) newZoom = caps.zoom.max;
    zoomLevel.value = newZoom;
    await html5QrCode.applyVideoConstraints({ advanced: [{ zoom: newZoom }] });
  } catch (e) {}
};

const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    isLoading.value = true;
    const result = await html5QrCode.scanFile(file, true);
    handleSuccess(result);
    isLoading.value = false;
  } catch (err) {
    alert("Kodni aniqlab bo'lmadi!");
    isLoading.value = false;
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
  setTimeout(startScanner, 500);
};

const close = async () => {
  if (html5QrCode && html5QrCode.isScanning) {
    try { await html5QrCode.stop(); html5QrCode.clear(); } catch (err) {}
  }
  emit('close');
};

watch(() => props.isOpen, (val) => { if (val) nextTick(() => setTimeout(startScanner, 600)); });
onUnmounted(close);
</script>

<style scoped>
.animate-scan-indigo { animation: scan-move 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
@keyframes scan-move {
  0% { top: 5%; opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { top: 95%; opacity: 0; }
}
:deep(video) { width: 100% !important; height: 100% !important; object-fit: cover !important; }
:deep(.qr-shaded-region), :deep(#qr-shaded-region), :deep(canvas) { display: none !important; }
</style>