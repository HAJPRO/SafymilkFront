<template>
  <li
    class="relative py-3 px-3 rounded-lg mb-1 last:mb-0 transition-all duration-300 group select-none overflow-hidden"
    :class="[
      expanded 
        ? 'bg-slate-100 dark:bg-slate-700/40 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
    ]"
  >
    <div 
      v-if="expanded"
      class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-indigo-500 rounded-r-full z-20"
    ></div>

    <div class="sidebar-item-content">
      <slot :handleClick="handleClick" :expanded="expanded" />
    </div>
  </li>
</template>

<script setup>
import { ref, watch } from "vue";
const props = defineProps({ activeCondition: Boolean });
const expanded = ref(props.activeCondition);
watch(() => props.activeCondition, (newVal) => { expanded.value = newVal; });
const handleClick = () => { expanded.value = !expanded.value; };
</script>

<style scoped>
.sidebar-item-content :deep(.marquee-text) {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  transition: all 0.5s ease;
}

.group:hover .sidebar-item-content :deep(.marquee-text) {
  overflow: visible;
  text-overflow: clip;
  animation: scroll-text 6s linear infinite;
}

@keyframes scroll-text {
  0% { transform: translateX(0); }
  15% { transform: translateX(0); }
  85% { transform: translateX(-100%); }
  100% { transform: translateX(0); }
}
</style>