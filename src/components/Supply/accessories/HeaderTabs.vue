<script setup>
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { EmployeeManagmentStore } from "../../../stores/HR/employee/employee.store";
import BaseTabs from "../../../UI/BaseTabs.vue";

const props = defineProps(['modelValue']);
const router = useRouter();

const store_employees = EmployeeManagmentStore();
const { all_length } = storeToRefs(store_employees);

const supplyTabs = [
  { id: "Aksesuarlar", label: "Kirimlar ro'yxati", icon: "fa-solid fa-table-list" },
  { id: "AccessoryInventory", label: "Aksesuarlar", icon: "fa-solid fa-boxes-packing" },
  { id: "AccessoryAdd", label: "Yangi kirim", icon: "fa-solid fa-circle-plus" },
];

const handleUpdate = async (newValue) => {
  const targetRouteName = typeof newValue === 'object' ? newValue.id : newValue;
  
  try {
    await router.push({ name: targetRouteName });
  } catch (error) {
    console.error("Navigatsiyada xato yuz berdi:", error);
  }
};
</script>

<template>
  <div class="tabs-navigation-wrapper border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]">
    <BaseTabs
      :model-value="modelValue" 
      :tabs="supplyTabs"
      :counts="all_length"
      @update:model-value="handleUpdate"
    />
  </div>
</template>