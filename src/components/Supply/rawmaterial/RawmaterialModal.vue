<script setup>
import { ref, reactive, computed } from "vue";
import { storeToRefs } from "pinia";
import { RawMaterialsStore } from "../../../stores/Supply/rawmaterial/rawmaterial.store";
import { useToast } from "../../../UI/utils/useToast";

// UI KOMPONENTLAR
import ModalUI from "../../../UI/Modal.vue";
import InputUI from "../../../UI/Input.vue";
import SelectUI from "../../../UI/Select.vue";
import ButtonUI from "../../../UI/Button.vue";

const store = RawMaterialsStore();
const { isAddModalOpen, isSubmitting } = storeToRefs(store);
const { toast } = useToast();

// --- 1. STATE ---
const form = reactive({
  name: "",
  code: "",
  unit: "Litr",
  costPrice: 0,
  fatContent: 0,
  density: 0,
  temperature: 0,
  image: null,
});

const unitOptions = [
  { label: "Litr (L)", value: "Litr" },
  { label: "Kilogramm (Kg)", value: "Kg" },
  { label: "Tonna (T)", value: "Tonna" },
];

// --- 2. ACTIONS ---
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => (form.image = e.target.result);
    reader.readAsDataURL(file);
  }
};

const resetForm = () => {
  Object.assign(form, {
    name: "", code: "", unit: "Litr", costPrice: 0,
    fatContent: 0, density: 0, temperature: 0, image: null,
  });
};

const submitForm = async () => {
  if (!form.name || !form.code) {
    return toast.error("Nom va kod kiritilishi shart!");
  }

  const success = await store.saveRawMaterial({ ...form });
  if (success) {
    resetForm();
    store.closeAddModal();
  }
};
</script>

<template>
  <ModalUI
    v-model="isAddModalOpen"
    title="Yangi xomashyo qo'shish"
    width="min-w-[50vw]"
    @close="resetForm"
  >
    <div class="space-y-6 py-2">
      <div class="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 bg-slate-50/50 dark:bg-slate-800/30 group transition-all hover:border-indigo-400">
        <div v-if="form.image" class="relative w-32 h-32 mb-3">
          <img :src="form.image" class="w-full h-full object-cover rounded-3xl shadow-xl" />
          <button @click="form.image = null" class="absolute -top-2 -right-2 bg-rose-500 text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center active:scale-75 transition-all">
            <i class="fa-solid fa-times text-xs"></i>
          </button>
        </div>
        <div v-else class="flex flex-col items-center cursor-pointer" @click="$refs.fileInput.click()">
          <div class="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm mb-3 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
            <i class="fa-solid fa-cloud-arrow-up text-2xl"></i>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Xomashyo rasmini tanlang</p>
        </div>
        <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputUI
          v-model="form.name"
          label="Xomashyo nomi"
          placeholder="Masalan: Toza sut (Sutli ko'l)"
          icon-pre="fa-solid fa-tag"
          required
        />
        <InputUI
          v-model="form.code"
          label="Shtrixkod / Identifikator"
          placeholder="Lot yoki kod"
          icon-pre="fa-solid fa-barcode"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectUI
          v-model="form.unit"
          :options="unitOptions"
          placeholder="Tanlang"
          icon-pre="fa-solid fa-scale-balanced"
        />
        <InputUI
          v-model.number="form.costPrice"
          label="Xarid narxi (1 birlik uchun)"
          type="number"
          suffix="UZS"
          icon-pre="fa-solid fa-money-bill-wave"
        />
      </div>

      <div class="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100/50 dark:border-indigo-500/10">
        <h4 class="text-[10px] font-black text-indigo-500 uppercase tracking-[2px] mb-5 flex items-center gap-2">
          <i class="fa-solid fa-flask-vial"></i> Laboratoriya tahlil ko'rsatkichlari
        </h4>
        <div class="grid grid-cols-3 gap-4">
          <InputUI
            v-model.number="form.fatContent"
            label="Yog'lilik %"
            type="number"
            suffix="%"
            size="small"
          />
          <InputUI
            v-model.number="form.density"
            label="Zichlik"
            type="number"
            icon-pre="fa-solid fa-weight-hanging"
            size="small"
          />
          <InputUI
            v-model.number="form.temperature"
            label="Harorat"
            type="number"
            suffix="°C"
            size="small"
          />
        </div>
      </div>

      <div class="flex items-center gap-3 pt-4">
        <ButtonUI
          variant="secondary"
          class="flex-1 !h-14 !rounded-2xl font-black uppercase tracking-widest text-[11px]"
          @click="store.closeAddModal()"
        >
          Bekor qilish
        </ButtonUI>
        <ButtonUI
          variant="primary"
          class="flex-[2] !h-14 !rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-500/30"
          :loading="isSubmitting"
          @click="submitForm"
        >
          Saqlash va Tasdiqlash
        </ButtonUI>
      </div>
    </div>
  </ModalUI>
</template>

<style scoped>
/* Modal ichidagi raqamlar inputi uchun spinnerlarni olib tashlash */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>