import request from '@/utils/request'

// 获取最后几条聊天记录
export function getLastChat(topUserId) {
    return request({
        url: '/client/chat/message/getLastChat?topUserId=' + topUserId,
        method: 'get'
    })
}
