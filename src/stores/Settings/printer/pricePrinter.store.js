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
   usbDevice: null, // Qurilmani saqlash uchun joy
    
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

    // async fetchPrinters() {
    //     const response = await PricePrinterTemplateService.GetAllPrinter();
    //     console.log(response.data.data)
    //   this.printers = response.data.data
    // },
 async fetchPrinters() {
  try {
    if (window.electronAPI) {
      const res = await window.electronAPI.getPrinters();
      
      // AppSelect uchun ma'lumotni formatlash
      this.printers = res.map(p => ({
        label: p.displayName || p.name, // Select-da ko'rinadigan yozuv
        value: p.name                   // Tanlanganda store-ga tushadigan qiymat
      }));

      console.log("Formatlangan printerlar:", this.printers);
    }
  } catch (error) {
    console.error("Printerlarni olishda xato:", error);
  }
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
    },

    //  async sendToPrintBulk(payload) {
    //   console.log(payload)
    //   try {
    //    const respons = await PricePrinterTemplateService.sendToPrintBulk(payload)
    //    console.log(respons)
    //   } catch (error) {
    //     toast.error(error.response?.data?.message || "Serverda xatolik");
    //     return false;
    //   } finally {
    //   }
    // },

 // Store ichida helper funksiya
// generatePrintHtml funksiyasi
generatePrintHtml(item, template) {
  const { width, height, elements } = template;
  
  const renderedElements = elements.map(el => {
    let content = "";
    // Har bir element uchun bazadagi mm koordinatalarni qat'iy qo'llaymiz
    let style = `
      position: absolute;
      left: ${el.x}mm;
      top: ${el.y}mm;
      width: ${el.w}mm;
      height: ${el.h}mm;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      overflow: hidden;
    `;

    if (el.type === 'name') {
      content = item.name;
      style += `font-size: ${el.fontSize}mm; font-weight: bold; text-align: center; line-height: 1;`;
    } 
    else if (el.type === 'price') {
      const formattedPrice = new Intl.NumberFormat('uz-UZ').format(item.price);
      content = `${formattedPrice} SUM`;
      style += `font-size: ${el.fontSize}mm; font-weight: 900;`;
    } 
    else if (el.type === 'qr') {
      content = `<img src="${item.qr}" style="height: 100%; width: 100%; object-fit: contain;" />`;
    }

    return `<div style="${style}">${content}</div>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @page { size: ${width}mm ${height}mm; margin: 0; }
          body { 
            margin: 0; padding: 0; 
            width: ${width}mm; height: ${height}mm; 
            position: relative; overflow: hidden;
            background: white;
          }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        <div style="width: ${width}mm; height: ${height}mm; position: relative;">
          ${renderedElements}
        </div>
      </body>
    </html>
  `;
},

// sendToPrintBulk funksiyasi
async sendToPrintBulk(payload) {
  console.log(payload)
  const { items, settings } = payload;
  const template = settings.templateId;

  // if (!this.settings.labelPrinter) {
  //   alert("Printer tanlanmagan!");
  //   return;
  // }

  try {
    for (const item of items) {
      const htmlContent = this.generatePrintHtml(item, template);
      const printCount = item.printCount || 1;

      for (let i = 0; i < printCount; i++) {
        await window.electronAPI.printToPrinter({
          content: htmlContent,
          printerName: this.settings.labelPrinter ? this.settings.labelPrinter : 'P1 Label Printer',
          width: template.width,
          height: template.height
        });
      }
    }
  } catch (error) {
    console.error("Chop etishda xato:", error);
  }
},

async printSticker(data) {
  try {
    // 1. Qurilmani so'rash (Filtersiz hammasini chiqaradi)
    const device = await navigator.usb.requestDevice({ filters: [] });
    
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);

    const encoder = new TextEncoder();
    
    // P1 printerlar uchun TSPL tili (Zavod sozlamasi)
    let tspl = "\r\nSIZE 40 mm, 30 mm\r\nGAP 3 mm, 0\r\nCLS\r\n";
    tspl += `TEXT 160, 40, "3", 0, 1, 1, 2, "SAFY MILK"\r\n`;
    tspl += `TEXT 40, 100, "2", 0, 1, 1, "SUT 1L"\r\n`;
    tspl += `TEXT 40, 160, "3", 0, 1, 1, "NARXI: 12,000"\r\n`;
    tspl += "PRINT 1, 1\r\n";

    // 2. Ma'lumotni to'g'ridan-to'g'ri USB kanaliga haydaymiz
    // Endpoint: 1 yoki 2 ni sinab ko'ring
    await device.transferOut(1, encoder.encode(tspl));
    
    console.log("Pechatga ketdi!");

    // 3. Aloqani bo'shatish
    await device.releaseInterface(0);
    await device.close();

  } catch (error) {
    console.error("Xato:", error);
    alert("Xatolik: " + error.message);
  }
}
    
  }
});