import request from '@/utils/request'

// 登录
export function login(data) {
    return request({
        url: '/sso/auth/login',
        method: 'post',
        data: data
    })
}

// 注册
export function register(data) {
    return request({
        url: '/sso/auth/register',
        method: 'post',
        data: data
    })
}

// ticket兑换token
export function redeemToken(data) {
    return request({
        url: '/sso/auth/redeemToken?ticket=' + data,
        method: 'get'
    })
}
