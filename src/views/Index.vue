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
      <div class="menu-item" :class="{ active: activeMenu === 'home' }" @click="goToHome">
        <img src="@/static/icons/home.png" alt="首页"  />
      </div>
      <div class="menu-item" :class="{ active: activeMenu === 'chat' }" @click="goToChat">
        <img src="@/static/icons/chat.png" alt="聊天" @click="goToChat" />
      </div>
      <div class="menu-item" :class="{ active: activeMenu === 'friend' }" @click="goToFriend">
        <img src="@/static/icons/friend.png" alt="好友" @click="goToFriend" />
        <span v-if="unreadCount.friend > 0" class="menu-badge">{{ unreadCount.friend }}</span>
      </div>
      <div class="menu-item">
        <i class="icon-discover">🌍</i>
      </div>
      <div class="menu-item">
        <i class="icon-moments">📱</i>
      </div>
      <div class="menu-item" :class="{ active: activeMenu === 'profile' }" @click="goToProfile">
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
      <router-view @menu-change="handleMenuChange" @clear-unread="clearUnread"></router-view>
    </div>
  </div>
</template>

<script>
import {removeToken} from "@/utils/auth.js";
import { getUserInfo } from '@/api/user'
import defaultAvatar from '@/static/images/user_default.png'
import router from "@/router";
import {closeWebSocket, connectWebSocket, getSocketInstance} from '@/utils/websocket';
import {remove, get, set, getObject, clear} from '@/utils/localStorage';

export default {
  name: 'WeChatApp',
  mounted() {
    // 从localStorage中获取用户信息
    const userInfo = getObject('userInfo')
    this.userInfo = userInfo || {}
    this.initWebSocket();
  },
  beforeDestroy() {
    this.closeWebSocket();
  },
  watch: {
    $route(route) {
      const activeMenu = get('activeMenu');
      if (activeMenu) {
        this.activeMenu = activeMenu;
        set('activeMenu', this.activeMenu);
      }
    }
  },
  data() {
    return {
      userInfo: {}, // 存储用户信息
      defaultAvatar: defaultAvatar, // 默认头像路径
      showSettingsMenu: false,
      webSocket: null,
      // 默认首页
      activeMenu: 'home',
      // 未读消息计数
      unreadCount: {
        home: 0,
        chat: 0,
        friend: 1,
        discover: 0,
        moments: 0,
        profile: 0
      }
    }
  },
  created() {
    const activeMenu = get('activeMenu');
    if (activeMenu) {
      this.activeMenu = activeMenu;
    } else {
      // 默认值
      this.activeMenu = 'home';
    }
  },
  methods: {
    // 跳转到个人资料
    goToProfile() {
      this.goToPage('profile')
    },

    // 跳转到首页
    goToHome() {
      this.goToPage('home')
    },

    // 跳转到聊天
    goToChat() {
      this.goToPage('chat')
    },

    // 跳转到好友
    goToFriend() {
      this.goToPage('friend')
    },

    goToPage(menu) {
      this.activeMenu = menu;
      set('activeMenu', this.activeMenu);
      this.$router.push('/' + menu);
    },

    // 打开/关闭设置菜单
    openSettingsMenu() {
      this.showSettingsMenu = !this.showSettingsMenu;
    },

    // 退出登录
    logout() {
      removeToken();
      this.closeWebSocket();
      clear();
      router.push('/login');
    },

    initWebSocket() {
      // 防止重复连接
      if (this.webSocket) return;
      this.webSocket = connectWebSocket();
    },

    // 关闭WebSocket连接
    closeWebSocket() {
      closeWebSocket()
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
    },

    // 接收子组件的菜单变更事件
    handleMenuChange(menuName) {
      this.activeMenu = menuName
    },

    // 清除某个菜单的未读计数
    clearUnread(menuName) {
      if (this.unreadCount[menuName] > 0) {
        this.unreadCount[menuName] = 0
      }
    }
  },
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
  position: relative;
  transition: all 0.3s ease;
  position: relative;
}

.menu-item.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background-color: #07C160;
  border-radius: 0 3px 3px 0;
}

.menu-item.active img {
  filter: brightness(1.2);
}

/* 悬停效果 */
.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.menu-item:hover img {
  transform: scale(1.1);
}

.menu-item img {
  transition: all 0.3s ease;
}

.menu-item.settings {
  margin-top: auto;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  background: white;
  outline: none;
}

.content-area {
  flex: 1;
  display: flex;
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

/* 新增小红点样式 */
.menu-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: #f44336;
  color: white;
  border-radius: 8px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

/* 小红点呼吸动画 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
