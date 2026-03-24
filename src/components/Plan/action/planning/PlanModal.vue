<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import {
  PlanActionPlanningStore,
  RawMaterialsStore,
  ProductsManagmentStore,
  AccessoriesStore,
  UserStore,
} from "../../../../stores/index.store";
import { Button, Select, Modal, Input } from "../../../../UI/UI";
import BaseTabs from "../../../../UI/BaseTabs.vue";

const store_plan = PlanActionPlanningStore();
const store_raw = RawMaterialsStore();
const store_pro = ProductsManagmentStore();
const store_acc = AccessoriesStore();
const store_user = UserStore();
const { isModal, modal } = storeToRefs(store_plan);
const { materials } = storeToRefs(store_raw);
const { products } = storeToRefs(store_pro);
const { accessories } = storeToRefs(store_acc);
// 1. Jami Xomashyo (Litr)
const totalMilkOverall = computed(() =>
  modal.value.model.batches.reduce(
    (sum, b) => sum + (Number(b.milkAmount) || 0),
    0,
  ),
);

// 2. Jami Tayyor Mahsulot (Kg/L)
const totalFinishedProducts = computed(() => {
  return modal.value.model.batches.reduce((total, batch) => {
    const batchTotal = batch.outputs.reduce(
      (sum, out) => sum + (Number(out.amount) || 0),
      0,
    );
    return total + batchTotal;
  }, 0);
});

// 3. O'rtacha Unumdorlik (Yield %)
const averageYield = computed(() => {
  const totalMilk = totalMilkOverall.value;
  if (totalMilk === 0) return 0;

  const netMilk = modal.value.model.batches.reduce((sum, b) => {
    const loss = Number(b.lossCoefficient) || 0;
    return sum + Number(b.milkAmount) * (1 - loss / 100);
  }, 0);

  if (netMilk === 0) return 0;
  return ((totalFinishedProducts.value / netMilk) * 100).toFixed(1);
});

// Har bir partiya uchun alohida analiz funksiyasi
const getBatchAnalysis = (batch) => {
  const milk = Number(batch.milkAmount) || 0;
  const loss = Number(batch.lossCoefficient) || 0;
  const netMilk = milk * (1 - loss / 100);
  const totalProduced = batch.outputs.reduce(
    (sum, out) => sum + (Number(out.amount) || 0),
    0,
  );
  const usagePercent = netMilk > 0 ? (totalProduced / netMilk) * 100 : 0;

  let color = "#6366f1"; // Indigo (Normal)
  if (usagePercent > 100.1)
    color = "#ef4444"; // Red (Xato/Oshib ketgan)
  else if (usagePercent > 95) color = "#10b981"; // Green (Yuqori samaradorlik)

  return {
    isOver: usagePercent > 100.1,
    color,
    usagePercent: usagePercent.toFixed(1),
  };
};
// --- METHODS ---
const addAccessory = (batch) =>
  batch.accessories.push({ name: "", quantity: 0 });
const removeAccessory = (batch, idx) => batch.accessories.splice(idx, 1);
const addCost = (batch) =>
  batch.additionalCosts.push({ description: "", amount: 0 });
const removeCost = (batch, idx) => batch.additionalCosts.splice(idx, 1);

const savePlan = async () => {
  // Save logic implementation
};
// Mahsulot uchun qadoqni tanlaganda yoki miqdor o'zgarganda hisoblash
const updatePackageQty = (out) => {
  if (out.packageType && out.packageCapacity > 0) {
    // Masalan: 100kg smetana / 0.5kg (idish hajmi) = 200 dona
    out.packageQty = Math.ceil(out.amount / out.packageCapacity);
  }
};

// Qadoq turlari ro'yxati (Buni backend-dan ham olishingiz mumkin)
const packagingOptions = [
  { id: "b05", name: "Bankacha 0.5 kg", capacity: 0.5, unit: "kg" },
  { id: "b1", name: "Bankacha 1.0 kg", capacity: 1, unit: "kg" },
  { id: "ch5", name: "Chelak 5 kg", capacity: 5, unit: "kg" },
  { id: "p1", name: "Paket 1 L", capacity: 1, unit: "L" },
];

// Qadoq qo'shish funksiyasi
const addPackaging = (out) => {
  if (!out.packagings) out.packagings = [];
  out.packagings.push({
    typeId: null,
    amountToPack: 0, // Shu qadoqqa necha kg/l ketishi
    count: 0, // Necha dona idish chiqishi
  });
};

// Qadoq hisob-kitobi (Miqdor o'zgarganda)
const calculatePackageCount = (pkg) => {
  const selectedType = packagingOptions.find((opt) => opt.id === pkg.typeId);
  if (selectedType && pkg.amountToPack > 0) {
    pkg.count = Math.ceil(pkg.amountToPack / selectedType.capacity);
  } else {
    pkg.count = 0;
  }
};

// Mahsulotning qadoqlanmagan qoldig'ini hisoblash
const getUnpackedRemainder = (out) => {
  const packedTotal =
    out.packagings?.reduce(
      (sum, p) => sum + (Number(p.amountToPack) || 0),
      0,
    ) || 0;
  return (out.amount - packedTotal).toFixed(2);
};

// Jami ko'rsatkichlar tahlili
const headerStats = computed(() => {
  const batches = modal.value.model.batches;

  return batches.reduce(
    (acc, b) => {
      const milk = Number(b.milkAmount) || 0;
      const density = Number(b.density) || 1.028;
      const loss = Number(b.lossCoefficient) || 0;
      const products = b.outputs.reduce(
        (s, o) => s + (Number(o.amount) || 0),
        0,
      );
      const costs =
        b.additionalCosts?.reduce((s, c) => s + (Number(c.amount) || 0), 0) ||
        0;

      acc.totalMilk += milk;
      acc.totalNetWeightKg += milk * density * (1 - loss / 100);
      acc.totalFinished += products;
      acc.totalCosts += costs;
      return acc;
    },
    { totalMilk: 0, totalNetWeightKg: 0, totalFinished: 0, totalCosts: 0 },
  );
});

// O'rtacha samaradorlik (Sof xomashyoga nisbatan)
const totalEfficiency = computed(() => {
  if (headerStats.value.totalNetWeightKg === 0) return 0;
  return (
    (headerStats.value.totalFinished / headerStats.value.totalNetWeightKg) *
    100
  ).toFixed(1);
});

// Xarajat turlari
const costTypeOptions = [
  { id: "energy", name: "Elektr energiyasi" },
  { id: "labor", name: "Ish haqi (Mavsumiy)" },
  { id: "logistic", name: "Transport xarajati" },
  { id: "other", name: "Boshqa xarajatlar" },
];

// Selectdan tanlanganda aksessuar nomini ham saqlab ketish (agar kerak bo'lsa)
const updateAccessoryInfo = (acc, selectedId) => {
  const selected = accessoryOptions.find((opt) => opt.id === selectedId);
  if (selected) {
    acc.name = selected.name;
  }
};
const handlingMaterialInfo = (acc, selectedId) => {
  const selected = accessoryOptions.find((opt) => opt.id === selectedId);
  if (selected) {
    acc.name = selected.name;
  }
};
const searchQuery = ref("");

// Filtrlangan mahsulotlar ro'yxati
const filteredProducts = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return store_pro.products;

  return store_pro.products.filter((product) =>
    product.name.toLowerCase().includes(query),
  );
});
const removeBatch = (index) => {
  const batch = modal.value.model.batches[index];
  
  // Agar partiyada sut miqdori yoki mahsulotlar kiritilgan bo'lsa, ogohlantirish
  const hasData = batch.milkAmount > 0 || batch.outputs.some(o => o.amount > 0);
  
  if (hasData) {
    if (confirm("Ushbu partiyada ma'lumotlar bor. Haqiqatdan ham o'chirmoqchimisiz?")) {
      modal.value.model.batches.splice(index, 1);
    }
  } else {
    // Bo'sh bo'lsa so'rashsiz o'chirib yuboraveradi
    modal.value.model.batches.splice(index, 1);
  }
};
watch(
  isModal,
  async (newValue) => {
    if (newValue) {
      // Agar modal ochilsa (true bo'lsa)
      try {
        await store_raw.GetAll();
        await store_pro.GetAll();
        await store_acc.GetAll();
        await store_user.GetUsers();
        console.log("Xomashyolar muvaffaqiyatli yuklandi");
      } catch (error) {
        console.error("Xomashyolarni yuklashda xatolik:", error);
      }
    }
  },
  { immediate: true },
); // Agar komponent yuklanganda modal ochiq bo'lsa ham ishlaydi

const getBatchCalculations = (batch) => {
  console.log(batch)
  // MUHIM: Agar batch kelmagan bo'lsa yoki bo'sh bo'lsa, xato bermasligi uchun tekshiramiz
  if (!batch) return { 
    totalBatchCost: 0, 
    totalProfit: 0, 
    finalResults: [], 
    roi: 0 
  };

  // 1. Xomashyo (Sut) xarajati - optional chaining (?.) va default qiymat bilan
  const rawPrice = batch?.rawPrice || 4000; 
  const rawMaterialCost = (Number(12) || 0) * rawPrice;

  // 2. Qadoq xarajatlari
  const packagingCost = store_pro.products?.reduce((total, prod) => {
    const prodPkgCost = (prod.packagings || []).reduce((pAcc, pkg) => {
      const pkgType = packagingOptions.find(o => o.id === pkg.typeId);
      return pAcc + (Number(pkg.count || 0) * (pkgType?.price || 0));
    }, 0);
    return total + prodPkgCost;
  }, 0) || 0;

  // 3. Aksessuarlar xarajati
  const accessoryCost = (batch?.accessories || []).reduce((acc, item) => {
    const accItem = store_acc.materials?.find(m => m.id === item.id);
    return acc + (Number(item.quantity || 0) * (accItem?.price || 0));
  }, 0) || 0;

  // 4. Qo'shimcha xarajatlar
  const additionalCost = (batch?.additionalCosts || []).reduce((acc, item) => acc + (Number(item.amount || 0)), 0) || 0;

  // JAMI XARAJAT
  const totalBatchCost = rawMaterialCost + packagingCost + accessoryCost + additionalCost;

  // 5. Sotuv qiymati
  let totalSalesValue = 0;
  const analyzedProducts = store_pro.products?.map(prod => {
    const salesPrice = prod.price || 0; 
    const currentAmount = Number(prod.amount) || 0;
    const salesValue = currentAmount * salesPrice;
    totalSalesValue += salesValue;
    return { ...prod, salesValue, salesPrice, currentAmount };
  }) || [];

  // 6. Tan narx taqsimoti
  const costRatio = totalSalesValue > 0 ? totalBatchCost / totalSalesValue : 0;
  
  const finalResults = analyzedProducts.map(p => ({
    ...p,
    calculatedCost: p.currentAmount > 0 ? (p.salesValue * costRatio) / p.currentAmount : 0,
    profit: p.salesValue - (p.salesValue * costRatio)
  }));

  return {
    rawMaterialCost,
    packagingCost,
    accessoryCost,
    additionalCost,
    totalBatchCost,
    totalSalesValue,
    totalProfit: totalSalesValue - totalBatchCost,
    finalResults,
    roi: totalBatchCost > 0 ? (((totalSalesValue - totalBatchCost) / totalBatchCost) * 100).toFixed(1) : 0
  };
};
</script>

<template>
  <Modal
    v-model="isModal"
    title="Ishlab chiqarish kunlik rejalashtirish"
    icon="fa-solid fa-calculator"
    width="max-w-[1450px]"
  >
  <div class="sticky  z-40 w-full bg-white/60 dark:bg-slate-900 border mb-2  rounded-xl backdrop-blur-xl border-b border-slate-200/40 dark:border-slate-800/40">
  <div class="max-w-[1600px] mx-auto px-2 py-2">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
      <div class="flex items-center flex-wrap gap-6">
        <div class="flex items-center gap-4 group">
      
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Partiyalar</span>
            <span class="text-xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
              {{ modal.model.batches.length }}
            </span>
          </div>
        </div>

        <div class="hidden lg:block h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

        <div class="flex items-center gap-8">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Xomashyo</span>
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
                {{ headerStats.totalMilk.toLocaleString() }}
              </span>
              <span class="text-[10px] font-bold text-slate-400">L</span>
            </div>
          </div>

          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tayyor</span>
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-extrabold text-emerald-600 dark:text-emerald-500 tabular-nums">
                {{ headerStats.totalFinished.toLocaleString() }}
              </span>
              <span class="text-[10px] font-bold text-slate-400">KG</span>
            </div>
          </div>
 <div class="hidden xl:flex flex-col items-end">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Xarajatlar</span>
          <div class="flex items-center gap-1.5">
            <span class="text-base font-black text-slate-900 dark:text-white tabular-nums">
              {{ headerStats.totalCosts.toLocaleString() }}
            </span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 uppercase">UZS</span>
          </div>
        </div>
          <div 
            class="px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center min-w-[80px]"
            :class="Number(totalEfficiency) > 100 
              ? 'bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20' 
              : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800'"
          >
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-none mb-0.5">Samaradorlik</span>
            <span 
              class="text-sm font-black tabular-nums"
              :class="Number(totalEfficiency) > 100 ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'"
            >
              {{ totalEfficiency }}%
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 lg:gap-6">
        <div class="w-96 group/select">
          <Select
          clearable
            multiple
            searchable
            v-model="modal.model.responsiblePerson"
            :options="store_user.items"
            labelKey="fullname"
            valueKey="_id"
            placeholder="Mas'ul bo'limlar"
            size="middle"
            class="!rounded-xl !bg-slate-50 dark:!bg-slate-800/50 !border-slate-200 dark:!border-slate-800 transition-all focus-within:!ring-2 ring-indigo-500/20"
            icon-pre="fa-solid fa-users-gear text-slate-400"
          />
        </div>

       

        <button
          @click="store_plan.addNewBatch()"
          class="h-[48px] px-6 flex items-center gap-3 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-slate-200 dark:shadow-indigo-900/20 transition-all active:scale-95"
        >
          <span class="text-xs font-black uppercase tracking-[0.05em]">Yangi Partiya</span>
          <div class="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
            <i class="fa-solid fa-plus text-[10px]"></i>
          </div>
        </button>
      </div>

    </div>
  </div>
</div>
<div class="col-span-12 border border-slate-100 dark:border-slate-800 rounded-xl mb-1 bg-slate-100/50 dark:bg-slate-900/40 p-6">
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
    
    <div class="space-y-3">
      <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Xarajatlar strukturasi</h4>
      <div class="space-y-2">
        <div class="flex justify-between text-xs font-medium">
          <span class="text-slate-500">Xomashyo (Sut):</span>
          <span class="font-bold tabular-nums text-slate-700 dark:text-slate-300">
            {{ getBatchCalculations(batch).rawMaterialCost?.toLocaleString() || 0}} UZS
          </span>
        </div>
       <div class="flex justify-between text-xs">
  <span class="text-slate-500">Qadoq & Aksessuar:</span>
  <span class="font-bold tabular-nums">
    {{ ((getBatchCalculations(batch).packagingCost || 0) + 
        (getBatchCalculations(batch).accessoryCost || 0) + 
        (getBatchCalculations(batch).additionalCost || 0)).toLocaleString() }} UZS
  </span>
</div>
    <div class="flex justify-between text-xs">
  <span class="text-slate-500">Qo'shimcha xarajat:</span>
  <span class="font-bold tabular-nums">
    {{ ((getBatchCalculations(batch).packagingCost || 0) + 
        (getBatchCalculations(batch).accessoryCost || 0) + 
        (getBatchCalculations(batch).additionalCost || 0)).toLocaleString() }} UZS
  </span>
</div>
        <div class="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
        <div class="flex justify-between text-sm">
          <span class="font-black text-slate-700 dark:text-slate-300 uppercase text-[10px]">Jami Tan Narx:</span>
          <span class="font-black text-rose-500 tabular-nums">
            {{ getBatchCalculations(batch).totalBatchCost?.toLocaleString() }} UZS
          </span>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
      <h4 class="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-3 italic">Tan Narx Taqsimoti</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div v-for="p in getBatchCalculations(batch).finalResults.filter(x => x.currentAmount > 0)" :key="p._id" 
             class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all hover:border-indigo-200">
          <div class="overflow-hidden mr-2">
            <p class="text-[9px] font-bold text-slate-500 uppercase truncate">{{ p.name }}</p>
            <p class="text-xs font-extrabold text-emerald-600 tabular-nums">
              {{ Math.round(p.calculatedCost).toLocaleString() }} 
              <span class="text-[8px] text-slate-400 font-normal">UZS / {{p.unit}}</span>
            </p>
          </div>
          <div class="text-right border-l pl-3 border-slate-200 dark:border-slate-800">
            <p class="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Foyda</p>
            <p class="text-[10px] font-black text-indigo-500 tabular-nums">
              +{{ Math.round(p.profit).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
      <div v-if="getBatchCalculations(batch).finalResults.filter(x => x.currentAmount > 0).length === 0" class="flex items-center justify-center py-4 text-[10px] font-bold text-slate-400 uppercase italic">
        Ma'lumotlar hisoblanmoqda...
      </div>
    </div>

    <div class="flex flex-col justify-center items-end space-y-3">
      <div class="text-right">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partiya Sof Foydasi</span>
        <h2 class="text-3xl font-black text-emerald-500 tabular-nums leading-none flex items-baseline justify-end gap-1">
          <span class="text-lg">+</span>{{ getBatchCalculations(batch).totalProfit?.toLocaleString() }}
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-normal">uzs</span>
        </h2>
      </div>
      <div class="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-2">
        <span class="text-[10px] font-black uppercase tracking-tighter">Rentabellik (ROI):</span>
        <span class="text-sm font-black tabular-nums">{{ getBatchCalculations(batch).roi }}%</span>
      </div>
    </div>

  </div>
</div>
    <div
      v-for="(batch, index) in modal.model.batches"
      :key="batch.id"
      class="bg-white dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-6"
    >
      <div class="grid grid-cols-12">
        <div
          class="col-span-12 lg:col-span-2 p-6 bg-blue-500/5 dark:bg-indigo-300/5 border-r border-slate-100 dark:border-slate-800 h-[480px] flex flex-col"
        >
          <div class="flex items-center gap-3 mb-6">
            <span
              class="w-8 h-8 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg italic"
              >#{{ index + 1 }}</span
            >
            <h3
              class="text-[10px] font-black text-slate-500 uppercase tracking-widest"
            >
              Xomashyo
            </h3>
          </div>
          <div class="space-y-4 flex-1">
            <Select
              searchable
              v-model="acc"
              :options="store_raw.materials"
              labelKey="name"
              valueKey=""
              placeholder="Xomashyo tanlang..."
              @change="(val) => handlingMaterialInfo(acc, val)"
              clearable
            />
            <Input
              v-model.number="batch.milkAmount"
              type="number"
              label="Sut miqdori"
              suffix="L"
              size="small"
              clearable
            />
            <div class="grid grid-cols-1 gap-3">
             
              <Input
                v-model.number="batch.lossCoefficient"
                type="number"
                label="Yo'qotish"
                suffix="%"
                size="small"
                clearable
              />
               <Input
                v-model.number="batch.fatContent"
                type="number"
                label="Yog'lilik"
                suffix="%"
                size="small"
                clearable
                disabled
              />
            </div>
            <div
              class="mt-6 p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800"
            >
              <div class="flex justify-between items-baseline mb-2">
                <span class="text-[9px] font-black text-slate-400 uppercase"
                  >Samaradorlik</span
                >
                <span
                  class="text-xs font-black tabular-nums"
                  :style="{ color: getBatchAnalysis(batch).color }"
                  >{{ getBatchAnalysis(batch).usagePercent }}%</span
                >
              </div>
              <div
                class="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
              >
                <div
                  class="h-full transition-all duration-1000"
                  :style="{
                    width:
                      Math.min(getBatchAnalysis(batch).usagePercent, 100) + '%',
                    backgroundColor: getBatchAnalysis(batch).color,
                  }"
                ></div>
              </div>
            </div>
            
          </div>
        </div>

        <div
          class="col-span-12 lg:col-span-4 p-6 border-r border-slate-100 dark:border-slate-800 dark:bg-indigo-500/5 flex flex-col h-[480px]"
        >
          <div class="flex items-center justify-between mb-2 px-1">
            <h6
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"
            >
              <i class="fa-solid fa-boxes-stacked text-indigo-500"></i>
              Mahsulotlar
            </h6>
            <span class="text-[10px] font-bold text-slate-400"
              >{{ filteredProducts.length }} ta</span
            >
          </div>
          <div class="">
            <Input
              v-model="searchQuery"
              placeholder="Mahsulot nomini yozing..."
              size="small"
              clearable
            >
              <template #prefix>
                <i
                  class="fa-solid fa-magnifying-glass text-slate-400 text-xs"
                ></i>
              </template>
            </Input>
          </div>
          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            <div
              v-for="out in store_pro.products"
              :key="out._id"
              class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <Input
                v-model.number="out.amount"
                type="number"
                :label="out.name"
                :suffix="out.unit"
                size="small"
                class="!font-black "
                clearable
              />
              <div class="space-y-3">
                <div
                  v-for="(pkg, pIdx) in out.packagings"
                  :key="pIdx"
                  class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 relative group/pkg"
                >
                  <Select
                    v-model="pkg.typeId"
                    :options="packagingOptions"
                    labelKey="name"
                    valueKey="id"
                    placeholder="Qadoqni tanlang"
                    size="small"
                    @change="calculatePackageCount(pkg)"
                    clearable
                  />
                  <div class="grid grid-cols-2 gap-3 mt-2">
                    <Input
                      v-model.number="pkg.amountToPack"
                      @input="calculatePackageCount(pkg)"
                      type="number"
                      label="Hajm"
                      :suffix="out.unit"
                      size="small"
                      clearable
                    />
                    <Input
                      v-model.number="pkg.count"
                      type="number"
                      label="Soni"
                      suffix="dona"
                      size="small"
                      readonly
                      class="!bg-indigo-50/30 dark:!bg-indigo-900/10"
                      clearable
                    />
                  </div>
                  <button
                    @click="out.packagings.splice(pIdx, 1)"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-800 text-rose-500 rounded-full shadow-sm opacity-0 group-hover/pkg:opacity-100 transition-all flex items-center justify-center hover:bg-rose-500 hover:text-white"
                  >
                    <i class="fa-solid fa-xmark text-[10px]"></i>
                  </button>
                </div>
                <button
                  @click="addPackaging(out)"
                  class="text-[9px] font-black text-indigo-600 uppercase flex items-center gap-1 hover:bg-indigo-50 p-2 rounded-lg transition-all"
                >
                  <i class="fa-solid fa-plus-circle"></i> Qadoq qo'shish
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          class="col-span-12 lg:col-span-3 p-3 border-r border-slate-100 dark:border-slate-800 flex flex-col h-[480px] bg-blue-500/5 dark:bg-indigo-"
        >
          <div class="flex justify-between items-center mb-2 px-1">
            <div class="flex flex-col">
              <h6
                class="text-[10px] font-black text-slate-500 uppercase tracking-widest"
              >
                Aksessuarlar
              </h6>
               <span class="text-[8px] text-slate-400 font-bold italic"
                >Tannarxga ta'sir qiladi</span>
            </div>
            <button
              @click="addAccessory(batch)"
              class="w-7 h-7 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
            >
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
  
  <template v-if="batch.accessories && batch.accessories.length > 0">
    <div
      v-for="(acc, aIdx) in batch.accessories"
      :key="aIdx"
      class="group/item bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative hover:border-indigo-300 transition-all shadow-sm"
    >
      <div class="flex flex-col gap-2">
        <Select
          searchable
          v-model="acc.id"
          :options="store_acc.materials"
          labelKey="name"
          valueKey="id"
          placeholder="Tanlang..."
          size="small"
          @change="(val) => updateAccessoryInfo(acc, val)"
          clearable
        />
        <Input
          v-model.number="acc.quantity"
          type="number"
          placeholder="Soni"
          suffix="dona"
          size="small"
          clearable
        />
      </div>
      <button
        @click="removeAccessory(batch, aIdx)"
        class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full opacity-0 group-hover/item:opacity-100 transition-all flex items-center justify-center shadow-lg z-10"
      >
        <i class="fa-solid fa-xmark text-[10px]"></i>
      </button>
    </div>
  </template>

  <div v-else class="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/20">
    <div class="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-3">
      <i class="fa-solid fa-tags text-slate-300 dark:text-slate-600 text-xl"></i>
    </div>
    <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
      Aksessuarlar qo'shilmagan
    </p>
    <p class="text-[10px] text-slate-400 mt-1 text-center">
      Zarur bo'lsa tepadagi plus tugma orqali qo'shing!
    </p>
  </div>

</div>
        </div>

        <div
          class="col-span-12 lg:col-span-3 p-2 flex flex-col h-[480px] bg-rose-50/10 dark:bg-rose-900/5"
        >
          <div class="flex justify-between items-center mb-2 px-1">
            <div class="flex flex-col">
              <h6
                class="text-[10px] font-black text-rose-500 uppercase tracking-widest"
              >
                Xarajatlar
              </h6>
              <span class="text-[8px] text-slate-400 font-bold italic"
                >Tannarxga ta'sir qiladi</span
              >
            </div>
            <button
              @click="addCost(batch)"
              class="w-7 h-7 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
            >
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>
        <div class="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
  
  <template v-if="batch.additionalCosts && batch.additionalCosts.length > 0">
    <div
      v-for="(cost, cIdx) in batch.additionalCosts"
      :key="cIdx"
      class="group/cost bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative hover:border-rose-300 transition-all shadow-sm"
    >
      <div class="space-y-2">
        <Select
          searchable
          v-model="cost.typeId"
          :options="costTypeOptions"
          labelKey="name"
          valueKey="id"
          placeholder="Xarajat turi"
          size="small"
          clearable
        />
        <Input
          v-model.number="cost.amount"
          type="number"
          placeholder="Summa"
          suffix="UZS"
          size="small"
          class="text-rose-600 font-black"
          clearable
        />
      </div>
      <button
        @click="removeCost(batch, cIdx)"
        class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full opacity-0 group-hover/cost:opacity-100 transition-all flex items-center justify-center shadow-lg z-10"
      >
        <i class="fa-solid fa-xmark text-[10px]"></i>
      </button>
    </div>
  </template>

  <div v-else class="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] bg-slate-50/30 dark:bg-slate-900/10">
    <div class="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-3">
      <i class="fa-solid fa-receipt text-slate-300 dark:text-slate-600 text-xl"></i>
    </div>
    <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
      Qo'shimcha xarajat yo'q
    </p>
    <p class="text-[10px] text-slate-400 mt-1 text-center">
      Zarur bo'lsa, tepadagi plus tugmasi orqali qo'shing!
    </p>
  </div>

</div>
        </div>
      </div>
       <div class="flex items-center justify-between dark:bg-transparent bg-blue-500/5">
  <div class="flex items-center gap-3">   
  </div>
  <button 
    @click="removeBatch(index)"
    class="group flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-300"
    title="Partiyani o'chirish"
  >
    <span class="text-[9px] font-black text-slate-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Partiyani o'chirish</span>
    <div class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500 group-hover:bg-rose-500 group-hover:text-white text-white transition-all">
      <i class="fa-solid fa-trash-can text-xs"></i>
    </div>
  </button>
</div>
    </div>

    <template #footer>
      <div
        class="w-full bg-transparent dark:bg-transparent px-4 py-1 rounded border-slate-100 flex items-center justify-between"
      >
        <div>
          <!-- <Select 
            v-model="modal.model.responsiblePerson" 
            :options="operators" 
            labelKey="name" 
            valueKey="id" 
            placeholder="Mas'ul texnologni tanlang" 
            size="middle"
            icon-pre="fa-solid fa-user-tie"
          /> -->
        </div>

        <div class="flex items-center gap-2">
          <Button
            left-icon="fa-solid fa-xmark mr-2"
            size="sm"
            @click="savePlan"
            variant="danger"
            class="!px-12 !text-sm font-black tracking-[0.2em] shadow-indigo-500/30 active:scale-95 transition-all"
          >
            Bekor qilish
          </Button>
          <Button
            left-icon="fa-solid fa-check mr-2"
            size="sm"
            @click="savePlan"
            variant="primary"
            class="!px-12 !text-sm font-black tracking-[0.2em] shadow-indigo-500/30 active:scale-95 transition-all"
          >
            Saqlash
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
/* Custom Scrollbar Logic */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}

/* Modal ichidagi sticky header effekti uchun */
.sticky {
  position: sticky;
  top: -34px; /* Modal paddingiga moslangan */
  z-index: 30;
}

/* Inputlarni "ERP" ko'rinishiga keltirish */
:deep(.border-none input) {
  padding-left: 0 !important;
  font-weight: 600;
  background-color: transparent !important;
}

/* Italics olib tashlash (Professional ko'rinish uchun) */
.font-not-italic {
  font-style: normal !important;
}
/* Scrollbar kengligi */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px; /* Scrollbar juda ingichka bo'lsin */
  height: 5px;
}

/* Scrollbar yo'li (track) */
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

/* Scrollbarning harakatlanuvchi qismi (thumb) */
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; /* Slate-300 rang (Light mode uchun) */
  border-radius: 10px;
  transition: all 0.3s ease;
}

/* Dark mode uchun thumb rangi */
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569; /* Slate-600 rang (Dark mode uchun) */
}

/* Sichqoncha ustiga kelganda (Hover) */
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6366f1; /* Indigo-500 */
}
</style>
