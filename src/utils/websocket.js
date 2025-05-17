import { getObject } from '@/utils/localStorage';
let socketInstance = null;

export function connectWebSocket(callbacks = {}) {
    // 如果已有连接且状态为OPEN，直接返回
    if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
        return socketInstance;
    }

    // 创建新连接
    const userInfo = getObject('userInfo');
    if (userInfo == null || userInfo.id == null) {
        console.log('未登录');
        return null;
    }
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL;
    const wsUrl = wsBaseUrl + `/client/connect/` + userInfo.id;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WebSocket connected');
        callbacks.onOpen && callbacks.onOpen();
    };

    ws.onmessage = (event) => {
        callbacks.onMessage && callbacks.onMessage(event);
    };

    ws.onclose = () => {
        console.log('WebSocket closed');
        callbacks.onClose && callbacks.onClose();
        socketInstance = null;
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        callbacks.onError && callbacks.onError(error);
    };

    socketInstance = ws;
    return ws;
}

export function getSocketInstance() {
    return socketInstance;
}

export function closeWebSocket() {
    if (socketInstance) {
        socketInstance.close();
        socketInstance = null;
    }
}
