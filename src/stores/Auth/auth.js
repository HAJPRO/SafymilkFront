import { LoginService } from "../../ApiServices/Auth/login.service.js";
import { RegisterService } from "../../ApiServices/Auth/register.service.js";
import { defineStore } from "pinia";
import { ToastifyService } from "../../utils/Toastify";
import { Loading } from "../../utils/Loading.js";
import { jwtDecode } from "jwt-decode"; // O'rnatish shart: npm install jwt-decode
import { Preferences } from '@capacitor/preferences';

const loading = Loading();

export const AuthStore = defineStore("AuthStore", {
    state: () => {
        // Sahifa yangilanganda ham foydalanuvchi ma'lumotlarini saqlab qolamiz
        const token = localStorage.getItem("token");
        
        return {
            user: token ? jwtDecode(token) : null, // Guard aynan shu 'user'ni qidiradi
            items: "",
            is_alert: false
        }
    },
    actions: {
        async register(payload) {
            try {
                const loader = loading.show();
                const res = await RegisterService.Register(payload);
                loader.hide();
                ToastifyService.ToastSuccess({ msg: res.data.msg });
            } catch (err) {
                console.error("Register xatosi:", err);
            }
        },

   // AuthStore.js actions qismi
async login(payload) {
  try {
    const res = await LoginService.Login(payload);
    if (res.data && res.data.accessToken) {
      localStorage.setItem("token", res.data.accessToken);
      this.user = jwtDecode(res.data.accessToken);
      return true; // Muvaffaqiyatli bo'lsa true qaytaramiz
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
},

        async update(payload) {
            try {
                const loader = loading.show();
                const res = await RegisterService.Update(payload);
                loader.hide();
                ToastifyService.ToastSuccess({ msg: res.data.msg });
            } catch (err) {
                console.error("Update xatosi:", err);
            }
        },

   logout() {
    console.log("Logout boshlandi...");
    
    // Avval o'chirishni bajaramiz
    localStorage.removeItem("token");
    localStorage.removeItem("account");
    
    console.log("LocalStorage tozalandi. Token hozir:", localStorage.getItem("token"));

    this.user = null;
    window.location.href = "/login";
}
    },
});