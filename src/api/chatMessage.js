import request from '@/utils/request'

// 获取最后几条聊天记录
export function getFriendLastMes(data) {
    return request({
        url: '/center/chat/message/getFriendLastMes',
        method: 'post',
        data: data
    })
}

// 分页获取好友历史消息
export function getHistoryMes(data) {
    return request({
        url: '/center/chat/message/getHistoryMes',
        method: 'post',
        data: data
    })
}
