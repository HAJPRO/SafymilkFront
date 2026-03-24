<script setup>
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { EmployeeManagmentStore } from "../../../../stores/HR/employee/employee.store";
import {BaseTabs} from "../../../../UI/UI";

const props = defineProps(['modelValue']);
const router = useRouter();
const route = useRoute();

const store_employees = EmployeeManagmentStore();
const { all_length } = storeToRefs(store_employees);

const supplyTabs = [
  { id: "Xomashyolar", label: "Rejalar", icon: "fa-solid fa-boxes-stacked" },
  { id: "Xomashyo kirim ro'yxati_1", label: "Xomashyo kirim ro'yxati", icon: "fa-solid fa-list-check" },
  { id: "Xomashyo kirim qilish", label: "Xomashyo kirim qilish", icon: "fa-solid fa-file-circle-plus" },
];


const handleUpdate = async (newValue) => {
  // Tabdan kelgan ID (bu routerdagi name bilan bir xil bo'lishi shart)
  const targetName = typeof newValue === 'object' ? newValue.id : newValue;
  
  if (route.name !== targetName) {
    try {
      await router.push({ name: targetName });
      // Reload shart emas, chunki Parent'dagi :key="childRoute.fullPath" render qiladi
    } catch (err) {
      console.error("Navigatsiya xatosi:", err);
    }
  }
};
</script>

<template>
  <div class="tabs-navigation-wrapper border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] rounded-xl">
    <BaseTabs
      :model-value="modelValue" 
      :tabs="supplyTabs"
      @update:model-value="handleUpdate"
    />
  </div>
</template>