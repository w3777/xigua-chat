import request from '@/utils/request'

// 上传文件
export function createGroup(data) {
    return request({
        url: '/client/group/createGroup',
        method: 'post',
        data: data
    })
}
