import { defineStore } from "pinia";
import { AccessoriesInboundService } from "../../../ApiServices/Supply/accessories/inputinbound.service";
import { useToast } from "../../../UI/utils/useToast";
import { Loading } from "../../../utils/Loading";
const loading = Loading();
const { toast } = useToast();

export const AccessoriesInputboundStore = defineStore('AccessoriesInputboundStore', {
  state: () => ({
    inbounds: [], // Barcha kirimlar ro'yxati
    document: {
      counterparty: null,
      warehouse: null,
      document :[],
      branchId: null,
      items: [], 
      description: '',
      date: new Date().toISOString().substr(0, 10),
    },
    isSubmitting: false,
    loading: false,
  }),

  getters: {
   totalSum: (state) => {
    // items mavjudligini va massivligini qat'iy tekshiramiz
    const items = state.document?.items || [];
    return items.reduce((sum, item) => {
      const price = Number(item.costPrice) || 0;
      const qty = Number(item.qty) || 0;
      return sum + (price * qty);
    }, 0);
  },
    itemsCount: (state) => state.document.items.length,
  },

  actions: {
    // Barcha hujjatlarni olish
    async GetAll(params = {}) {
 const loader  = loading.show();
      try {
        const res = await AccessoriesInboundService.GetAll(params);
        console.log(res.data.data)
        this.document = res.data.data;
      } catch (error) {
        toast.error("Ro'yxatni yuklashda xatolik!");
      } finally {
        loader.hide()
      }
    },

    addItem(product) {
      const existingItem = this.document.items.find(i => i.productId === product._id);
      if (existingItem) {
        existingItem.qty++;
      } else {
        const cat = (product.category || 'boshqa').toLowerCase();
        const newItem = {
          productId: product._id,
          name: product.name,
          image: product.image,
          unit: product.unit,
          category: cat,
          qty: 1,
          costPrice: product.costPrice || 0,
          // Hajm parametrlari (Butilka/Idishlar uchun)
          volume: product.volume || null,
          volumeUnit: product.volumeUnit || 'L'
        };

        // Dinamik Lab maydonlari
      
          newItem.fat = product.fatContent || 3.6;
          newItem.temp = product.temperature || 3.6;;
          newItem.density = product.density || 1.028;
       

        this.document.items.push(newItem);
      }
    },

    updateItem(productId, payload) {
      const item = this.document.items.find(i => i.productId === productId);
      if (item) Object.assign(item, payload);
    },

    removeItem(id) {
      this.document.items = this.document.items.filter(item => item.productId !== id);
    },

    async saveInput() {
      if (!this.document.items.length || !this.document.counterparty) {
        toast.warning("Ma'lumotlar to'liq emas!");
        return false;
      }
      this.isSubmitting = true;
      try {
        await AccessoriesInboundService.Create(this.document);
        this.clearDocument();
        toast.success("Muvaffaqiyatli saqlandi!");
        return true;
      } catch (error) {
        toast.error("Xatolik yuz berdi");
        return false;
      } finally { this.isSubmitting = false; }
    },

    clearDocument() {
      this.document.items = [];
      this.document.counterparty = null;
      this.document.description = '';
    },

   async saveLabAnalysis(payload) {
      if (!payload.inboundBatchIds || payload.inboundBatchIds.length === 0) {
        toast.error("Tahlil uchun partiyalar tanlanmagan");
        return false;
      }

      this.isSubmitting = true;
      this.loading = true;

      try {
        // API Service orqali backendga yuborish
        // Payload tarkibi: { inboundBatchIds, labResults, distribution, totalPhysicalVolume }
        const response = await AccessoriesInboundService.SaveLabResult(payload);

        if (response.status === 200 || response.data?.success) {
          toast.success("Laboratoriya xulosasi va taqsimot muvaffaqiyatli saqlandi!");
          
          // Ma'lumotlarni yangilash uchun ro'yxatni qayta yuklaymiz
          await this.GetAll();
           this.loading = false;
          return true;
        }
      } catch (error) {
        console.error("Lab tahlilini saqlashda xato:", error);
        const msg = error.response?.data?.message || "Laboratoriya ma'lumotlarini saqlashda xatolik";
        toast.error(msg);
        return false;
      } 
    },
  }
});