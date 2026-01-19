
/**
 * Cookie ichidan account ma'lumotlarini olish
 * 
 * @param {Array<string>} fields - qaytarilishi kerak bo‘lgan maydonlar
 * @returns {Object|null} faqat so‘ralgan maydonlardan iborat obyekt yoki null
 */
export function getAccountFields(fields = []) {
  const raw = localStorage.getItem("account");
  if (!raw) return null;

  let account;
  try {
    account = JSON.parse(raw);
  } catch (e) {
    console.error("❌ Account cookie JSON parse xatolik:", e);
    return null;
  }

  if (!Array.isArray(fields) || fields.length === 0) {
    return account; // agar fields bo‘sh bo‘lsa hammasini qaytaramiz
  }

  // faqat kerakli maydonlarni yig‘ib qaytaramiz
  const result = {};
  fields.forEach((field) => {
    if (account.hasOwnProperty(field)) {
      result[field] = account[field];
    }
  });

  return result;
}
