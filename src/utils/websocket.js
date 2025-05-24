import { getObject } from '@/utils/localStorage';
import { ElMessage } from 'element-plus';

/**
 * socketInstance全局一个实例，是模块级变量，但页面刷新会重置整个js环境
 * 刷新后 socketInstance 会被重新初始化为 null，而旧的连接已丢失
 * 如果组件初始化时工具类尚未被调用，getSocketInstance() 自然返回 null
 * 给getSocketInstance方法添加重试机制(1s → 2s → 5s)
 */

// 全局WebSocket实例
let socketInstance = null;
// 重试次数
let reconnectAttempts = 0;
// 最大重试次数
const MAX_RETRIES = 2;
// 重试间隔时间（毫秒）
const RETRY_DELAY = [2000, 2000, 5000];
// 重试定时器
let retryTimer = null;


export function connectWebSocket(callbacks = {}) {
    if (socketInstance && socketInstance.readyState === WebSocket.CONNECTING) {
        setTimeout(() => {
            checkConnectionTimeOut();
        }, 300);
    }

    if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
        return socketInstance;
    }

    const userInfo = getObject('userInfo');
    if (!userInfo || !userInfo.id) {
        console.log('未登录，无法连接 WebSocket');
        ElMessage.error({ message: '请先登录以接收新消息', plain: true });
        return null;
    }

    const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/client/connect/${userInfo.id}`;
    socketInstance = new WebSocket(wsUrl);

    socketInstance.onopen = () => {
        reconnectAttempts = 0;
        console.log('WebSocket 已连接');
        ElMessage.success({ message: '已连接消息服务，可接收新消息', plain: true });
        callbacks.onOpen?.();
    };

    socketInstance.onmessage = (event) => {
        callbacks.onMessage?.(event);
    };

    socketInstance.onclose = () => {
        console.log('WebSocket 已断开');
        socketInstance = null;
        callbacks.onClose?.();

        console.log('已主动断开，不再尝试连接');
        ElMessage.info({ message: '已主动断开实时消息服务', plain: true });
        return;
    };

    socketInstance.onerror = (error) => {
        console.error('WebSocket 出现错误:', error);
        socketInstance.close();
        ElMessage.error({ message: '连接消息服务时出现问题', plain: true });
    };

    return socketInstance;
}

/**
 * 获取当前 WebSocket 实例
 * @returns WebSocket|null
 */
export function getSocketInstance() {
    if (socketInstance?.readyState === WebSocket.OPEN) {
        return socketInstance;
    }

    if (socketInstance?.readyState === WebSocket.CONNECTING) {
        return socketInstance;
    }

    if(socketInstance == null){
        return checkConnectionTimeOut();
    }

    return socketInstance;
}

/**
 * 主动关闭 WebSocket 连接
 */
export function closeWebSocket() {
    if (socketInstance) {
        socketInstance.close();
    }
    clearTimeout(retryTimer);
    reconnectAttempts = 0;
}

function checkConnectionTimeOut() {
    if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
        return socketInstance;
    }
    if (reconnectAttempts <= MAX_RETRIES) {
        const delay = RETRY_DELAY[reconnectAttempts];
        reconnectAttempts++;
        console.log(`正在尝试重新连接...第${reconnectAttempts}次，等待${delay / 1000}秒`);
        ElMessage.warning({
            message: `消息服务暂时不可用，正在尝试重新连接...第${reconnectAttempts}次，等待${delay / 1000}秒`,
            plain: true
        })

        retryTimer = setTimeout(() => {
            connectWebSocket();
        }, delay);
    } else {
        closeWebSocket();
    }
}
