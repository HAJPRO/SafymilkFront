<script setup>
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { EmployeeManagmentStore } from "../../../stores/HR/employee/employee.store";
import BaseTabs from "../../../UI/BaseTabs.vue";

const props = defineProps(['modelValue']);
const router = useRouter();
const route = useRoute();

const store_employees = EmployeeManagmentStore();
const { all_length } = storeToRefs(store_employees);

// MUHIM: id qismidagi nomlar router/index.js dagi 'name' bilan bir xil bo'lishi shart!
const supplyTabs = [
  { id: "Aksesuarlar", label: "Aksesuarlar", icon: "fa-solid fa-table-list" },
  { id: "Aksessuar kirim ro'yxati", label: "Aksessuar kirim ro'yxati", icon: "fa-solid fa-boxes-packing" },
  { id: "Kirim qilish", label: "Kirim qilish", icon: "fa-solid fa-circle-plus" },
];

const handleUpdate = async (newValue) => {
  const targetName = typeof newValue === 'object' ? newValue.id : newValue;
  
  // Agar hozirgi sahifada bo'lsa, qayta push qilmaslik (Xatolikni oldini oladi)
  if (route.name === targetName) return;

  try {
    // Routerda bunday sahifa borligini tekshirish
    if (router.hasRoute(targetName)) {
      await router.push({ name: targetName });
    } else {
      console.warn(`Yo'nalish topilmadi: ${targetName}. Router/index.js ni tekshiring.`);
    }
  } catch (error) {
    // Navigatsiya duplikatsiyasi xatosini e'tiborsiz qoldirish
    if (error.name !== 'NavigationDuplicated') {
      console.error("Navigatsiyada xato:", error);
    }
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