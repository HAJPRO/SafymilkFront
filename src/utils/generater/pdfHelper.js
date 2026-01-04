/**
 * PDF faylni yuklab olish uchun universal helper
 * @param {Object|Blob} data - Backenddan kelgan ma'lumot (Blob yoki Object)
 * @param {String} fileName - Yuklanadigan fayl nomi
 */
export const downloadPdfFile = (data, fileName = 'hisobot') => {
  try {
    let blob;

    // 1. Agar ma'lumot allaqachon Blob bo'lsa
    if (data instanceof Blob) {
      blob = data;
    } 
    // 2. Agar ma'lumot Buffer yoki Object (Uint8Array) ko'rinishida bo'lsa
    else {
      const values = Object.values(data);
      if (values.length === 0) throw new Error("Ma'lumot bo'sh");
      
      const uint8Array = new Uint8Array(values);
      blob = new Blob([uint8Array], { type: 'application/pdf' });
    }

    // 3. Yuklab olish jarayoni
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.pdf`);
    
    document.body.appendChild(link);
    link.click();

    // 4. Tozalash
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("PDF yuklashda muammo:", error);
    throw error;
  }
};