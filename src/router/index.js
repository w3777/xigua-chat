import { createRouter, createWebHistory } from 'vue-router';

// 引入组件
import Login from '@/views/Login.vue';
// import Chat from '@/views/Chat.vue';

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
    // {
    //     path: '/chat',
    //     name: 'Chat',
    //     component: Chat
    // },
    // 可以根据需要添加更多路由
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
