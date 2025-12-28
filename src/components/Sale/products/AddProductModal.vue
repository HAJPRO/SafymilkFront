<script setup>
import { ref, reactive, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { ProductsManagmentStore } from "../../../stores/Sale/products/product.store";
import { useToast } from "../../../UI/utils/useToast";

// --- UI COMPONENTS ---
import Modal from "../../../UI/Modal.vue";
import Button from "../../../UI/Button.vue";
import Select from "../../../UI/Select.vue";
import Input from "../../../UI/Input.vue";
import FileUpload from "../../../UI/Upload.vue"; 

const { toast } = useToast();
const store_product = ProductsManagmentStore();
const { product_modal, model, TitleAction } = storeToRefs(store_product);

// --- IMAGE VIEWER STATE ---
const showImagePreview = ref(false);
const previewImageUrl = computed(() => {
    if (!model.value.image) return null;
    if (model.value.image instanceof File) {
        return URL.createObjectURL(model.value.image);
    }
    return model.value.image;
});

// --- SCANNER WATCHER ---
// Skaner qilinganda TitleAction ichida code kelsa, model.code ga o'zlashtiramiz
watch(() => TitleAction.value?.code, (newCode) => {
    if (newCode) {
        model.value.code = newCode;
    }
}, { immediate: true });

// --- OPTIONS ---
const categoryes = ref([
    { id: 1, name: "Gazli ichimliklar" },
    { id: 2, name: "Gazsiz ichimliklar" },
    { id: 3, name: "Sharbatlar" },
    { id: 4, name: "Sneklar" },
    { id: 5, name: "Sut mahsulotlari" },
]);

const units = ref([
    { id: 'dona', name: 'Dona' },
    { id: 'kg', name: 'Kilogram (kg)' },
    { id: 'litr', name: 'Litr (l)' },
    { id: 'blok', name: 'Blok/Upakovka' }
]);

const errors = reactive({});

// --- CALCULATIONS ---
const calculateSalePrice = (cost, margain) => cost > 0 ? parseFloat((cost * (1 + margain / 100)).toFixed(2)) : 0;
const calculateMargain = (cost, sale) => cost > 0 ? parseFloat((((sale - cost) / cost) * 100).toFixed(2)) : 0;

// --- WATCHERS (PRICE) ---
watch(() => model.value.costPrice, (newCost) => {
    if (newCost > 0 && model.value.margainPercent > 0) {
        model.value.salePrice = calculateSalePrice(newCost, model.value.margainPercent);
    }
}, { immediate: true });

watch(() => model.value.margainPercent, (newMargain) => {
    const cost = model.value.costPrice || 0;
    if (cost > 0) model.value.salePrice = calculateSalePrice(cost, newMargain);
});

watch(() => model.value.salePrice, (newSale) => {
    const cost = model.value.costPrice || 0;
    if (cost > 0) model.value.margainPercent = calculateMargain(cost, newSale);
});

// --- ACTIONS ---
const handleClose = () => {
    store_product.closeModal();
    Object.keys(errors).forEach(key => delete errors[key]);
};

const SaveProduct = async () => {
    errors.code = !model.value.code;
    errors.name = !model.value.name;
    errors.category = !model.value.category;
    errors.salePrice = !model.value.salePrice || model.value.salePrice <= 0;

    if (Object.values(errors).some(e => e)) {
        toast.warning("Iltimos, majburiy maydonlarni to'ldiring!");
        return;
    }

    try {
        const formData = new FormData();
        Object.keys(model.value).forEach(key => {
            const value = model.value[key];
            if (key === 'image') {
                if (value instanceof File) formData.append('image', value);
                else if (typeof value === 'string') formData.append('image', value);
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        await store_product.SaveProduct(formData); 
        toast.success("Muvaffaqiyatli saqlandi!");
        handleClose();
    } catch (error) {
        toast.error("Saqlashda xatolik!");
    }
};

const formatPrice = (v) => {
    return new Intl.NumberFormat('uz-UZ', { 
        style: 'currency', 
        currency: 'UZS', 
        maximumFractionDigits: 0 
    }).format(v || 0);
};
</script>

<template>
    <Modal v-model="product_modal" :title="TitleAction.title" 
           subtitle="Mahsulot ma'lumotlari va narx sozlamalari"
           icon="fa-solid fa-box-open" @close="handleClose" width="max-w-5xl">

        <div class="flex flex-col gap-y-6 pb-20 sm:pb-0">
            <div class="relative bg-white dark:bg-slate-900/40 rounded-3xl p-5 sm:p-8 border border-slate-200/60 dark:border-slate-800 shadow-sm transition-all duration-300">
                <div class="absolute -top-3 left-6 px-4 py-1 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30">
                    <span class="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <i class="fa-solid fa-fingerprint"></i> Mahsulot kartasi
                    </span>
                </div>

                <div class="flex flex-col lg:flex-row gap-8 pt-2">
                    <div class="w-full lg:w-1/4 flex flex-col items-center">
                        <div class="w-full max-w-[220px] aspect-square relative">
                            <FileUpload v-model="model.image" type="image" rounded="rounded-[2.5rem]"
                                        :error="errors.image" @view="showImagePreview = true"
                                        class="shadow-xl shadow-slate-200/50 dark:shadow-none" />
                        </div>
                        <p class="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tight">Asosiy rasm</p>
                    </div>

                    <div class="w-full lg:w-3/4 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div class="space-y-2">
                                <label class="form-label required">Shtrix Kod / Artikul</label>
                                <Input v-model="model.code" type="number" placeholder="Skanerlang yoki kiriting..." 
                                       icon-pre="fa-solid fa-barcode" :error="errors.code" clearable />
                            </div>
                            <div class="space-y-2">
                                <label class="form-label required">Mahsulot Nomi</label>
                                <Input v-model="model.name" placeholder="Coca Cola 1.5L" :error="errors.name" />
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div class="space-y-2">
                                <label class="form-label required">Kategoriya</label>
                                <Select v-model="model.category" :options="categoryes" labelKey="name" valueKey="name" 
                                        placeholder="Tanlang..." searchable :error="!!errors.category" clearable />
                            </div>
                            <div class="space-y-2">
                                <label class="form-label required">O'lchov Birligi</label>
                                <Select v-model="model.unit" :options="units" labelKey="name" valueKey="id" clearable searchable/>
                            </div>
                            <div class="space-y-2">
                                <label class="form-label">Qadoq (Blokda)</label>
                                <Input v-model.number="model.packSize" type="number" placeholder="12" clearable icon-pre="fa-solid fa-layer-group" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="relative bg-emerald-50/40 dark:bg-slate-900/40 rounded-[2.5rem] p-5 sm:p-8 border border-emerald-100 dark:border-slate-800 shadow-sm">
                <div class="absolute -top-3 left-6 px-4 py-1 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30">
                    <span class="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <i class="fa-solid fa-chart-line"></i> Narx siyosati
                    </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div class="price-card">
                        <label class="price-label">Kelish Narxi</label>
                        <Input v-model="model.costPrice" type="number" placeholder="0" suffix="UZS" clearable
                               class="!border-transparent" input-class="!text-lg font-bold text-slate-700 dark:text-white" />
                    </div>

                    <div class="price-card border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10 font-bold">
                        <label class="price-label !text-emerald-600">Ustama (%)</label>
                        <Input v-model="model.margainPercent" type="number" placeholder="0" suffix="%" clearable
                               class="!border-transparent" input-class="!text-xl font-black text-emerald-600 text-center" />
                    </div>

                    <div class="price-card border-emerald-500 ring-4 ring-emerald-500/10 bg-white dark:bg-slate-900 shadow-md">
                        <label class="price-label !text-emerald-700">Sotuv Narxi</label>
                        <Input v-model="model.salePrice" type="number" placeholder="0" suffix="UZS" clearable
                               :error="errors.salePrice" class="!border-transparent" 
                               input-class="!text-xl font-black text-emerald-700" />
                    </div>

                    <div class="price-card">
                        <label class="price-label">Dastlabki Qoldiq</label>
                        <Input v-model="model.totalStock" type="number" placeholder="0" clearable
                               :suffix="model.unit || 'ta'" class="!border-transparent" 
                               input-class="!text-lg font-bold text-indigo-600" />
                    </div>
                </div>

                <div class="mt-6">
                    <label class="form-label ml-2 text-slate-400">Izoh yoki tavsif</label>
                    <Input v-model="model.description" type="textarea" rows="2" clearable
                           placeholder="Mahsulot haqida qo'shimcha ma'lumotlar..." rounded="rounded-2xl" />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                <div v-if="model.salePrice > model.costPrice" 
                     class="flex items-center gap-3 px-5 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 w-full sm:w-auto">
                    <div class="p-2 bg-emerald-500 rounded-lg text-white"><i class="fa-solid fa-coins text-xs"></i></div>
                    <div>
                        <p class="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Sof Foyda</p>
                        <p class="text-sm font-black text-emerald-700 dark:text-emerald-400 leading-none">+{{ formatPrice(model.salePrice - model.costPrice) }}</p>
                    </div>
                </div>
                <div v-else class="hidden sm:block"></div>

                <div class="flex gap-3 w-full sm:w-auto">
                    <Button variant="danger" @click="handleClose" left-icon="fas fa-xmark" class="flex-1 sm:flex-none">Bekor qilish</Button>
                    <Button :variant="TitleAction.action === 'create' ? 'primary' : 'success'" @click="SaveProduct" 
                            left-icon="fas fa-check" class="flex-1 sm:flex-none shadow-lg shadow-indigo-500/20">
                        {{ TitleAction.action === "create" ? "Saqlash" : "Yangilash" }}
                    </Button>
                </div>
            </div>
        </template>
    </Modal>

    <Modal v-model="showImagePreview" title="Rasmni ko'rish" width="max-w-2xl" @close="showImagePreview = false">
        <div class="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-950 rounded-3xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
            <img v-if="previewImageUrl" :src="previewImageUrl" class="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl" alt="Preview" />
        </div>
    </Modal>
</template>

<style scoped>
.required::after { content: " *"; @apply text-rose-500 font-bold; }
.form-label { @apply block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-[1.5px] ml-1; }
.price-card { @apply p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all duration-300; }
.price-label { @apply block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1; }
:deep(.el-input__wrapper), :deep(.input-wrapper) { @apply shadow-none border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-2xl !important; }
</style>