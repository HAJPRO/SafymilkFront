import { defineStore } from "pinia";
import { SupplyInboundService } from "../../../ApiServices/Supply/inbound/inbound.service";
import { Loading } from "../../../utils/Loading";
import { useToast } from "../../../UI/utils/useToast";

const { toast } = useToast();
const loading = Loading();

export const SupplyInputboundStore = defineStore('SupplyInputboundStore', {
  state: () => ({
    // Asosiy hujjat tuzilmasi
    document: {
      counterparty: null,
      branchId: null,
      items: [], // Savatchadagi mahsulotlar arrayi
      description: '',
      date: new Date().toISOString().substr(0, 10),
    },
    
    // Yordamchi holatlar
    isSubmitting: false,
    catalog: [], // Ombor mahsulotlari ro'yxati
  }),

  getters: {
    // Umumiy summani hisoblash
    totalSum: (state) => {
      return state.document.items.reduce((acc, item) => {
        return acc + (item.qty * (item.costPrice || 0))
      }, 0)
    },
    
    // Savatdagi elementlar soni
    itemsCount: (state) => state.document.items.length,
  },

  actions: {
    async GetAll() {
      this.loading = true;
      try {
        const response = await SupplyInboundService.GetAll();
        console.log(response);
        
        this.document = response.data.data || [];
      } catch (error) {
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        this.loading = false;
      }
    },
    // 1. Katalog ma'lumotlarini yuklash
    async fetchCatalog() {
      try {
        // const response = await axios.get('/api/products/catalog') // API manzilingiz
        // this.catalog = response.data
      } catch (error) {
        console.error("Katalogni yuklashda xato:", error)
      }
    },

    // 2. Mahsulotni savatga qo'shish
    addItem(product) {
      // Agar mahsulot savatda allaqachon bo'lsa, miqdorini oshirish
      const existingItem = this.document.items.find(i => i.productId === product._id)
      
      if (existingItem) {
        existingItem.qty++
      } else {
        // Yangi mahsulotni laboratoriya parametrlari bilan qo'shish
        this.document.items.push({
          productId: product._id,
          name: product.name,
          image: product.image,
          unit: product.unit,
          qty: 1,
          costPrice: product.costPrice || 0,
          lastPurchasePrice: product.lastPurchasePrice || 0, // Solishtirish uchun
          fat: product.fatContent, // Default yog'lilik
          temp: product.temperature,  // Default harorat
          density: 1.028,
        })
      }
    },

    // 3. Mahsulot ma'lumotlarini yangilash (qty, fat, temp...)
    updateItem(productId, payload) {
      const item = this.document.items.find(i => i.productId === productId)
      if (item) {
        Object.assign(item, payload)
      }
    },

    // 4. Mahsulotni savatdan o'chirish
    // ReferenceError: _id xatosini oldini olish uchun 'id' argumentidan foydalanamiz
    removeItem(id) {
      if (!id) return;
      this.document.items = this.document.items.filter(item => item.productId !== id);
    },

    // 5. Savatni butunlay tozalash
    clearDocument() {
      this.document.items = []
      this.document.counterparty = null
      this.document.description = ''
    },

    // 6. Qabulni serverga saqlash
async saveInput() {
  // Tekshiruv: savat bo'sh bo'lsa yoki kontragent tanlanmagan bo'lsa davom etmaydi
  if (this.document.items.length === 0) {
    toast.error("Savat bo'sh, iltimos mahsulot qo'shing");
    return false;
  }
  if (!this.document.counterparty) {
    toast.error("Iltimos, kontragentni tanlang");
    return false;
  }

  this.isSubmitting = true;
  loading.show; // Yuklanish animatsiyasini boshlash

  try {
    // MUHIM: await qo'shildi, chunki API so'rovi vaqt oladi
    const response = await SupplyInboundService.Create(this.document);

    // Backenddan keladigan statusni tekshirish (odatda 200, 201 yoki response.data.success)
    if (response.status === 200 || response.status === 201) {
      
      // 1. Savatni va formani tozalash
      this.clearDocument();
      
      // 2. Toast xabarini chiqarish
      // response.msg yoki response.data.message - backend strukturangizga qarab o'zgartiring
      toast.success(response.data?.message || "Muvaffaqiyatli saqlandi!");
      
      return true;
    }
  } catch (error) {
    console.error("Saqlashda xato:", error);
    // Xatolik haqida xabar
    const errorMsg = error.response?.data?.message || "Saqlashda xatolik yuz berdi";
    toast.error(errorMsg);
    
    return false;
  } finally {
    this.isSubmitting = false;
    loading.hide; // Yuklanishni to'xtatish
  }
}
  }
})