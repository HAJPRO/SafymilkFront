import { createRouter, createWebHistory } from "vue-router";
import ExploreLayout from "../layouts/ExploreView.vue";
import LandingLayout from "../layouts/LandingView.vue";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; 

const routes = [
  {
    path: "/",
    name: "home",
    component: LandingLayout,
    meta: { guestOnly: true },
    children: [
      { path: "", name: "landingPage", component: () => import("../pages/Landing/index.vue") },
      { path: "register", name: "Register", component: () => import("../pages/Landing/Register.vue") },
      { path: "login", name: "Login", component: () => import("../pages/Landing/Login.vue") },
    ],
  },
  {
    path: "/explore",
    name: "Explore",
    component: ExploreLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard/statistic/sale",
        name: "StatisticSale",
        component: () => import("../pages/Explore/Dashboard/statistic/sale/index.vue"),
        // Barcha xodimlar kira olishi uchun role bo'sh yoki o'chirilgan
      },
      {
        path: "admin/users",
        name: "Foydalanuvchilar",
        component: () => import("../pages/Explore/Admin/users.vue"),
        meta: { role: "1000" } 
      },
      {
        path: "admin/system/role",
        name: "Rollar boshqaruvi",
        component: () => import("../pages/Explore/Admin/system/index.vue"),
        meta: { role: "1000" }
      },
      { path: "profile", name: "profile_card", component: () => import("../pages/Explore/Profile/profile.vue") },
      { path: "profile_settings", name: "profile_settings", component: () => import("../pages/Explore/Profile/Settings.vue") },
      
      // HR Bo'limi
      { 
        path: "employees", 
        name: "Employees", 
        component: () => import("../pages/Explore/HR/employees/index.vue"),
        meta: { role: ["1000", "30", "2000"] } 
      },
      
      // Sotuv Bo'limi
      { 
        path: "sale/products", 
        name: "Products", 
        component: () => import("../pages/Explore/Sale/products/index.vue"),
        meta: { role: ["1000", "20", "2000"] } 
      },
      { 
        path: "sale/orders", 
        name: "Sotuvlar", 
        component: () => import("../pages/Explore/Sale/orders/index.vue"),
        meta: { role: ["1000", "20", "2000"] } 
      },
      { 
        path: "sale/salepos", 
        name: "Sotuv (POS)", 
        component: () => import("../pages/Explore/Sale/salepos/index.vue"),
        meta: { role: ["1000", "20", "2000"] } 
      },
      
      { path: "customers", name: "Mijozlar ro'yxati", component: () => import("../pages/Explore/Customers/customers/index.vue") },
      { path: "drivers/monitoring", name: "Monitoring", component: () => import("../pages/Explore/Drivers/monitoring/index.vue") },
      
      // Ombor Bo'limi
      { 
        path: "warehouses/r-warehouse", 
        name: "ReadyWarehouse", 
        component: () => import("../pages/Explore/Warehouses/r-warehouse/index.vue"),
        meta: { role: ["40", "1000", "2000"] } 
      },
      { 
        path: "warehouses/input", 
        name: "Kirim qilish", 
        component: () => import("../pages/Explore/Warehouses/input/index.vue"),
        meta: { role: ["40", "1000", "2000"] } 
      },
      { 
        path: "warehouses/inventory", 
        name: "Rivizya", 
        component: () => import("../pages/Explore/Warehouses/inventory/index.vue"), 
        meta: { role: ["40", "1000", "2000"] } 
      },

      //Taminot
       { 
        path: "supply/counterparty", 
        name: "Kontragentlar", 
        component: () => import("../pages/Explore/Supply/counterparty/index.vue"),
        meta: { role: ["40", "1000", "2000"] } 
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("../pages/Explore/NotFound/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});



router.beforeEach((to, from, next) => {
  const token = Cookies.get("token");

  // 1. Kirish majburiy bo'lgan sahifalar uchun
  if (to.meta.requiresAuth && !token) {
    return next({ name: "Login" });
  }

  // 2. Login qilgan foydalanuvchini Login sahifasiga qaytarmaslik
  if (to.meta.guestOnly && token) {
    return next({ name: "Explore" });
  }

  // 3. Rol tekshiruvi
  if (token) {
    try {
      const decoded = jwtDecode(token);
      // Tokendan kelgan rollarni string massiviga aylantiramiz
      const userRoles = Array.isArray(decoded.roles) ? decoded.roles.map(String) : [];

      if (to.meta.role) {
        // Meta dagi rolni massiv holatiga keltiramiz (xoh string bo'lsin, xoh massiv)
        const requiredRoles = Array.isArray(to.meta.role) ? to.meta.role.map(String) : [String(to.meta.role)];
        
        // Foydalanuvchi rollaridan biri kutilayotgan rollar ichida bormi?
        const hasAccess = requiredRoles.some(r => userRoles.includes(r));

        if (!hasAccess) {
          console.warn("Ruxsat etilmadi: Rol mos kelmadi");
          return next({ name: "Explore" }); // Ruxsat bo'lmasa asosiy sahifaga
        }
      }
    } catch (e) {
      console.error("JWT Decode error:", e);
      Cookies.remove("token");
      return next({ name: "Login" });
    }
  }

  next();
});

export default router;