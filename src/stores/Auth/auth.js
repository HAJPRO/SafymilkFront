import { LoginService } from "../../ApiServices/Auth/login.service.js";
import { RegisterService } from "../../ApiServices/Auth/register.service.js";
import { defineStore } from "pinia";
import { ToastifyService } from "../../utils/Toastify";
import { Loading } from "../../utils/Loading.js";
import { jwtDecode } from "jwt-decode"; // O'rnatish shart: npm install jwt-decode

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

      async login(payload) {
    try {
        const loader = loading.show();
        const res = await LoginService.Login(payload);
        
        if (res.data && res.data.accessToken) {
            // 1. Ma'lumotlarni saqlash
            localStorage.setItem("token", res.data.accessToken);
            localStorage.setItem("account", JSON.stringify(res.data.user));

            // 2. Store-ni yangilash
            this.user = jwtDecode(res.data.accessToken);
            this.is_alert = false;

            loader.hide();
            
            // 3. DARHOL YO'NALTIRISH
            // Agar this.router ishlamasa, window.location.replace ishlating
            window.location.replace("/explore/dashboard/statistic/sale");
            
        } else {
            this.is_alert = true;
            this.items = res.data;
            loader.hide();
        }
    } catch (err) {
        loader.hide();
        console.error("Login xatosi:", err);
        ToastifyService.ToastError({ msg: "Login yoki parol xato!" });
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