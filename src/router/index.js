import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Index from '@/views/Index.vue';
import Chat from '@/views/Chat.vue';
import Profile from '@/views/Profile.vue';
import Home from '@/views/Home.vue';
import Friend from '@/views/Friend.vue';
import Friend2 from '@/views/Friend2.vue';
import { getCookie } from '@/utils/cookie.js';
import { redeemToken } from '@/api/auth.js';
import { setToken } from '@/utils/auth.js';
import {getUserInfo,} from "@/api/user.js";
import {setObject} from "@/utils/localStorage.js";
import {getWebSocketClient} from "@/ws/WebSocketClient.js";

const routes = [
    {
        path: '/',
        redirect: '/home'
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
            {
                path: 'friend2',
                name: 'Friend2',
                component: Friend2
            }
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

    // 本地未登录时的处理,去认证中心登录
    if (!localToken) {
        // 获取back和ticket
        const url = new URL(fullPath, window.location.origin);
        const rawBack = url.searchParams.get('back') || null;

        // 未登录 && 没用返回back页面
        if (rawBack == null) {
            // 带着当前页面，跳转到认证中心
            const callbackUrl = `${window.location.origin}?back=${encodeURIComponent(fullPath)}`
            window.location.href = `${import.meta.env.VITE_SSO_AUTH_URL}?redirect=${encodeURIComponent(callbackUrl)}`
            return
        }
        const back = rawBack.split('?')[0] || null;
        const backQuery = rawBack.split('?')[1] || null;
        const ticket = new URLSearchParams(backQuery).get('ticket') || null;

        // 如果是SSO回调页面（携带ticket）
        if (back != null && ticket != null) {
            // 用ticket兑换token
            await redeemToken(ticket).then(async res => {
                if (res.code != 200) {
                    return next('/home')
                }
                setToken(res.data)

                // 调用当前用户接口 缓存当前用户信息
                const userInfoRes = await getUserInfo()
                if (userInfoRes.code != 200) {
                    this.$message.error('获取用户信息失败：' + userInfoRes.data.msg);
                }
                setObject('userInfo', userInfoRes.data)

                // 连接websocket
                getWebSocketClient().connect();
            })

            // 跳转到back
            return next(back)
        }
    }

    // 默认放行
    next()
})
export default router;
