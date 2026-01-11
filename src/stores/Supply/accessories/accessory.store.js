import { defineStore } from "pinia";
import { AccessoriesService } from "../../../ApiServices/Supply/accessories/accessory.service";
import { useToast } from "../../../UI/utils/useToast";
import { Loading } from "../../../utils/Loading";
const loading = Loading();

const { toast } = useToast();

export const AccessoriesStore = defineStore('AccessoriesStore', {
  state: () => ({
    materials: [],
    loading: false,
    isSubmitting: false, 
    isAddModalOpen: false,
    selectedMaterial: null, // Tahrirlash uchun tanlangan obyekt
  }),

  actions: {
    // 1. Ma'lumotlarni o'qib olish (Hammasini yuklash)
    async GetAll() {
     const loader = loading.show();
      try {
        const response = await AccessoriesService.GetAll();
        // Backend { success: true, data: [...] } qaytarsa
        if (response.data?.success) {
          this.materials = response.data.data;
        }
      } catch (error) {
        toast.error("Ma'lumotlarni yuklashda texnik xatolik!");
        console.error("GetAll Error:", error);
      } finally {
               loader.hide();

      }
    },

    /**
     * 2. Yaratish va Tahrirlash (Base64 mantiqi bilan)
     * @param {Object} rawData - Komponentdan kelayotgan model (ichida base64 string rasm bilan)
     */
    async saveRawMaterial(rawData) {
      this.isSubmitting = true;
      try {
        // Backend andozasiga muvofiq payload tayyorlaymiz
        const payload = {
          action: rawData._id ? "update" : "create",
          model: rawData
        };

        const response = await AccessoriesService.Create(payload); 
        
        // Status 200 yoki 201 bo'lsa muvaffaqiyatli deb hisoblaymiz
        if (response.data?.success || response.data?.status === "200") {
          toast.success(response.data.message || response.data.msg || "Muvaffaqiyatli saqlandi!");
          
          await this.GetAll(); // Ro'yxatni yangilash
          return true;
        } else {
          // Backenddan kelgan mantiqiy xato xabari
          toast.error(response.data?.message || response.data?.msg || "Xatolik yuz berdi");
          return false;
        }
      } catch (error) {
        // HTTP xatoliklar (400, 500 va h.k.)
        const errorMsg = error.response?.data?.message || "Server bilan bog'lanishda xatolik";
        toast.error(errorMsg);
        console.error("Save Error:", error);
        return false;
      } finally {
        this.isSubmitting = false;
      }
    },

    // 3. O'chirish (Soft-delete)
    async DeleteById(id) {
        console.log(id)
        try {
            const response = await AccessoriesService.DeleteById({ id });
            if (response.data?.success) {
                toast.success("Resurs muvaffaqiyatli o'chirildi");
                await this.GetAll();
                return true;
            }
        } catch (error) {
            toast.error("O'chirishda xatolik yuz berdi");
            return false;
        }
    },

    // 4. Modallarni va formani boshqarish
    openAddModal(item = null) { 
      if (item) {
        // Tahrirlash rejimi: Kelgan ma'lumotni selectedMaterial-ga yuklaymiz
        this.selectedMaterial = { 
    ...item,
    image: item.image // FileUpload buni string deb qabul qiladi va resolveUrl ishga tushadi
  };; 
      } else {
        // Yangi qo'shish rejimi
        this.selectedMaterial = null; 
      }
      this.isAddModalOpen = true; 
    },

    closeAddModal() { 
      this.isAddModalOpen = false; 
      this.selectedMaterial = null;
    }
  }
});