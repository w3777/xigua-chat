import Cookies from 'js-cookie'

const TokenKey = 'xigua-token'

const ExpiresInKey = 'Admin-Expires-In'

export function getToken() {
    return Cookies.get(TokenKey)
}

export function setToken(token) {
    return Cookies.set(TokenKey, token)
}

export function removeToken(key) {
    return Cookies.remove(key)
}

export function getExpiresIn() {
    return Cookies.get(ExpiresInKey) || -1
}

export function setExpiresIn(time) {
    return Cookies.set(ExpiresInKey, time)
}

export function removeExpiresIn() {
    return Cookies.remove(ExpiresInKey)
}
