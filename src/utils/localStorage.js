
export function get(key) {
    return localStorage.getItem(key)
}

export function set(key, value) {
    localStorage.setItem(key, value)
}

export function remove(key) {
    localStorage.removeItem(key)
}

// 扩展方法：存储对象（自动JSON序列化）
export function setObject(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

// 扩展方法：获取对象（自动JSON解析）
export function getObject(key) {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
}
