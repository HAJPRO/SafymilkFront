import { defineStore } from "pinia";
import { CounterpartyService } from "../../../ApiServices/Supply/counterparty/counterparty.service";
import { Loading } from "../../../utils/Loading";
import { useToast } from "../../../UI/utils/useToast";

const { toast } = useToast();
const loading = Loading();

export const CounterpartyStore = defineStore("CounterpartyStore", {
  state: () => {
    return {
      TitleAction: { title: "", action: "" },
      isActive: "Aktiv",
      page: 1,
      custom_modal: false,
      detail_modal: false,
      counterparties: [],
      all_length: {},
      inbounds: [],
      
      modal: {
        model: {
          code: "",
          type: "physical", 
          fullname: "",
          inn: "",
          phoneNumber: "",
          image : "",
          // 🟢 Backend sxemasiga mos obyektlar
          bank_details: {
            bank_name: "",
            bank_account: "", 
          },
          contract: {
            number: "",
            date: "",
            milk_price: 0,
          },
          address: {
            region: "",
            district: "",
            neighborhood: "",
            street: "",
            house: "",
          },
          location: {
            lat: null, // toFixed xatosi chiqmasligi uchun null yoki 0
            long: null,
          },
          is_location: false,
          discription: "",
        },
      },
    };
  },

  actions: {
    async AddCustomModal(data) {
      this.TitleAction = { title: data.title, action: data.action };
      if (data.action === 'create') {
        this.resetForm(); 
      } else if (data.action === 'update') {
        await this.GetById(data.id);
      }
      this.custom_modal = true;
    },

    async Create(model) {
      const loader = loading.show();
      try {
        const res = await CounterpartyService.Create({ 
          model, 
          action: this.TitleAction.action 
        });
        this.custom_modal = false;
        await this.GetAll({ status: this.isActive, page: this.page, limit: 10 });
        toast.success(res.data.msg);
      } catch (error) {
        toast.error("Saqlashda xatolik yuz berdi");
      } finally {
        loader.hide();
      }
    },

    async GetAll(payload) {
      const loader = loading.show();
      try {
        const res = await CounterpartyService.GetAll(payload);
        this.page = payload?.page || 1;
        this.counterparties = res.data.counterparties;
        this.all_length = res.data.all_length;
      } finally {
        loader.hide();
      }
    },

    async GetById(id) {
      const loader = loading.show();
      try {
        const res = await CounterpartyService.GetById(id);
        // 🟡 MUHIM: API'dan kelgan ma'lumotda obyektlar bo'lmasa, default qiymat berish
        this.modal.model = {
          ...res.data.counterparty,
          bank_details: res.data.counterparty.bank_details || { bank_name: "", bank_account: "" },
          contract: res.data.counterparty.contract || { number: "", date: "", milk_price: 0 },
          address: res.data.counterparty.address || { region: "", district: "", neighborhood: "" }
        };
      } catch (error) {
        toast.error("Ma'lumot topilmadi");
      } finally {
        loader.hide();
      }
    },

    // 🔴 TO'G'RILANGAN resetForm
    resetForm() {
      this.modal.model = {
        code: "",
        type: "physical",
        fullname: "",
        inn: "",
        phoneNumber: "",
        bank_details: {
          bank_name: "",
          bank_account: "",
        },
        contract: {
          number: "",
          date: "",
          milk_price: 0,
        },
        address: {
          region: "",
          district: "",
          neighborhood: "",
          street: "",
          house: "",
        },
        location: {
          lat: null,
          long: null,
        },
        is_location: false,
        discription: ""
      };
    }
  },
});