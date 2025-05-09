import { createRouter, createWebHistory } from 'vue-router';

// 引入组件
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
