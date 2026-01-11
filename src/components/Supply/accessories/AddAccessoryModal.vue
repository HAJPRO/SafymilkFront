<template>
    <Modal v-model="isAddModalOpen" :title="form._id ? 'Tahrirlash' : 'Yangi Resurs Qo\'shish'" 
            icon="fa-solid fa-plus-circle" @close="handleClose" width="max-w-5xl">

        <div class="flex flex-col gap-y-7 pb-4">
            <div class="relative bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <div class="absolute -top-3 left-6 px-4 py-1 bg-indigo-600 rounded-full shadow-lg z-10 text-[10px] font-black text-white uppercase tracking-widest">
                    <i class="fa-solid fa-tag mr-2"></i>Asosiy ma'lumotlar
                </div>

                <div class="flex flex-col lg:flex-row gap-8 pt-2">
                    <div class="w-full lg:w-1/4 flex flex-col items-center">
                        <div class="w-full max-w-[200px] aspect-square relative group rounded-[2.5rem] overflow-hidden ring-4 ring-slate-50 shadow-xl">
                            <FileUpload v-model="form.image" type="image" @remove="form.image = null" />
                        </div>
                    </div>

                    <div class="w-full lg:w-3/4 space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div class="space-y-2">
                                <label class="form-label required text-xs font-bold text-slate-500">Katalog turi</label>
                                <Select v-model="form.type" :options="typeOptions" labelKey="name" valueKey="id" searchable :error="errors.type" />
                            </div>
                            <div class="space-y-2">
                                <label class="form-label text-xs font-bold text-slate-500">Shtrix Kod</label>
                                <Input v-model="form.code" placeholder="AUTO-GEN" />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="form-label required text-xs font-bold text-slate-500">Nomi</label>
                            <Input v-model="form.name" :error="errors.name" placeholder="Mahsulot nomini kiriting" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div class="space-y-2">
                                <label class="form-label required text-xs font-bold text-slate-500">Birlik</label>
                                <Select v-model="form.unit" :options="unitOptions" labelKey="name" valueKey="id" />
                            </div>
                            <div class="space-y-2">
                                <label class="form-label required text-xs font-bold text-slate-500">Xarid Narxi</label>
                                <Input v-model.number="form.costPrice" type="number" suffix="UZS" :error="errors.costPrice" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Transition name="slide-fade">
                <div v-if="needsVolume" class="relative bg-blue-50/40 dark:bg-blue-900/10 rounded-[2.5rem] p-6 border border-blue-100 dark:border-blue-900/30">
                    <div class="absolute -top-3 left-6 px-4 py-1 bg-blue-500 rounded-full shadow-lg z-10 text-[10px] font-black text-white uppercase tracking-widest">
                        <i class="fa-solid fa-box-open mr-2"></i>O'lcham va Hajm
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div class="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
                            <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Netto Hajmi</label>
                            <Input v-model.number="form.volume" type="number" step="0.01" input-class="text-center text-2xl font-black text-blue-600" placeholder="0.00" />
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
                            <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">O'lchov Birligi</label>
                            <Select v-model="form.volumeUnit" :options="volumeUnitOptions" labelKey="name" valueKey="id" />
                        </div>
                    </div>
                </div>
            </Transition>

            <div class="relative bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-800">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="md:col-span-2 space-y-2">
                        <label class="form-label text-xs font-bold text-slate-500">Izoh</label>
                        <Input v-model="form.description" type="textarea" rows="2" placeholder="Resurs haqida izoh..." />
                    </div>
                    <div class="bg-indigo-600 p-6 rounded-[2rem] shadow-xl shadow-indigo-200 flex flex-col items-center justify-center">
                        <label class="text-indigo-100 text-[10px] font-black uppercase mb-1">Boshlang'ich Qoldiq</label>
                        <Input :disabled="!!form._id" v-model.number="form.totalStock" type="number" :error="errors.totalStock" class="!border-transparent" input-class="text-center text-3xl font-black text-white placeholder-white/50" />
                        <span class="text-indigo-200 text-[10px] font-bold uppercase mt-1">{{ form.unit }}</span>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
                <div class="flex flex-col">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Umumiy balans qiymati:</span>
                    <span class="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">
                        {{ formatPrice(form.costPrice * form.totalStock) }}
                    </span>
                </div>
                <div class="flex gap-3">
                    <Button variant="outline" @click="handleClose" class="!rounded-2xl px-6 font-bold uppercase text-[11px]">Bekor qilish</Button>
                    <button @click="submitForm" 
    :disabled="isSubmitting || !isDirty" 
    :class="[
        'rounded-[1.2rem] px-10 py-3 shadow-lg font-black uppercase text-[11px] transition-all flex items-center gap-2',
        (isSubmitting || !isDirty) 
            ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
    ]"
>
    <i v-if="isSubmitting" class="fa-solid fa-circle-notch animate-spin"></i>
    {{ form._id ? "Saqlash" : "Qo'shish" }}
                    </button>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup>
import { reactive, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { AccessoriesStore } from "../../../stores/Supply/accessories/accessory.store";
import { useToast } from "../../../UI/utils/useToast";

import Modal from "../../../UI/Modal.vue";
import Button from "../../../UI/Button.vue";
import Select from "../../../UI/Select.vue";
import Input from "../../../UI/Input.vue";
import FileUpload from "../../../UI/Upload.vue"; 

const { toast } = useToast();
const store = AccessoriesStore();
const { isAddModalOpen, isSubmitting, selectedMaterial } = storeToRefs(store);

const typeOptions = [
    { id: "ingredient_dry", name: "🧂 Quruq ingredientlar", defaultUnit: "kg", prefix: "DRY" },
    { id: "ingredient_liquid", name: "🧪 Suyuq qo'shimchalar", defaultUnit: "litr", prefix: "LIQ" },
    { id: "pkg_plastic", name: "🍼 Plastik idishlar (PET)", defaultUnit: "dona", prefix: "PET" },
    { id: "pkg_cap", name: "🔘 Qopqoqlar va plombalar", defaultUnit: "dona", prefix: "CAP" },
    { id: "accessory", name: "💎 Aksesuarlar", defaultUnit: "dona", prefix: "ACC" },
];

const unitOptions = [{ id: 'litr', name: 'Litr (l)' }, { id: 'kg', name: 'Kilogram (kg)' }, { id: 'dona', name: 'Dona (pcs)' }];
const volumeUnitOptions = [{ id: 'ml', name: 'Millilitr (ml)' }, { id: 'L', name: 'Litr (L)' }, { id: 'gr', name: 'Gram (gr)' }, { id: 'kg', name: 'Kilogram (kg)' }];

const form = reactive({
    _id: null, type: null, name: "", code: "", unit: "kg", 
    costPrice: 0, volume: null, volumeUnit: 'L', 
    totalStock: 0, image: null, description: ""
});

const errors = reactive({});

const resetForm = () => {
    Object.assign(form, { 
        _id: null, 
        type: null, 
        name: "", 
        code: "", 
        unit: "kg", 
        costPrice: 0, 
        totalStock: 0, 
        image: null, 
        description: "",
        volume: null,      // Qo'shildi
        volumeUnit: 'L'    // Qo'shildi
    });
    // Xatoliklarni ham tozalash
    Object.keys(errors).forEach(key => errors[key] = false);
};

const handleClose = () => { store.closeAddModal(); resetForm(); };

watch(selectedMaterial, (val) => {
    if (val) {
        // Ob'ektni chuqur nusxalash, lekin File ob'ektlarini saqlab qolish
        Object.keys(form).forEach(key => {
            form[key] = val[key] !== undefined ? val[key] : form[key];
        });
    } else {
        resetForm();
    }
}, { immediate: true });

watch(() => form.type, (newType) => {
    if (!form._id && newType) {
        const selected = typeOptions.find(t => t.id === newType);
        if (selected) {
            form.unit = selected.defaultUnit;
            form.code = `${selected.prefix}-${new Date().getTime().toString().slice(-4)}`;
        }
    }
});

const needsVolume = computed(() => ['pkg_plastic', 'ingredient_liquid'].includes(form.type));
const formatPrice = (v) => new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(v || 0);

// Modal komponentingiz ichida
const submitForm = async () => {
    // Validatsiya
    errors.type = !form.type;
    errors.name = !form.name;
    errors.costPrice = !form.costPrice || form.costPrice <= 0;
    if (!form._id) errors.totalStock = form.totalStock < 0;

    if (Object.values(errors).some(e => e)) {
        toast.warning("Majburiy maydonlarni to'ldiring!");
        return;
    }

    try {
        const payload = { ...form };
        
        // Agar hajm kerak bo'lmasa, uni yubormaymiz
        if (!needsVolume.value) {
            delete payload.volume;
            delete payload.volumeUnit;
        }

        if (form.image instanceof File) {
            payload.image = await fileToBase64(form.image);
        }

        const success = await store.saveRawMaterial(payload);
        if (success) {
            toast.success(form._id ? "O'zgarishlar saqlandi" : "Yangi resurs qo'shildi");
            handleClose();
        }
    } catch (err) {
        toast.error("Amalni bajarishda xatolik yuz berdi");
    }
};
// script setup ichiga qo'shing
const isDirty = computed(() => {
    if (!form._id) return true;
    const original = selectedMaterial.value;
    if (!original) return false;

    // Rasm o'zgarganini tekshirish (File obyekti bo'lsa demak yangi yuklangan)
    const imageChanged = (form.image instanceof File) || (form.image !== original.image);

    return (
        form.name !== original.name ||
        form.type !== original.type ||
        form.unit !== original.unit ||
        form.costPrice !== original.costPrice ||
        form.description !== (original.description || "") ||
        form.volume != original.volume || // != ishlatish null vs 0 muammosini kamaytiradi
        form.volumeUnit !== original.volumeUnit ||
        imageChanged
    );
});
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};
</script>