<template>
  <div class="wechat-app">
    <!-- 左侧菜单栏 -->
    <div class="menu-bar">
      <div class="user-avatar">
        <img
            :src="userInfo.avatar || defaultAvatar"
            @error="handleAvatarError"
            alt="头像"
            class="avatar-image"
        >
      </div>
      <div class="menu-item">
        <img src="@/static/icons/home.png" alt="首页" @click="goToHome" />
      </div>
      <div class="menu-item">
        <img src="@/static/icons/chat.png" alt="首页" @click="goToChat" />
      </div>
      <div class="menu-item">
        <img src="@/static/icons/friend.png" alt="好友" @click="goToFriend" />
      </div>
      <div class="menu-item">
        <i class="icon-discover">🌍</i>
      </div>
      <div class="menu-item">
        <i class="icon-moments">📱</i>
      </div>
      <div class="menu-item">
        <img src="@/static/icons/my.png" alt="我的" @click="goToProfile" />
      </div>
      <div class="menu-item settings" @click.stop="openSettingsMenu">
        <i class="icon-settings">⚙️</i>
        <!-- 新增：设置菜单（固定在底部） -->
        <div v-if="showSettingsMenu" class="settings-menu">
          <div class="setting-item" @click="logout">退出登录</div>
        </div>
      </div>
    </div>

    <!-- 中间动态内容区域 -->
    <div class="content-area">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import {removeToken} from "@/utils/auth.js";
import { getUserInfo } from '@/api/user'
import defaultAvatar from '@/static/images/user_default.png'
import router from "@/router";
import {closeWebSocket, connectWebSocket} from '@/utils/websocket';
import { setObject, remove } from '@/utils/localStorage';

export default {
  name: 'WeChatApp',
  mounted() {
    this.fetchUserInfo().then(() => {
      // 初始化WebSocket连接
      this.initWebSocket();
    })
  },
  data() {
    return {
      userInfo: {}, // 存储用户信息
      defaultAvatar: defaultAvatar, // 默认头像路径
      showSettingsMenu: false,
      webSocket: null,
    }
  },
  methods: {
    // 切换到不同的视图
    setCurrentView(view) {
      console.log('切换到：', view)
      this.currentView = view
    },

    // 跳转到个人资料
    goToProfile() {
      this.$router.push('/profile')
    },

    // 跳转到首页
    goToHome() {
      this.$router.push('/home')
    },

    // 跳转到聊天
    goToChat() {
      this.$router.push('/chat')
    },

    // 打开/关闭设置菜单
    openSettingsMenu() {
      this.showSettingsMenu = !this.showSettingsMenu;
    },

    // 退出登录
    logout() {
      removeToken();
      this.closeWebSocket();
      remove('userInfo');
      router.push('/login');
    },

    // 获取用户信息
    async fetchUserInfo() {
      const res = await getUserInfo()
      // 当前用户信息存储在localStorage中
      setObject('userInfo', res.data)
      this.userInfo = res.data || {}
    },

    // 跳转到好友
    goToFriend() {
      this.$router.push('/friend')
    },

    initWebSocket() {
      // 防止重复连接
      if (this.webSocket) return;

      this.webSocket = connectWebSocket({
        onOpen: () => {
          console.log('WebSocket连接成功');
          // 可以发送初始化消息，如用户身份验证
          // this.webSocket.send(JSON.stringify({}));
        },
        onMessage: (event) => {
          const data = JSON.parse(event.data);
          // this.handleWebSocketMessage(data);
        },
        onClose: () => {
          console.log('WebSocket连接关闭');
          this.webSocket = null;
          // 可以尝试重连
          setTimeout(() => this.initWebSocket(), 5000);
        },
        onError: (error) => {
          console.error('WebSocket错误:', error);
        }
      });
    },

    closeWebSocket() {
      console.log('WebSocket连接关闭')
      if (this.webSocket) {
        closeWebSocket()
      }
    },

    handleWebSocketMessage(data) {
      switch(data.type) {
        case 'notification':
          this.showNotification(data.message);
          break;
        case 'message':
          this.handleNewMessage(data);
          break;
          // 其他消息类型处理...
      }
    },

    showNotification(message) {
      // 实现通知显示逻辑
      console.log('收到通知:', message);
    },

    handleNewMessage(message) {
      // 处理新消息
      console.log('收到新消息:', message);
    }
  },
  beforeDestroy() {
    this.closeWebSocket();
  }
}
</script>

<style scoped>
.wechat-app {
  display: flex;
  width: 1000px;
  height: 650px;
  margin: 0 auto;
  border: 1px solid #ddd;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 左侧菜单栏样式 */
.menu-bar {
  width: 70px;
  background: #2E2E2E;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 4px;
  margin-bottom: 30px;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.menu-item {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7D7D7D;
  margin-bottom: 15px;
  cursor: pointer;
}

.menu-item.active {
  color: #07C160;
  border-left: 3px solid #07C160;
}

.menu-item.settings {
  margin-top: auto;
  margin-bottom: 20px;
}

/* 左侧联系人列表样式 */
.contact-list {
  width: 30%;
  background: #eee;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.search-bar input {
  flex: 1;
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  background: white;
  outline: none;
}

.search-bar .back-btn {
  margin-left: 10px;
  font-size: 20px;
  cursor: pointer;
}

.contact {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
}

.contact.active {
  background: #d9d9d9;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #07C160;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.info {
  flex: 1;
  overflow: hidden;
}

.name {
  font-size: 16px;
  margin-bottom: 4px;
  text-align: left;
}

.last-msg {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.time {
  font-size: 12px;
  color: #888;
  margin-left: 10px;
}

/* 右侧聊天窗口样式 */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  height: 50px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.chat-title {
  font-size: 18px;
  flex: 1;
  text-align: left;
}

.chat-actions {
  cursor: pointer;
}

.messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f5f5f5;
  background-image: url('@/static/images/background.png');
  background-size: cover;
  background-position: center;
}

.message {
  margin-bottom: 15px;
  max-width: 70%;
  display: flex;
}

.message.received {
  align-self: flex-start;
}

.message.sent {
  margin-left: auto;
  justify-content: flex-end;
}

.message .content {
  padding: 10px 15px;
  border-radius: 4px;
  display: inline-block;
  position: relative;
}

.message.received .content {
  background: white;
  border: 1px solid #e5e5e5;
}

.message.sent .content {
  background: #95EC69;
}

.input-tools {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 8px;
}

.left-tools {
  display: flex;
}

.icon-tool {
  margin-right: 15px;
  font-size: 20px;
  cursor: pointer;
  color: #7d7d7d;
}

.right-tools {
  margin-right: 0;
}

.input-row {
  display: flex;
  width: 100%;
}

.input-row input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  outline: none;
}

.input-row button {
  margin-left: 8px;
  padding: 0 12px;
  background: #07C160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-container {
  padding: 10px;
  background: #f5f5f5;
  border-top: 1px solid #e6e6e6;
}

.toolbar {
  margin-bottom: 8px;
  overflow: hidden; /* 清除浮动 */
}

.tool-icon {
  margin-right: 15px;
  font-size: 20px;
  cursor: pointer;
}

.input-row {
  display: flex;
}

.input-row input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  outline: none;
}

.send-btn {
  margin-left: 8px;
  padding: 0 15px;
  background: #07C160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.content-area {
  flex: 1;
  display: flex;
}

.main-content {
  display: flex;
  flex: 1;
}

.settings {
  position: relative;
}

.settings-menu {
  position: absolute;
  bottom: 50px;  /* 上移10px */
  left: 10px;
  width: 120px;  /* 宽度缩小 */
  background: #fff;
  border-radius: 6px;  /* 圆角缩小 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);  /* 阴影变淡 */
  padding: 6px 0;  /* 内边距缩小 */
  z-index: 100;
  animation: menu-fade 0.2s ease-out;
}

@keyframes menu-fade {
  from {
    opacity: 0;
    transform: translateY(5px);  /* 动画幅度减小 */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.setting-item {
  padding: 8px 12px;  /* 内边距缩小 */
  font-size: 13px;  /* 字体缩小 */
  color: #333;
  cursor: pointer;
  transition: all 0.15s;  /* 动画加快 */
  text-align: center;
  margin: 0;
  line-height: 1.4;  /* 行高优化 */
}

.setting-item:hover {
  background-color: #f5f5f5;  /* 悬停色变浅 */
}

/* 保持齿轮图标基础样式 */
.menu-item.settings {
  margin-top: auto;
  margin-bottom: 15px;  /* 底部间距减小 */
}
</style>
