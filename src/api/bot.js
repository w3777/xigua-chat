import request from '@/utils/request'

// 创建机器人
export function createBot(data) {
    return request({
        url: '/client/bot/createBot',
        method: 'post',
        data: data
    })
}
