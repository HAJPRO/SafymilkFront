import { defineStore } from "pinia";
import { useToast } from "../../../../UI/utils/useToast";
import { Loading } from "../../../../utils/Loading";

const { toast } = useToast();
const loading = Loading();

export const PlanActionPlanningStore = defineStore('PlanActionPlanningStore', {
  state: () => ({
    isModal: false,
    ModalAction: { action: 1 }, // 1: Create, 2: Update
    modal: {
      model: {
        planDate: new Date().toISOString().split('T')[0],
        responsiblePerson: null,
        instructions: "",
        batches: [] 
      }
    }
  }),

  actions: {
    async ActionModal(action, data = null) {
      this.ModalAction = action;
      
      if (action.action === 1) {
        this.resetModal();
      } else if (data) {
        // Ma'lumotni tahrirlash rejimida yuklash
        this.modal.model = JSON.parse(JSON.stringify(data));
        
        // Agar eski ma'lumotlarda yangi massivlar bo'lmasa (migration xavfsizligi)
        this.modal.model.batches.forEach(batch => {
          if (!batch.accessories) batch.accessories = [];
          if (!batch.additionalCosts) batch.additionalCosts = [];
        });
      }
      this.isModal = true;
    },

    // Standart mahsulotlar shabloni (Markazlashtirilgan)
    getProductTemplates() {
      return [
        { productId: 1, name: "Smetana (20%)", unit: "kg" },
        { productId: 2, name: "Tvorog (9%)", unit: "kg" },
        { productId: 3, name: "Qaymoq (30%)", unit: "L" },
        { productId: 4, name: "Sut (Paster)", unit: "L" }
      ];
    },

    addNewBatch() {
      const templates = this.getProductTemplates();

      this.modal.model.batches.push({
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Noyob ID
        milkAmount: null,
        fatContent: 3.6,
        lossCoefficient: 1.5,
        outputs: templates.map(p => ({
          productId: p.productId,
          name: p.name,
          amount: 0,
          unit: p.unit
        })),
        accessories: [],
        additionalCosts: []
      });
    },

    removeBatch(index) {
      if (this.modal.model.batches.length > 1) {
        this.modal.model.batches.splice(index, 1);
      } else {
        toast.warning("Kamida bitta partiya bo'lishi shart!");
      }
    },

    resetModal() {
      this.modal.model = {
        planDate: new Date().toISOString().split('T')[0],
        responsiblePerson: null,
        instructions: "",
        batches: []
      };
      this.addNewBatch();
    },

    async Create() {
      // Validatsiya: Mas'ul shaxs tanlanganligini tekshirish
      if (!this.modal.model.responsiblePerson) {
        toast.error("Iltimos, mas'ul texnologni tanlang!");
        return false;
      }

      // Validatsiya: Kamida bitta partiyada sut miqdori borligini tekshirish
      const hasMilk = this.modal.model.batches.some(b => Number(b.milkAmount) > 0);
      if (!hasMilk) {
        toast.error("Kamida bitta partiyada sut miqdori bo'lishi kerak!");
        return false;
      }

      loading.start();
      try {
        const payload = this.modal.model;
        console.log("Safymilk ERP: Saqlanmoqda...", payload);
        
        // API chaqiruvi misoli:
        // const { data } = await axios.post('/planning', payload);
        
        await new Promise(resolve => setTimeout(resolve, 1200));

        toast.success("Ishlab chiqarish rejasi muvaffaqiyatli saqlandi!");
        this.isModal = false; // Modalni yopish
        return true;
      } catch (error) {
        toast.error("Xatolik: " + (error.response?.data?.message || error.message));
        return false;
      } finally {
        loading.stop();
      }
    }
  }
});