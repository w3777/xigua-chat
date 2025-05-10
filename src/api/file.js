import request from '@/utils/request'

// 上传文件
export function uploadFile(file) {
    return request({
        url: 'client/file/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: {'file': file}
    })
}
