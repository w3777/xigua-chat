import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Index from '@/views/Index.vue';
import Chat from '@/views/Chat.vue';
import Profile from '@/views/Profile.vue';
import Home from '@/views/Home.vue';
import Friend from '@/views/Friend.vue';
import { getCookie } from '@/utils/cookie.js';

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { noAuth: true } // 标记为不需要认证
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { noAuth: true } // 标记为不需要认证
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
            },
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
    const toPath = to.path;
    const fullPath = to.fullPath;
    // 不需要认证的路由直接放行（如注册页等）
    if (to.meta.noAuth) return next()

    // 检查本地是否存在登录凭证
    const localToken = getCookie('xigua-token')

    // 如果本地已登录, 直接放行
    if (localToken) {
        return next();
    }

    // 本地未登录时跳转到登录页
    if (!localToken) {
        return next('/login');
    }

    // 默认放行
    next()
})
export default router;
