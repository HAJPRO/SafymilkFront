<template>
  <div>
    <Title class="shrink-0">
      <template v-slot:title>
        <h3 class="font-black italic tracking-tight">
          <i class="fa-solid fa-gem mr-3 text-indigo-500"></i>Aksessuarlar boshqaruvi
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
          <keep-alive>
            <component :is="Component" :key="route.name" />
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

// FOIZLARNI DINAMIK OSHIRISH FUNKSIYASI
const startSmartProgress = () => {
  pageLoading.value = true;
  loadingProgress.value = 0;

  progressInterval = setInterval(() => {
    if (loadingProgress.value < 85) {
      // Boshida tezroq o'sadi
      loadingProgress.value += Math.random() * 8;
    } else if (loadingProgress.value < 95) {
      // 85% dan keyin sekinlashadi
      loadingProgress.value += Math.random() * 1;
    }
  }, 120);
};

const finishSmartProgress = () => {
  if (progressInterval) clearInterval(progressInterval);
  
  // Ma'lumot kelganda 100% ga silliq yetkazish
  const endInterval = setInterval(() => {
    if (loadingProgress.value < 100) {
      loadingProgress.value += 5;
    } else {
      clearInterval(endInterval);
      setTimeout(() => {
        pageLoading.value = false;
      }, 400); // 100% ni foydalanuvchi ko'rishi uchun qisqa pauza
    }
  }, 30);
};

// ROUTER NAVIGATSIYASI
router.beforeEach((to, from, next) => {
  if (to.name !== from.name) {
    startSmartProgress();
  }
  next();
});

router.afterEach(() => {
  finishSmartProgress();
});

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
});
</script>

<style scoped>
/* SAHIFA ALMASHISH ANIMATSIYASI */
.smart-slide-enter-active, .smart-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.3, 1, 0.4, 1);
}
.smart-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  filter: blur(4px);
}
.smart-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(1.02);
  filter: blur(4px);
}
</style>