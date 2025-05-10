import request from '@/utils/request'

// 发送邮箱
export function sendEmail(email) {
    return request({
        url: 'client/email/send',
        method: 'post',
        params: email
    })
}
