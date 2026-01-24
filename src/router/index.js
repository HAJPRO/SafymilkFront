import { createRouter, createWebHistory,createWebHashHistory } from "vue-router";
import ExploreLayout from "../layouts/ExploreView.vue";
import LandingLayout from "../layouts/LandingView.vue";
import { jwtDecode } from "jwt-decode"; 

const routes = [
  {
    path: "/",
    name: "home",
    component: LandingLayout,
    meta: { guestOnly: true },
    children: [
      { path: "", name: "landingPage", component: () => import("../pages/Landing/Login.vue") },
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
  path: '/supply',
  component: () => import('../pages/Explore/Supply/rawmaterial/index.vue'),
  children: [
    {
      path: 'rawmaterial', // Default holatda list ochiladi
      name: 'Xomashyolar',
      component: () => import('../components/Supply/rawmaterial/Tabel.vue')
    },
    {
      path: 'inbound/historys',
      name: `Xomashyo kirim ro'yxati_1`,
      component: () => import('../components/Supply/inboundhistorys/Table.vue')
    },
    {
      path: 'inbound/input',
      name: 'Xomashyo kirim qilish',
      component: () => import('../components/Supply/inbound/Inbound.vue')
    },
     
  ],
},
{ 
        path: "counterparty", 
        name: "Kontragentlar", 
        component: () => import("../pages/Explore/Supply/counterparty/index.vue"),
        meta: { role: ["40", "1000", "2000"] } 
      },

      {
  path: '/supply/accessories',
  component: () => import('../pages/Explore/Supply/accessories/index.vue'),
  children: [
    {
      path: 'list', // Default holatda list ochiladi
      name: 'Aksesuarlar',
      component: () => import('../components/Supply/accessories/Tabel.vue')
    },
    {
      path: 'inventory',
      name: `Kirim ro'yxati`,
      component: () => import('../components/Supply/inboundhistorys/Table.vue')
    },
    {
      path: 'add',
      name: 'Kirim qilish',
      component: () => import('../components/Supply/accessories/InputAccessory.vue')
    }
  ]
},

      // Laboratory
     {
path: '/laboratory',
  component: () => import('../pages/Explore/Laboratory/analitic/index.vue'),
  children: [
    {
      path: 'rawmaterial', // Default holatda list ochiladi
      name: `Xomashyo kirim ro'yxati`,
      component: () => import('../components/Supply/inboundhistorys/Table.vue')
    },
    {
      path: 'analitic',
      name: `Analizlar ro'yxati`,
      component: () => import('../components/Laboratory/analitic/Table.vue')
    },
   
  ]
},
       // Settings
      { 
        path: "settings/label", 
        name: "Yorliq", 
        component: () => import("../pages/Explore/Settings/label/index.vue"),
        meta: { role: ["40", "1000", "2000"] } 
      },
       { 
        path: "laboratory/analitic", 
        name: "Laboratoriya analitik", 
        component: () => import("../pages/Explore/Laboratory/analitic/index.vue"),
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
  history: createWebHashHistory(),
  routes,
});



router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  // 1. Agar foydalanuvchi login qilmagan bo'lsa va himoyalangan sahifaga bormoqchi bo'lsa
  if (to.meta.requiresAuth && !token) {
    return next({ name: "Login" });
  }

  // 2. Agar foydalanuvchi login qilgan bo'lsa va Login sahifasiga bormoqchi bo'lsa
  if (to.meta.guestOnly && token) {
    // FAQAT login/register dan keyin yo'naltiradi
    return next({ name: "StatisticSale" }); 
  }

  // 3. Rol tekshiruvi (faqat token bo'lsa va borayotgan sahifada meta.role bo'lsa)
  if (token && to.meta.role) {
    try {
      const decoded = jwtDecode(token);
      
      // Muddati o'tganini tekshirish
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem("token");
        return next({ name: "Login" });
      }

      const userRoles = Array.isArray(decoded.roles) ? decoded.roles.map(String) : [String(decoded.roles)];
      const requiredRoles = Array.isArray(to.meta.role) ? to.meta.role.map(String) : [String(to.meta.role)];
      
      const hasAccess = requiredRoles.some(role => userRoles.includes(role));

      if (!hasAccess) {
        return next({ name: "notfound" });
      }
    } catch (e) {
      localStorage.removeItem("token");
      return next({ name: "Login" });
    }
  }

  // Boshqa barcha holatlarda davom etish
  next();
});

export default router;