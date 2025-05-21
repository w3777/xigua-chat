import request from '@/utils/request'

// 获取最后几条聊天记录
export function getFriendLastMes(data) {
    return request({
        url: '/center/chat/message/getFriendLastMes',
        method: 'post',
        data: data
    })
}
