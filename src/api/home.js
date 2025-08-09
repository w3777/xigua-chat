import request from '@/utils/request'

// 获取首页统计信息
export function getHomeCount() {
    return request({
        url: '/client/home/getHomeCount',
        method: 'get',
    })
}
