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
          costPrice: product.lastPurchasePrice || 0,
          lastPurchasePrice: product.lastPurchasePrice || 0, // Solishtirish uchun
          fat: 3.6, // Default yog'lilik
          temp: 4,  // Default harorat
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
      if (this.document.items.length === 0 || !this.document.counterparty) return false;
      this.isSubmitting = true
      try {
        const response = SupplyInboundService.Create( this.document)
        if (response.status === 200 || response.status === 201) {
          this.clearDocument() // Muvaffaqiyatli saqlangach savatni tozalash
          toast.success(response.msg)
          return true
        }
      } catch (error) {
        console.error("Saqlashda xato:", error)
        return false
      } finally {
        this.isSubmitting = false
      }
    }
  }
})