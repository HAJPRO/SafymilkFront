import { defineStore } from "pinia";
import { PricePrinterTemplateService } from "../../../ApiServices/Settings/printer/pricePrinter.service"; 
import { useToast } from "../../../UI/utils/useToast";
import { Loading } from "../../../utils/Loading";

const loading = Loading();
const { toast } = useToast();

export const PricePrinterTemplateStore = defineStore('PricePrinterTemplateStore', {
  state: () => ({
    // --- Shablonlar Ma'lumotlari ---
    templates: [], 
    currentTemplate: null, 
    
    // --- Tizim va Qurilma Sozlamalari ---
    settings: {
      labelPrinter: '',   // Tanlangan yorliq printeri
      receiptPrinter: '', // Tanlangan chek printeri
      scale: 100,         // Interfeys masshtabi (50-150)
      pcMode: false       // Kompyuter yoki Sensor rejimi
    },
    
    // --- UI Holatlari ---
    printers: [],         // Tizimdagi mavjud printerlar ro'yxati
    loading: false,
    isSubmitting: false,
    isAddModalOpen: false,
  }),

  actions: {
    /**
     * 1. SOZLAMALARNI BOSHQARISH (LocalStorage bilan)
     */
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
      // Brauzer xotirasiga saqlash (Refreshda o'chmasligi uchun)
      localStorage.setItem('app_printer_config', JSON.stringify(this.settings));
    },

    loadSettings() {
      const saved = localStorage.getItem('app_printer_config');
      if (saved) {
        this.settings = JSON.parse(saved);
      }
    },

    async fetchPrinters() {
        const response = await PricePrinterTemplateService.GetAllPrinter();
        console.log(response)
      this.printers = response.data.data.data
    },

    async clearLocalDatabase() {
      const loader = loading.show();
      try {
        // LocalStorage va State-ni tozalash
        localStorage.removeItem('app_printer_config');
        this.settings = {
          labelPrinter: '',
          receiptPrinter: '',
          scale: 100,
          pcMode: false
        };
        toast.success("Lokal kesh muvaffaqiyatli tozalandi!");
      } catch (error) {
        toast.error("Tozalashda xatolik yuz berdi");
      } finally {
        loader.hide();
      }
    },

    /**
     * 2. SHABLONLAR (TEMPLATES) BILAN ISHLASH (API)
     */
    async GetAll() {
      const loader = loading.show();
      try {
        const response = await PricePrinterTemplateService.GetAll();
        if (response.data?.success) {
          this.templates = response.data.data;
        }
      } catch (error) {
        toast.error("Shablonlarni yuklashda texnik xatolik!");
        console.error("GetAll Error:", error);
      } finally {
        loader.hide();
      }
    },

    async saveTemplate(templateData) {
      this.isSubmitting = true;
      try {
        let response;
        if (templateData._id) {
          response = await PricePrinterTemplateService.Update(templateData._id, templateData);
        } else {
          response = await PricePrinterTemplateService.Create(templateData);
        }

        if (response.data?.success) {
          toast.success(response.data.message || "Muvaffaqiyatli saqlandi!");
          await this.GetAll(); 
          return true;
        }
        return false;
      } catch (error) {
        toast.error(error.response?.data?.message || "Serverda xatolik");
        return false;
      } finally {
        this.isSubmitting = false;
      }
    },

    async deleteTemplate(id) {
      if (!confirm("Ushbu shablonni o'chirib tashlamoqchimisiz?")) return;
      
      const loader = loading.show();
      try {
        const response = await PricePrinterTemplateService.DeleteById(id);
        if (response.data?.success) {
          toast.success("Shablon o'chirildi");
          await this.GetAll();
          return true;
        }
      } catch (error) {
        toast.error("O'chirishda xatolik yuz berdi");
      } finally {
        loader.hide();
      }
    },

 

    /**
     * 3. MODAL VA CURRENT DATA BOSHQARUVI
     */
    openTemplateModal(item = null) {
      if (item) {
        this.currentTemplate = JSON.parse(JSON.stringify(item)); 
      } else {
        this.currentTemplate = {
          name: 'Yangi shablon',
          width: 40,
          height: 30,
          elements: []
        };
      }
      this.isAddModalOpen = true;
    },

    closeTemplateModal() {
      this.isAddModalOpen = false;
      this.currentTemplate = null;
    }
  }
});