import api from "@/helpers/api";

export const SupplyInboundService = {
    // Yangi kontragent (fermer yoki aholi) yaratish yoki tahrirlash
    Create(payload) {
        // payload ichida model va action (create/update) keladi
        let url = "supply/inbound/create";
        return api.post(url, payload);
    },  

    // Barcha kontragentlar ro'yxatini olish (filtr va status bilan)
    GetAll(payload) {
        let url = "supply/counterparty/all";
        return api.post(url, payload);
    },

    // Kontragentni o'chirish yoki arxivlash
    DeleteById(id) {
        let url = "supply/counterparty/delete";
        return api.post(url, { id });
    },

    // Bitta kontragent ma'lumotlarini ID bo'yicha olish
    GetById(id) {
        let url = "supply/counterparty/detail";
        return api.post(url, { id });
    },

    // Kontragent tomonidan topshirilgan sutlar (kirimlar) tarixini olish
    // "Orders" so'zi xaridga (Inbound) o'zgardi
    GetInboundsBySupplierId(supplierId) {
        let url = "supply/counterparty/inbounds";
        return api.post(url, { supplierId });
    },

    // Kontragentning sut topshirish tarixi bo'yicha Excel hisobot shakllantirish
    ExportInbounds(data) {
        let url = "supply/counterparty/export-excel";
        return api.post(url, data, {
            responseType: "blob", // Faylni yuklab olish uchun shart
        });
    },
};