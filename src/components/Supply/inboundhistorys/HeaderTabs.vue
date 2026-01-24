<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { EmployeeManagmentStore } from "../../../stores/HR/employee/employee.store";
import BaseTabs from "../../../UI/BaseTabs.vue";

const router = useRouter();
const route = useRoute();
const store_employees = EmployeeManagmentStore();
const { all_length } = storeToRefs(store_employees);

// --- 1. TABLAR KONFIGURATSIYASI ---
const employeeTabs = [
  { 
    id: 1, 
    label: "Kirimlar", 
    routeName: "Xomashyo kirim ro'yxati", 
    icon: "fa-solid fa-file-lines" 
  },
  { 
    id: 2, 
    label: "Analizlar", 
    routeName: "Laboratoriya analitik", 
    icon: "fa-solid fa-flask-vial" 
  },
   { 
    id: 3, 
    label: "Xomashyo kirim", 
    routeName: "Xomashyo kirim", 
    icon: "fa-solid fa-plus" 
  },
];

// --- 2. ACTIVE TABNI ANIQLASH ---
const activeTabId = computed(() => {
  const currentTab = employeeTabs.find(tab => tab.routeName === route.name);
  return currentTab ? currentTab.id : 1;
});

// --- 3. HARD RELOAD REDIRECT ---
const handleTabChange = (tabId) => {
  const selectedTab = employeeTabs.find(t => t.id === tabId);
  
  if (selectedTab && selectedTab.routeName !== route.name) {
    // 🟢 MANA SHU JOYI SAHIFANI REFRESH QILIB O'TKAZADI
    const fullPath = router.resolve({ name: selectedTab.routeName }).href;
    window.location.assign(fullPath); 
  }
};
</script>

<template>
  <div class="tabs-navigation-wrapper">
    <BaseTabs
      :model-value="activeTabId" 
      :tabs="employeeTabs"
      :counts="all_length"
      @update:model-value="handleTabChange"
    />
  </div>
</template>

