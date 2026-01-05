<script setup>
import { ref, reactive, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { RawMaterialsStore } from "../../../stores/Supply/rawmaterial/rawmaterial.store";
import { useToast } from "../../../UI/utils/useToast";

// --- UI COMPONENTS ---
import Modal from "../../../UI/Modal.vue";
import Button from "../../../UI/Button.vue";
import Select from "../../../UI/Select.vue";
import Input from "../../../UI/Input.vue";
import FileUpload from "../../../UI/Upload.vue"; 

const { toast } = useToast();
const store = RawMaterialsStore();
const { isAddModalOpen, isSubmitting, selectedMaterial } = storeToRefs(store);

// --- OPTIONS ---
const typeOptions = [
    { id: "raw_milk", name: "🥛 Xom sut (Ferma)", group: "Raw", defaultUnit: "litr", prefix: "MILK", category:"Sut" },
    { id: "ingredient_dry", name: "🧂 Quruq ingredientlar", group: "Raw", defaultUnit: "kg", prefix: "DRY", category:"Ingridient (quruq)" },
    { id: "ingredient_liquid", name: "🧪 Suyuq qo'shimchalar", group: "Raw", defaultUnit: "litr", prefix: "LIQ", category:"Ingridient (suyuq)" },
    { id: "pkg_plastic", name: "🍼 Plastik idishlar (PET)", group: "Pkg", defaultUnit: "dona", prefix: "PET", category:"Pet idish" },
    { id: "pkg_cap", name: "🔘 Qopqoqlar va plombalar", group: "Pkg", defaultUnit: "dona", prefix: "CAP", category:"Qopqoq" },
    { id: "pkg_box", name: "📦 Karobka va yashiklar", group: "Pkg", defaultUnit: "dona", prefix: "BOX", category:"Yashik" },
    { id: "aux_cleaning", name: "🧼 Yuvish vositalari", group: "Aux", defaultUnit: "kg", prefix: "CLEAN", category:"Tozalash vositasi" },
];

const unitOptions = [
    { id: 'litr', name: 'Litr (l)' }, { id: 'kg', name: 'Kilogram (kg)' },
    { id: 'dona', name: 'Dona (pcs)' }, { id: 'metr', name: 'Metr (m)' }
];

const volumeUnitOptions = [
    { id: 'ml', name: 'Millilitr (ml)' },
    { id: 'L', name: 'Litr (L)' },
    { id: 'gr', name: 'Gram (gr)' },
    { id: 'kg', name: 'Kilogram (kg)' }
];

// --- 1. FORM STATE ---
const form = reactive({
    _id: null, type: null, name: "", code: "", unit: "kg", 
    costPrice: null, fatContent: null, density: null, 
    temperature: null, volume: null, volumeUnit: 'L', 
    totalStock: null, image: null, description: ""
});

const errors = reactive({});

// --- 2. ACTIONS & HELPERS ---
const resetForm = () => {
    Object.assign(form, {
        _id: null, type: null, name: "", code: "", unit: "kg", 
        costPrice: null, fatContent: null, density: null, 
        temperature: null, volume: null, volumeUnit: 'L', 
        totalStock: null, image: null, description: ""
    });
    Object.keys(errors).forEach(k => delete errors[k]);
};

const handleClose = () => { 
    store.closeAddModal(); 
    resetForm(); 
};

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// --- 3. WATCHERS ---
watch(selectedMaterial, (val) => {
    if (val) Object.assign(form, JSON.parse(JSON.stringify(val)));
    else resetForm();
}, { immediate: true });

watch(() => form.type, (newType) => {
    if (!form._id && newType) {
        const selected = typeOptions.find(t => t.id === newType);
        if (selected) {
            form.unit = selected.defaultUnit;
            const ts = new Date().getTime().toString().slice(-4);
            form.code = `${selected.prefix}-${ts}`;
            if (newType === 'raw_milk') { form.density = 1.030; form.temperature = 4; }
        }
    }
});

// --- 4. COMPUTED ---
const needsLabAnalysis = computed(() => ['raw_milk', 'ingredient_liquid'].includes(form.type));
const needsVolume = computed(() => ['pkg_plastic', 'pkg_cap', 'ingredient_liquid'].includes(form.type));

const formatPrice = (v) => new Intl.NumberFormat('uz-UZ', { 
    style: 'currency', currency: 'UZS', maximumFractionDigits: 0 
}).format(v || 0);

// --- 5. SUBMIT ---
const submitForm = async () => {
    errors.type = !form.type;
    errors.name = !form.name;
    errors.costPrice = !form.costPrice || form.costPrice <= 0;
    errors.totalStock = !form.totalStock || form.totalStock < 0;

    if (Object.values(errors).some(e => e)) {
        toast.warning("Majburiy maydonlarni to'ldiring!");
        return;
    }

    try {
        const payload = { ...form };
        if (form.image instanceof File) {
            payload.image = await fileToBase64(form.image);
        }
        const success = await store.saveRawMaterial(payload);
        if (success) handleClose();
    } catch (err) {
        toast.error("Saqlashda xatolik!");
    }
};
</script>

<template>
    <Modal v-model="isAddModalOpen" :title="form._id ? 'Tahrirlash' : 'Yangi Resurs Qo\'shish'" 
            icon="fa-solid fa-plus-circle" @close="handleClose" width="max-w-5xl">

        <div class="flex flex-col gap-y-7 pb-4">
            <div class="relative bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <div class="absolute -top-3 left-6 px-4 py-1 bg-indigo-600 rounded-full shadow-lg z-10">
                    <span class="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <i class="fa-solid fa-tag"></i> Asosiy ma'lumotlar
                    </span>
                </div>

                <div class="flex flex-col lg:flex-row gap-8 pt-2">
                    <div class="w-full lg:w-1/4 flex flex-col items-center">
                        <div class="w-full max-w-[200px] aspect-square relative group rounded-[2.5rem] overflow-hidden ring-4 ring-slate-50 shadow-xl">
                            <FileUpload v-model="form.image" type="image" />
                        </div>
                    </div>

                    <div class="w-full lg:w-3/4 space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div class="space-y-2">
                                <label class="form-label required">Katalog turi</label>
                                <Select v-model="form.type" :options="typeOptions" labelKey="name" valueKey="id" searchable :error="errors.type" />
                            </div>
                            <div class="space-y-2">
                                <label class="form-label">Shtrix Kod</label>
                                <Input v-model="form.code" placeholder="AUTO-GEN" />
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="form-label required">Nomi</label>
                            <Input v-model="form.name" :error="errors.name" placeholder="Mahsulot nomini kiriting" />
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div class="space-y-2">
                                <label class="form-label required">Birlik</label>
                                <Select v-model="form.unit" :options="unitOptions" labelKey="name" valueKey="id" />
                            </div>
                            <div class="space-y-2">
                                <label class="form-label required">Xarid Narxi</label>
                                <Input v-model.number="form.costPrice" type="number" suffix="UZS" :error="errors.costPrice" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Transition name="slide-fade">
                <div v-if="needsLabAnalysis" class="relative bg-amber-50/40 dark:bg-amber-900/10 rounded-[2.5rem] p-6 sm:p-8 border border-amber-100 dark:border-amber-900/30">
                    <div class="absolute -top-3 left-6 px-4 py-1 bg-amber-500 rounded-full shadow-lg z-10 text-[10px] font-black text-white uppercase tracking-widest">
                        🧪 Laboratoriya ko'rsatkichlari
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                        <div class="price-card">
                            <label class="price-label">Yog'lilik %</label>
                            <Input v-model.number="form.fatContent" type="number" step="0.1" class="!border-transparent" input-class="text-center text-2xl font-black text-amber-600" />
                        </div>
                        <div class="price-card">
                            <label class="price-label">Zichlik</label>
                            <Input v-model.number="form.density" type="number" step="0.001" class="!border-transparent" input-class="text-center text-2xl font-black text-amber-600" />
                        </div>
                        <div class="price-card">
                            <label class="price-label">Harorat</label>
                            <Input v-model.number="form.temperature" type="number" class="!border-transparent" input-class="text-center text-2xl font-black text-amber-600" />
                        </div>
                    </div>
                </div>
            </Transition>

            <Transition name="slide-fade">
                <div v-if="needsVolume" class="relative bg-blue-50/40 dark:bg-blue-900/10 rounded-[2.5rem] p-6 sm:p-8 border border-blue-100 dark:border-blue-900/30">
                    <div class="absolute -top-3 left-6 px-4 py-1 bg-blue-500 rounded-full shadow-lg z-10 text-[10px] font-black text-white uppercase tracking-widest">
                        <i class="fa-solid fa-box-open"></i> O'lcham va Hajm
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div class="price-card !bg-white dark:!bg-slate-800">
                            <label class="price-label">Netto Hajmi / Og'irligi</label>
                            <Input v-model.number="form.volume" type="number" step="0.01" class="!border-transparent" input-class="text-center text-2xl font-black text-blue-600 dark:text-blue-400" placeholder="0.00" />
                        </div>
                        <div class="price-card !bg-white dark:!bg-slate-800">
                            <label class="price-label">O'lchov Birligi</label>
                            <Select v-model="form.volumeUnit" :options="volumeUnitOptions" labelKey="name" valueKey="id" class="mt-1" />
                            <div class="text-center text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">
                                Tanlangan: {{ form.volume || 0 }} {{ form.volumeUnit }}
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>

            <div class="relative bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="md:col-span-2 space-y-2">
                        <label class="form-label">Izoh va qo'shimcha ma'lumotlar</label>
                        <Input v-model="form.description" type="textarea" rows="2" placeholder="Xomashyo haqida izoh..." />
                    </div>
                    <div class="price-card !bg-indigo-600 border-none shadow-xl shadow-indigo-200 dark:shadow-none">
                        <label class="price-label !text-indigo-100">Boshlang'ich Qoldiq</label>
                        <Input v-model.number="form.totalStock" type="number" :error="errors.totalStock" class="!border-transparent" input-class="text-center text-3xl font-black text-white placeholder-white/50" />
                        <div class="text-center text-[10px] text-indigo-200 font-bold uppercase mt-1">{{ form.unit }}</div>
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
                    <button @click="submitForm" :disabled="isSubmitting" 
                            class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-[1.2rem] px-10 py-3 shadow-lg shadow-indigo-200 dark:shadow-none font-black uppercase text-[11px] transition-all active:scale-95 flex items-center gap-2">
                        <i v-if="isSubmitting" class="fa-solid fa-circle-notch animate-spin"></i>
                        {{ form._id ? "O'zgarishlarni saqlash" : "Resursni Saqlash" }}
                    </button>
                </div>
            </div>
        </template>
    </Modal>
</template>

<style scoped>
.required::after { content: " *"; @apply text-rose-500 font-bold; }
.form-label { @apply block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1; }
.price-card { @apply p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-md; }
.price-label { @apply block text-[10px] font-black text-slate-400 uppercase text-center mb-1; }

.slide-fade-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-fade-leave-active { transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-15px); opacity: 0; }

:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
}
</style>