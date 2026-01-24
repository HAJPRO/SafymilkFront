import { createApp } from "vue";
import { createPinia } from "pinia";
import AppGuard from './Guard/AppGuard.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';  // faqat 1 marta import qilamiz
import en from 'element-plus/es/locale/lang/en';

import QrReader from 'vue3-qr-reader';
import toast from "vue3-toastify";
import Loading from 'vue-loading-overlay';

import router from "./router/index.js";
import App from "./App.vue";
import "./css/style.css";

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(ElementPlus, { locale: en });
app.use(QrReader);
app.use(toast);
app.use(Loading);
app.component('AuthGuard', AppGuard);
// Element Plus ikonalarni global ro‘yxatga olish
Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
    app.component(key, component);
});

app.mount("#app");
