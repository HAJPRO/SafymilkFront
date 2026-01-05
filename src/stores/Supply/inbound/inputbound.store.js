import { defineStore } from "pinia";
import { SupplyInboundService } from "../../../ApiServices/Supply/inbound/inbound.service";
import { useToast } from "../../../UI/utils/useToast";

const { toast } = useToast();

export const SupplyInputboundStore = defineStore('SupplyInputboundStore', {
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
    totalSum: (state) => state.document.items.reduce((acc, item) => acc + (item.qty * (item.costPrice || 0)), 0),
    itemsCount: (state) => state.document.items.length,
  },

  actions: {
    // Barcha hujjatlarni olish
    async GetAll(params = {}) {
      this.loading = true;
      try {
        const res = await SupplyInboundService.GetAll(params);
        this.document = res.data.data;
      } catch (error) {
        toast.error("Ro'yxatni yuklashda xatolik!");
      } finally {
        this.loading = false;
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
        if (cat.includes('sut')) {
          newItem.fat = product.fatContent || 3.6;
          newItem.temp = 4;
          newItem.density = 1.028;
        } else if (cat.includes('meva')) {
          newItem.brix = 12;
        }

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
        await SupplyInboundService.Create(this.document);
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
        const response = await SupplyInboundService.SaveLabResult(payload);

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