import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import axios from 'axios';

// 创建 Vue 应用实例
const app = createApp(App);

// 注册路由和 ElementPlus 插件
app.use(router);
app.use(ElementPlus);

// 将 Axios 设置为全局可用
app.config.globalProperties.$axios = axios;

// 挂载 Vue 应用实例
app.mount('#app');
