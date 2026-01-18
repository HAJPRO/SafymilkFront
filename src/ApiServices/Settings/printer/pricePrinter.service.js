import api from "@/helpers/api";
const BaseUrl = "settings/printer/template"
export const PricePrinterTemplateService = {
    // 1. Yangi shablon yaratish yoki tahrirlash
    // payload: { name, width, height, elements: [...] }
    Create(payload) {
        let url = `${BaseUrl}/create`;
        return api.post(url, payload);
    },

    // 2. Barcha shablonlar ro'yxatini olish
    // payload: { search, page, limit } - ixtiyoriy filtrlar
    GetAll(payload) {
        let url = `${BaseUrl}/all`;
        return api.post(url, payload || {});
    },

    // 3. Shablonni tahrirlash
    // id: shablonning DB dagi _id si, payload: yangilangan ma'lumotlar
    Update(id, payload) {
         let url = `${BaseUrl}/update`;
        return api.post(url, payload);
    },

    // 4. Shablonni o'chirish
    // payload: { id }
    DeleteById(id) {
        let url = `${BaseUrl}/delete`;
        return api.post(url, { id });
    },

    // 5. Bitta shablon haqida batafsil ma'lumot (ID bo'yicha)
    GetById(id) {
         let url = `${BaseUrl}/detail`;
        return api.post(url, { id });
    },


    //Printers

     GetAllPrinter(payload) {
        let url = `${BaseUrl}/printer_all`;
        return api.post(url, payload || {});
    },

      sendToPrintBulk(payload) {
        let url = `${BaseUrl}/printing`;
        return api.post(url, payload || []);
    },

  
};