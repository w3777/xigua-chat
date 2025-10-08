import request from '@/utils/request'

// 创建机器人
export function createBot(data) {
    return request({
        url: '/client/bot/createBot',
        method: 'post',
        data: data
    })
}

// 获取机器人详情
export function getBotDetail(botId) {
    return request({
        url: '/client/bot/getBotDetail?botId=' + botId,
        method: 'post',
    })
}
