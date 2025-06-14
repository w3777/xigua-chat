import request from '@/utils/request'


// 获取当前登录用户信息
export function getUserInfo() {
    return request({
        url: '/client/user/getUserInfo',
        method: 'get'
    })
}

// 上传头像
export function uploadAvatar(data) {
    return request({
        url: '/client/user/uploadAvatar?avatar=' + data,
        method: 'post'
    })
}

// 更新用户信息
export function updateUserInfo(data) {
    return request({
        url: '/client/user/updateUserInfo',
        method: 'post',
        data: data
    })
}

// 根据用户名查询用户列表
export function getListByName(username) {
    return request({
        url: '/client/user/getListByName?username=' + username,
        method: 'post',
    })
}
