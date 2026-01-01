import { defineStore } from "pinia";
import { RawMaterialService } from "../../../ApiServices/Supply/rawmaterial/rawmaterial.service";
import { useToast } from "../../../UI/utils/useToast";

const { toast } = useToast();

export const RawMaterialsStore = defineStore('RawMaterialsStore', {
  state: () => ({
    materials: [],
    loading: false,
    isSubmitting: false, 
    
    // Modallar holati
    isAddModalOpen: false,
    isEditModalOpen: false,
    isDetailModalOpen: false,
    
    // Tanlangan ma'lumot
    selectedMaterial: null,
  }),

  getters: {
    // Xomashyo analitikasi - hisob-kitoblar dinamik amalga oshiriladi
    analytics: (state) => {
      const all = state.materials || [];
      const totalVolume = all.reduce((acc, item) => acc + Number(item.totalStock || 0), 0);
      const totalValue = all.reduce((acc, item) => acc + (Number(item.totalStock || 0) * Number(item.costPrice || 0)), 0);
      const lowStockCount = all.filter(item => Number(item.totalStock || 0) < 50).length;
      
      const avgFat = all.length > 0 
        ? (all.reduce((acc, item) => acc + Number(item.fatContent || 0), 0) / all.length).toFixed(1) 
        : 0;

      return { 
        totalVolume, 
        totalValue, 
        lowStockCount, 
        count: all.length,
        avgFat 
      };
    }
  },

  actions: {
    // --- MODALLARNI BOSHQARISH ---
    openAddModal() {
      this.selectedMaterial = null; // Yaratishda formani tozalash uchun
      this.isAddModalOpen = true;
    },
    closeAddModal() {
      this.isAddModalOpen = false;
    },
    openEditModal(id) {
      // Id bo'yicha topamiz yoki obyektni o'zini qabul qilamiz
      const material = this.materials.find(m => m._id === id);
      if (material) {
        this.selectedMaterial = JSON.parse(JSON.stringify(material)); // Deep copy - originalga tegmaslik uchun
        this.isEditModalOpen = true;
      }
    },
    closeEditModal() {
      this.isEditModalOpen = false;
      this.selectedMaterial = null;
    },

    // --- MA'LUMOTLARNI YUKLASH ---
    async GetAll() {
      this.loading = true;
      try {
        const response = await RawMaterialService.GetAll();
        if (response.data?.success) {
          this.materials = response.data.data;
          
        }
      } catch (error) {
        toast.error("Xomashyolarni yuklashda xatolik yuz berdi!");
      } finally {
        this.loading = false;
      }
    },

    async GetById(id) {
      this.loading = true;
      try {
        const response = await RawMaterialService.GetById(id);
        if (response.data?.success) {
          this.selectedMaterial = response.data.data;
          this.isDetailModalOpen = true;
        }
      } catch (error) {
        toast.error("Ma'lumot topilmadi!");
      } finally {
        this.loading = false;
      }
    },

    // --- ASOSIY SAQLASH MANTIQI (BACKEND SAVE FUNKSIYASIGA MOS) ---
    async saveRawMaterial(modelData) {
      this.isSubmitting = true;
      try {
        // Backenddagi Save(data) mantiqiga mos payload tayyorlaymiz
        const payload = {
          action: modelData._id ? "update" : "create",
          model: modelData
        };

        const response = await RawMaterialService.Create(payload); // RawMaterialService.Create aslida Save'ni chaqiradi
        
        if (response.data?.status === "200") {
          toast.success(response.data.msg || "Muvaffaqiyatli bajarildi!");
          await this.GetAll(); // Ro'yxatni yangilash
          return true;
        } else {
          toast.error(response.data?.msg || "Xatolik yuz berdi");
          return false;
        }
      } catch (error) {
        const errorMsg = error.response?.data?.msg || "Saqlashda texnik xatolik!";
        toast.error(errorMsg);
        return false;
      } finally {
        this.isSubmitting = false;
      }
    },

    async DeleteById(id) {
      if (!confirm("Ushbu xomashyoni o'chirishni tasdiqlaysizmi?")) return;
      
      try {
        const response = await RawMaterialService.DeleteById(id);
        if (response.data?.success) {
          toast.success("Xomashyo muvaffaqiyatli o'chirildi");
          this.materials = this.materials.filter(m => m._id !== id);
          return true;
        }
      } catch (error) {
        toast.error("O'chirishda xatolik yuz berdi");
        return false;
      }
    },

    async handleExcelExport(payload) {
      try {
        const response = await RawMaterialService.ExportExcel(payload);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Xomashyo_Hisoboti_${new Date().toLocaleDateString()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        toast.success("Excel fayl yuklab olindi!");
      } catch (error) {
        toast.error("Eksport qilishda xatolik!");
      }
    }
  }
});