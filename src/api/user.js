import request from '@/utils/request'

// 登录
export function login(data) {
    return request({
        url: '/client/user/login',
        method: 'post',
        data: data
    })
}

// 注册
export function register(data) {
    return request({
        url: '/client/user/register',
        method: 'post',
        data: data
    })
}

// 获取当前登录用户信息
export function getUserInfo() {
    return request({
        url: '/client/user/getUserInfo',
        method: 'get'
    })
}
