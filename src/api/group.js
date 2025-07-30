import request from '@/utils/request'

// 创建群组
export function createGroup(data) {
    return request({
        url: '/client/group/createGroup',
        method: 'post',
        data: data
    })
}

// 获取群组详情
export function getGroupDetail(groupId) {
    return request({
        url: '/client/group/getGroupDetail?groupId=' + groupId,
        method: 'get',
    })
}
