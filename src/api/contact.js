import request from '@/utils/request'

// 获取联系人数量
export function getContactCount() {
    return request({
        url: '/client/contact/getContactCount',
        method: 'get',
    })
}

// 获取好友列表
export function getFriendList() {
    return request({
        url: '/client/contact/getFriendList',
        method: 'get',
    })
}

// 获取群聊列表
export function getGroupList() {
    return request({
        url: '/client/contact/getGroupList',
        method: 'get',
    })
}

// 获取发送好友申请列表
export function getSendFriendRequestList() {
    return request({
        url: '/client/contact/getSendFriendRequestList',
        method: 'get',
    })
}

// 获取接收好友申请列表
export function getReceiveFriendRequestList() {
    return request({
        url: '/client/contact/getReceiveFriendRequestList',
        method: 'get',
    })
}
