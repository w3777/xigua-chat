import { getObject } from '@/utils/localStorage';
import { ElMessage } from 'element-plus';

/**
 * WebSocket 连接管理类（封装版）
 * 提供一个统一的消息订阅/取消订阅接口
 */

// 全局 WebSocket 实例
let socketInstance = null;
// 重试次数
let reconnectAttempts = 0;
// 最大重试次数
const max_retries = 2;
// 重试间隔时间（毫秒）
const retry_delay = [2000, 2000, 5000];
// 重试定时器
let retryTimer = null;
// 存储所有的消息订阅者
const messageListeners = new Set();

/**
 * WebSocket 客户端连接管理类
 */
class WebSocketClient {
    constructor() {
        // 保证只初始化一次
        if (!socketInstance) {
            this.initWebSocket();
        }
    }

    /**
     * 初始化 WebSocket 连接
     */
    initWebSocket() {
        const userInfo = getObject('userInfo');
        if (!userInfo || !userInfo.id) {
            console.log('未登录，无法连接 WebSocket');
            ElMessage.error({ message: '请先登录以接收新消息', plain: true });
            return;
        }

        const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/client/connect/${userInfo.id}`;
        socketInstance = new WebSocket(wsUrl);

        socketInstance.onopen = () => {
            reconnectAttempts = 0;
            console.log('WebSocket 已连接');
            ElMessage.success({ message: '已连接消息服务，可接收新消息', plain: true });
        };

        // 将收到的消息分发给所有订阅者
        socketInstance.onmessage = (event) => {
            messageListeners.forEach(listener => {
                listener(event.data); // 将消息传递给所有监听的函数
            });
        };

        socketInstance.onclose = () => {
            console.log('WebSocket 已断开');
            socketInstance = null;
            console.log('已主动断开，不再尝试连接');
            ElMessage.info({ message: '已主动断开实时消息服务', plain: true });
            return;
        };

        socketInstance.onerror = (error) => {
            console.error('WebSocket 出现错误:', error);
            socketInstance.close();
            ElMessage.error({ message: '连接消息服务时出现问题', plain: true });
        };
    }

    /**
     * 发送消息到 WebSocket
     * @param {string} message 要发送的消息
     */
    sendMessage(message) {
        // 如果 WebSocket 连接已建立，发送消息
        if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
            socketInstance.send(message);
        } else {
            console.log('WebSocket 未连接，无法发送消息');
        }
    }

    /**
     * 订阅消息
     * @param {Function} listener 消息处理函数
     */
    subscribe(listener) {
        messageListeners.add(listener);
    }

    /**
     * 取消订阅消息
     * @param {Function} listener 消息处理函数
     */
    unsubscribe(listener) {
        messageListeners.delete(listener);
    }

    /**
     * 主动关闭 WebSocket 连接
     */
    close() {
        if (socketInstance) {
            socketInstance.close();
        }
        clearTimeout(retryTimer);
        reconnectAttempts = 0;
    }

    /**
     * 获取当前 WebSocket 实例
     * @returns WebSocket|null
     */
    getInstance() {
        this.checkConnection();

        return socketInstance;
    }

    checkConnection(){
        if(socketInstance == null){
            this.reconnect();
        }
    }

    /**
     * 重新连接 WebSocket
     * 内部判断并管理重试机制
     */
    reconnect() {
        if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
            return; // 如果已连接则不需要重连
        }

        if (reconnectAttempts < max_retries) {
            const delay = retry_delay[reconnectAttempts];
            reconnectAttempts++;
            console.log(`正在尝试重新连接...第${reconnectAttempts}次，等待${delay / 1000}秒`);
            ElMessage.warning({
                message: `消息服务暂时不可用，正在尝试重新连接...第${reconnectAttempts}次，等待${delay / 1000}秒`,
                plain: true
            });

            retryTimer = setTimeout(() => {
                this.initWebSocket(); // 重新初始化连接
            }, delay);
        } else {
            console.log('达到最大重试次数，停止重试');
            this.close(); // 达到最大重试次数，关闭连接
        }
    }
}

/**
 * 单例模式，确保 WebSocketClient 只会被初始化一次
 */
const webSocketClient = new WebSocketClient();

/**
 * 获取 WebSocket 客户端管理实例
 */
export function getWebSocketClient() {
    return webSocketClient;
}

/**
 * 获取当前 WebSocket 实例
 * @returns WebSocket|null
 */
export function getSocketInstance() {
    return webSocketClient.getInstance();
}

