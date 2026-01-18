<template>
  <div class="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0F172A]">
    <Title class="shrink-0">
      <template v-slot:title>
        <h3 class="font-black italic tracking-tight flex items-center">
          <i class="fa-solid fa-gem mr-3 text-indigo-500"></i>
          Printer sozlamalari
        </h3>
      </template>
    </Title>

    <HeaderTabs :model-value="String(route.name)" class="shrink-0 z-10" />

    <div class="flex-1 overflow-hidden relative">
      <BaseLoader 
        :show="pageLoading" 
        :progress="loadingProgress" 
        :size="80"
        subtitle="Ma'lumotlar yuklanmoqda..."
      />

      <router-view v-slot="{ Component }">
        <transition name="smart-slide" mode="out-in">
          <keep-alive :max="5">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseLoader from "../../../UI/BaseLoader.vue";
import Title from "../../../components/Title.vue";
import HeaderTabs from "./HeaderTabs.vue";

const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const loadingProgress = ref(0);
let progressInterval = null;

// FOIZLARNI DINAMIK OSHIRISH
const startSmartProgress = () => {
  if (progressInterval) clearInterval(progressInterval);
  pageLoading.value = true;
  loadingProgress.value = 0;

  progressInterval = setInterval(() => {
    if (loadingProgress.value < 85) {
      loadingProgress.value += Math.floor(Math.random() * 10) + 2;
    } else if (loadingProgress.value < 95) {
      loadingProgress.value += 0.5;
    }
  }, 100);
};

const finishSmartProgress = () => {
  if (progressInterval) clearInterval(progressInterval);
  
  const endInterval = setInterval(() => {
    if (loadingProgress.value < 100) {
      loadingProgress.value += 10;
    } else {
      clearInterval(endInterval);
      setTimeout(() => {
        pageLoading.value = false;
      }, 300);
    }
  }, 20);
};

// NAVIGATSIYA GUARDLARI (Xatolarni oldini olish uchun hooklar)
const unregisterBefore = router.beforeEach((to, from, next) => {
  if (to.name !== from.name) {
    startSmartProgress();
  }
  next();
});

const unregisterAfter = router.afterEach(() => {
  finishSmartProgress();
});

// Komponent o'chirilganda hooklarni tozalash (MUHIM!)
onUnmounted(() => {
  unregisterBefore();
  unregisterAfter();
  if (progressInterval) clearInterval(progressInterval);
});
</script>

<style scoped>
/* SAHIFA ALMASHISH ANIMATSIYASI - YANADA SILLIQROQ */
.smart-slide-enter-active, .smart-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.smart-slide-enter-from {
  opacity: 0;
  transform: translateX(15px);
}
.smart-slide-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}
</style>