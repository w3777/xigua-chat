import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Index from '@/views/Index.vue';
import Chat from '@/views/Chat.vue';
import Profile from '@/views/Profile.vue';
import Home from '@/views/Home.vue';
import Friend from '@/views/Friend.vue';

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
        path: '/',
        name: 'Index',
        component: Index,
        children: [
            {
                path: '', // 默认子路由
                redirect: 'home'
            },
            {
                path: 'home',
                name: 'Home',
                component: Home
            },
            {
                path: 'chat',
                name: 'Chat',
                component: Chat
            },
            {
                path: 'profile',
                name: 'Profile',
                component: Profile
            },
            {
                path: 'friend',
                name: 'Friend',
                component: Friend
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
