import { defineStore } from "pinia";
import { ProductManagmentService } from "../../../ApiServices/Sale/products/product.service";
import { ToastifyService } from "../../../utils/Toastify";
import { useToast } from "../../../UI/utils/useToast";
const { toast } = useToast();

import { Loading } from "../../../utils/Loading";
import { downloadExcelFile } from "../../../utils/ExcelExport";

const loading = Loading();

export const ProductsManagmentStore = defineStore("ProductsManagmentStore", {
  state: () => ({
    product_modal: false,
    product_detail_modal: false,
    isActive: "active",
    TitleAction: { title: "", action: "" },

    products: [],
    product: null,
    
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    searchQuery: "",
    filterCategory: "Barchasi",

    model: {
      _id: null,
      name: "",
      code: "",
      category: "",
      image: null, // Fayl obyekti uchun null
      unit: "dona",
      salePrice: 0,
      costPrice: 0,
      margainPercent: 0, // Qo'shildi
      packSize: 1,
      minStockAlert: 10,
      description: "",
      status: "active"
    }
  }),

  actions: {
    // --- 1. MODAL BOSHQARUVI ---
    openAddModal(code) {
      this.resetModel();
      this.TitleAction = { title: "Yangi Mahsulot Qo'shish", action: "create", code };

      this.product_modal = true;
    },

    async openEditModal(id) {
      this.TitleAction = { title: "Mahsulotni Tahrirlash", action: "update" };
      await this.GetOne(id);
      this.product_modal = true;
    },

    closeModal() {
      this.product_modal = false;
      this.resetModel();
    },

    // --- 2. API ACTIONS ---
    async GetAll() {
      const loader = loading.show();
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          search: this.searchQuery,
        };

        const response = await ProductManagmentService.GetAll(params);
        this.products = response.data.products || [];
        
        if (response.data.pagination) {
          this.pagination = response.data.pagination;
        } else {
          this.pagination.total = response.data.all_length?.all || 0; 
        }
      } catch (error) {
        console.error("GetAll Error:", error);
        ToastifyService.ToastError("Ma'lumot olishda xatolik!");
      } finally {
        loader.hide();
      }
    },

    async GetOne(id) {
      const loader = loading.show();
      try {
        const response = await ProductManagmentService.GetOne(id);
        const data = response.data.data || response.data.product;
        this.model = { ...data }; 
        this.product = data;
      } catch (error) {
        ToastifyService.ToastError("Mahsulot topilmadi");
      } finally {
        loader.hide();
      }
    },

    // Komponentdan FormData keladi
    async SaveProduct(formData) {
      if (this.TitleAction.action === 'create') {
        await this.Create(formData);
      } else {
        const id = this.model._id || this.model.id;
        await this.UpdateById(id, formData);
      }
    },

    async Create(formData) {
      const loader = loading.show();
      try {
        const response = await ProductManagmentService.Create(formData);
        this.closeModal();
        this.pagination.page = 1; 
        await this.GetAll(); 
        toast.success(response.data.msg || "Mahsulot yaratildi");
      } catch (error) {
        toast.error(error.response?.data?.msg || "Yaratishda xatolik");
        throw error; // Komponentda xatolikni tutish uchun
      } finally {
        loader.hide();
      }
    },

    async UpdateById(id, formData) {
      const loader = loading.show();
      try {
        const response = await ProductManagmentService.UpdateById(id, formData);
        this.closeModal();
        await this.GetAll();
        toast.success(response.data.msg || "Mahsulot yangilandi");
      } catch (error) {
        toast.error(error.response?.data?.msg || "Yangilashda xatolik");
        throw error;
      } finally {
        loader.hide();
      }
    },

    async DeleteById(id) {
      if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
      const loader = loading.show();
      try {
        const response = await ProductManagmentService.DeleteById(id);
        await this.GetAll();
        toast.success(response.data.msg || "O'chirildi");
      } catch (error) {
        toast.error("O'chirishda xatolik",error.message);
      } finally {
        loader.hide();
      }
    },

    resetModel() {
      this.model = {
        _id: null,
        name: "",
        code: "",
        category: "",
        image: null,
        unit: "dona",
        salePrice: 0,
        costPrice: 0,
        margainPercent: 0,
        packSize: 1,
        minStockAlert: 10,
        description: "",
        status: "active"    
      };
    },
      async handleExcelExport({ payload, fileName = 'Mahsulotlar' }) {
          const loader = loading.show();
          try {
            const res = await ProductManagmentService.handleExcelExport(payload);
            downloadExcelFile(res, fileName);
            toast.success("Fayl yuklab olindi");
          } catch (error) {
            toast.error("Eksportda xatolik: " + error.message);
          } finally {
            loader.hide();
          }
        },
  },
});