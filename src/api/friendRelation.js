import request from '@/utils/request'

// 发送好友请求
export function sendFriendRequest(data) {
    return request({
        url: 'client/friend/relation/sendFriendRequest',
        method: 'post',
        data: data
    })
}

// 接收好友请求
export function friendRequest() {
    return request({
        url: 'client/friend/relation/friendRequest',
        method: 'get'
    })
}

// 获取好友列表
export function getFriendList() {
    return request({
        url: 'client/friend/relation/getFriendList',
        method: 'get'
    })
}

// 好友验证
export function friendVerify(data) {
    return request({
        url: 'client/friend/relation/friendVerify',
        method: 'post',
        data: data
    })
}

// 好友详情
export function getFriendDetail(friendId) {
    return request({
        url: 'client/friend/relation/getFriendDetail?friendId=' + friendId,
        method: 'get'
    })
}
