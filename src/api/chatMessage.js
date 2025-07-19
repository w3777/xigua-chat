import request from '@/utils/request'

// 获取最后几条聊天记录
export function getLastMes(data) {
    return request({
        url: '/center/chat/message/getLastMes',
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
