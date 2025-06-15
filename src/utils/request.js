import axios from 'axios'
import { ElNotification , ElMessageBox, ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import router from '@/router'

// 是否显示重新登录
export let isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    baseURL: import.meta.env.VITE_APP_BASE_API,
    // 超时
    timeout: 100000
})

// request拦截器
service.interceptors.request.use(config => {
    // 定义不需要token的白名单路径
    const whiteList = ['/sso/auth/login', '/sso/auth/register', '/client/email/send']; // 根据实际路由调整
    let token = '';

    // 检查当前请求是否在白名单中
    const isWhiteList = whiteList.some(path => config.url.includes(path));

    // 如果需要token（不在白名单中）
    if (!isWhiteList) {
        if(config.url.includes('redeemToken')){
            token = getToken('sso-token');
            // 添加token到请求头
            config.headers['sso-token'] = token;
        }else{
            token = getToken('xigua-token');
            // 添加token到请求头
            config.headers['xigua-token'] = token;
        }

        if (!token) {
            // 如果未登录且不是白名单路由，跳转到登录页
            window.location.href = `${import.meta.env.VITE_SSO_AUTH_URL}`;
            return Promise.reject(new Error('请先登录'));
        }
    }

    // get请求映射params参数
    if (config.method === 'get' && config.params) {
        let url = config.url + '?' + tansParams(config.params);
        url = url.slice(0, -1);
        config.params = {};
        config.url = url;
    }else if (config.method === 'post') {
        config.data = config.data || {};
    }
    return config
}, error => {
    Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
        // 未设置状态码则默认成功状态
        const code = res.data.code || 200;
        // 获取错误信息
        const msg = errorCode[code] || res.data.msg || errorCode['default']
        // 二进制数据则直接返回
        if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
            return res.data
        }
        if (code === 401) {
            removeToken()
            window.location.href = `${import.meta.env.VITE_SSO_AUTH_URL}`;
            return Promise.reject('登录已过期，请重新登录')
        } else if (code === 500) {
            ElMessage({ message: msg, type: 'error' })
            return Promise.reject(new Error(msg))
        } else if (code === 601) {
            ElMessage({ message: msg, type: 'warning' })
            return Promise.reject(new Error(msg))
        } else if (code !== 200) {
            ElNotification.error({ title: msg })
            return Promise.reject('error')
        } else {
            return  Promise.resolve(res.data)
        }
    },
    error => {
        console.log('err' + error)
        let { message } = error;
        if (message == "Network Error") {
            message = "后端接口连接异常";
        } else if (message.includes("timeout")) {
            message = "系统接口请求超时";
        } else if (message.includes("Request failed with status code")) {
            message = "系统接口" + message.substr(message.length - 3) + "异常";
        }
        ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
        return Promise.reject(error)
    }
)

export default service;

function tansParams(params) {
    return Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');
}
