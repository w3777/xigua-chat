import request from '@/utils/request'

// 根据ip获取地址
export function getLocation() {
    return request({
        url: 'client/thirdParty/getLocation',
        method: 'get'
    })
}

// 根据城市获取天气
export function getWeather(city) {
    return request({
        url: 'client/thirdParty/getWeather?city=' + city,
        method: 'post'
    })
}
