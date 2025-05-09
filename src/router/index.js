import { createRouter, createWebHistory } from 'vue-router';

// 引入组件
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Chat from '@/views/Chat.vue';

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
    },
    {
        path: '/chat',
        name: 'Chat',
        component: Chat
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
