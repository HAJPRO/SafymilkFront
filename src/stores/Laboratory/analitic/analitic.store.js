import { defineStore } from "pinia";
import { LaboaratoryAnaliticService } from "../../../ApiServices/Laboratory/analitic/analitic.service";
import { useToast } from "../../../UI/utils/useToast";
import { downloadPdfFile } from "../../../utils/generater/pdfHelper";
import { Loading } from "../../../utils/Loading";
const loading = Loading();

const { toast } = useToast();

export const LaboaratoryAnaliticStore = defineStore('LaboaratoryAnaliticStore', {
  state: () => ({
    analyticsData: [], // Barcha laboratoriya tahlillari shu yerga tushadi
    loading: false,
    activeFilter: 'day'
  }),

  actions: {
    async GetAll(params = {}) {
      this.loading = true;
      try {
        // API dan ma'lumotlarni olish
        const response = await LaboaratoryAnaliticService.GetAll(params);
        
        // Mongoose modelidagi results va distribution ma'lumotlarini saqlash
        this.analyticsData = response.data?.data.data || [];
        
        if (this.analyticsData.length === 0) {
          toast.info("Tanlangan oraliqda ma'lumot topilmadi");
        }
      } catch (error) {
        console.error("Xatolik:", error);
        toast.error("Ma'lumotlarni olishda xatolik yuz berdi");
      } finally {
        this.loading = false;
      }
    },

  async GeneratePdf(id) {
  const loader = loading.show();
  try {
    const response = await LaboaratoryAnaliticService.GeneratePdf({ id });
    
    // Universal helperni chaqiramiz
    downloadPdfFile(response.data, `Analiz_Hisoboti_${id}`);
      loader.hide();
    toast.success("PDF muvaffaqiyatli yuklandi");
  } catch (error) {
    toast.error("PDF generatsiya qilishda xatolik yuz berdi");
  } finally {
    this.loading = false;
  }
}
  }
});