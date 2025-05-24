
export function get(key) {
    return localStorage.getItem(key)
}

export function set(key, value) {
    localStorage.setItem(key, value)
}

export function remove(key) {
    localStorage.removeItem(key)
}

export function clear() {
    localStorage.clear()
}

// 扩展方法：存储对象（自动JSON序列化）
export function setObject(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

// 扩展方法：获取对象（自动JSON解析）
export function getObject(key) {
    const data = localStorage.getItem(key)
    if (data == null || data == 'undefined') {
        return null
    }
    return data ? JSON.parse(data) : null
}
