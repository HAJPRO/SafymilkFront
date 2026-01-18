import api from "@/helpers/api";

export const AccessoriesInboundService = {
    // Yangi kontragent (fermer yoki aholi) yaratish yoki tahrirlash
    Create(payload) {
        // payload ichida model va action (create/update) keladi
        let url = "supply/accessories/inbound/create";
        return api.post(url, payload);
    },  

    // Barcha kontragentlar ro'yxatini olish (filtr va status bilan)
    GetAll(payload) {
        let url = "supply/accessories/inbound/all";
        return api.post(url, payload);
    },

    // Kontragentni o'chirish yoki arxivlash
    DeleteById(id) {
        let url = "supply/accessories/counterparty/delete";
        return api.post(url, { id });
    },

    // Bitta kontragent ma'lumotlarini ID bo'yicha olish
    GetById(id) {
        let url = "supply/accessories/counterparty/detail";
        return api.post(url, { id });
    },

    // Kontragent tomonidan topshirilgan sutlar (kirimlar) tarixini olish
    // "Orders" so'zi xaridga (Inbound) o'zgardi
    GetInboundsBySupplierId(supplierId) {
        let url = "accessories/counterparty/inbounds";
        return api.post(url, { supplierId });
    },

    // Kontragentning sut topshirish tarixi bo'yicha Excel hisobot shakllantirish
    ExportInbounds(data) {
        let url = "accessories/counterparty/export-excel";
        return api.post(url, data, {
            responseType: "blob", // Faylni yuklab olish uchun shart
        });
    },

    // Laboratoriya
     SaveLabResult(payload) {
        // payload ichida model va action (create/update) keladi
        let url = "accessories/inbound/labanalysis";
        return api.post(url, payload);
    },  
};