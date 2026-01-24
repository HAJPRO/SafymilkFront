<template>
  <div class="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0F172A]">
    <Title class="shrink-0">
      <template v-slot:title>
        <h3 class="font-black italic tracking-tight flex items-center">
          <i class="fa-solid fa-gem mr-3 text-indigo-500"></i>
          Xomashyolar boshqaruvi
        </h3>
      </template>
    </Title>

    <HeaderTabs :model-value="String(route.name)" class="shrink-0 z-10" />

    <div class="flex-1 overflow-hidden relative">
      <BaseLoader :show="pageLoading" :progress="loadingProgress" />

      <router-view v-if="isRouterAlive" v-slot="{ Component }">
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
import { ref, watch, nextTick, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import BaseLoader from "../../../UI/BaseLoader.vue";
import Title from "../../../components/Title.vue";
import HeaderTabs from "./HeaderTabs.vue";

const route = useRoute();
const isRouterAlive = ref(true);
const pageLoading = ref(false);
const loadingProgress = ref(0);
let progressInterval = null;

/**
 * Komponentni majburiy qayta yuklash (Re-render)
 * DOM dan o'chirib, keyingi tickda qayta yoqadi
 */
const reloadInternalComponent = async () => {
  isRouterAlive.value = false;
  await nextTick();
  isRouterAlive.value = true;
};

const startLoading = () => {
  pageLoading.value = true;
  loadingProgress.value = 0;
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (loadingProgress.value < 90) loadingProgress.value += 10;
  }, 50);
};

const stopLoading = () => {
  loadingProgress.value = 100;
  clearInterval(progressInterval);
  setTimeout(() => {
    pageLoading.value = false;
  }, 300);
};

// Har safar URL (fullPath) o'zgarganda ishlaydi
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    startLoading();
    
    // Faqat haqiqatda path o'zgarganda re-render qilamiz
    if (newPath !== oldPath) {
      await reloadInternalComponent();
    }
    
    stopLoading();
  },
  { immediate: true }
);

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
});
</script>

<style scoped>
.smart-slide-enter-active,
.smart-slide-leave-active {
  transition: all 0.3s ease;
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