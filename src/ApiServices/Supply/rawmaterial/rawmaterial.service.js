import api from "@/helpers/api";

export const RawMaterialService = {
    // 1. Yangi xomashyo yaratish yoki tahrirlash
    // payload: { name, code, unit, costPrice, fatContent, density, image, etc. }
    Create(payload) {
        let url = "supply/rawmaterial/create";
        return api.post(url, payload);
    },

    // 2. Barcha xomashyolar ro'yxatini olish (Filtrlar bilan)
    GetAll(payload) {
        let url = "supply/rawmaterial/all";
        return api.post(url, payload || {});
    },

    // 3. Xomashyoni o'chirish
    DeleteById(id) {
        let url = "supply/rawmaterial/delete";
        return api.post(url, { id });
    },

    // 4. Bitta xomashyo haqida batafsil ma'lumot (ID bo'yicha)
    GetById(id) {
        let url = "supply/rawmaterial/detail";
        return api.post(url, { id });
    },

    // 5. QR-kod yoki shtrix-kod orqali xomashyoni qidirish (Skaner uchun)
    GetByCode(code) {
        let url = "supply/rawmaterial/by-code";
        return api.post(url, { code });
    },

    // 6. Xomashyo tahlillari tarixini olish (Laboratoriya tahlillari)
    // Muayyan xomashyoning sifat o'zgarishi tarixini kuzatish uchun
    GetAnalysisHistory(rawMaterialId) {
        let url = "supply/rawmaterial/analysis-history";
        return api.post(url, { rawMaterialId });
    },

    // 7. Xomashyolar ro'yxatini Excel formatida yuklab olish
    ExportExcel(payload) {
        let url = "supply/rawmaterial/export-excel";
        return api.post(url, payload, {
            responseType: "blob", // Faylni yuklab olish uchun muhim
        });
    },

    // 8. Ombor qoldiqlarini yangilash (Inbound jarayonidan tashqari holatlar uchun)
    UpdateStock(payload) {
        let url = "supply/rawmaterial/update-stock";
        return api.post(url, payload);
    }
};