<template>
  <!-- 联系人列表 + 聊天窗口 -->
  <div class="main-content">
    <!-- 左侧联系人列表 -->
    <div class="friend-list">
      <div class="search-bar">
        <input type="text" placeholder="搜索">
        <span class="back-btn" @click="openAddFriend">+</span>
      </div>

      <div
          v-for="friend in friends"
          :key="friend.userId"
          class="friend"
          :class="{ active: currentFriend && currentFriend.userId === friend.userId }"
          @click="selectFriend(friend.userId)"
      >
        <div class="avatar">
          <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.username">
          <span v-else>{{ friend.username.charAt(0) }}</span>
        </div>
        <div class="info">
          <div class="name">{{ friend.username }}</div>
          <div class="last-msg">{{ friend.lastMessage }}</div>
        </div>
        <div class="friend-status">
          <span class="online-dot" :class="{ online: friend.isOnline }"></span>
          <span class="status-label">{{ friend.isOnline ? '在线' : '离线' }}</span>
        </div>
        <div class="time">{{ friend.time }}</div>
        <div v-if="friend.unread > 0" class="unread-badge">
          {{ friend.unread }}
        </div>
      </div>
    </div>

    <!-- 右侧聊天窗口 -->
    <div class="chat-window" v-show="showChatWindow">
      <!-- 聊天标题栏 -->
      <div class="chat-header">
        <div class="chat-title">{{ currentFriend.username || '' }}</div>
        <div class="chat-actions">
          <i class="close-chat" @click="closeChatWindow">×</i>
        </div>
      </div>

      <!-- 聊天内容区域 -->
      <div class="messages" ref="messagesContainer">
        <!-- 历史消息 -->
        <div
            v-for="message in friendHistoryMessage"
            :key="message.id"
            :class="['message', message.status, { 'sending': message.status === 'sending' }]"
        >
          <div class="content">
            {{ message.content }}
            <div class="message-status">
              <span class="time">{{ formatTime(message.timestamp) }}</span>
              <span v-if="message.status === 'sending'" class="sending-icon">🕒</span>
              <span v-else-if="message.status === 'sent'" class="read-icon">✓</span>
              <span v-else-if="message.status === 'read'" class="read-icon">✓✓</span>
            </div>
          </div>
        </div>
      </div>

      <div class="input-container">
        <div class="input-tools">
          <div class="left-tools">
            <i class="icon-tool">😊</i>
            <i class="icon-tool">📷</i>
          </div>
          <div class="right-tools">
            <i class="icon-tool">🎤</i>
            <i class="icon-tool">📹</i>
          </div>
        </div>

        <!-- 输入和发送行 -->
        <div class="input-row">
          <input
              type="text"
              v-model="newMessage"
              @keyup.enter="sendMessage"
              placeholder="发送消息"
          >
          <button class="send-btn" @click="sendMessage">发送(S)</button>
        </div>
      </div>
    </div>

    <!-- 个人资料组件 -->
    <AddFriend v-if="showAddFriend" @close="closeAddFriend" />
  </div>
</template>

<script>
import {removeToken} from "@/utils/auth.js";
import router from "@/router";
import AddFriend from "./AddFriend.vue";
import {getLastChat} from "@/api/chatMessage.js";
import {getSocketInstance} from '@/utils/websocket';
import {getObject} from '@/utils/localStorage.js'

export default {
  name: 'WeChatApp',
  mounted() {
    // 确保初始加载时路由到chat
    if (this.$route.path === '/') {
      this.$router.replace('/chat')
    }
  },
  components: {
    AddFriend
  },
  data() {
    return {
      // 添加好友对话框状态
      showAddFriend: false,
      // 顶部用户ID (其他页面带过来的)
      topUserId: null,
      friends: [],
      // 当前选中的好友
      currentFriend: {
        userId: '',
        username: '',
        avatar: '',
        lastMessage: ''
      },
      // 聊天窗口状态
      showChatWindow: false,
      friendHistoryMessage: [], // 存储聊天消息
      newMessage: '', // 输入框内容
      socket: null, // WebSocket实例
    }
  },
  created() {
    this.initWebSocket();

    // 通过其他页面直接跟好友聊天，聊天窗口设置为该好友
    this.topUserId = this.$route.query.friendId;
    if (this.topUserId !== null && this.topUserId !== undefined && this.topUserId !== '') {
      this.getLastChat(this.topUserId).then(() => {
        this.selectFriend(this.topUserId)
      })
    }

  },
  beforeDestroy() {
    // 组件销毁前关闭WebSocket
    if (this.socket) {
      this.socket.close();
    }
  },
  methods: {
    // 跳转到个人资料
    goToProfile() {
      this.$router.push('/profile')
    },

    // 退出登录
    logout() {
      removeToken();
      router.push('/login');
    },

    // 打开添加好友界面
    openAddFriend() {
      this.showAddFriend = true;
    },

    // 关闭添加好友对话框
    getLastChat(topUserId) {
      return getLastChat(topUserId).then(res => {
        this.friends = res.data.map(friend => ({
          userId: friend.userId,
          username: friend.username,
          avatar: friend.avatar,
          lastMessage: friend.lastMessage,
          isOnline: friend.isOnline,
          time: friend.lastMessageTime,
          unread: friend.unreadCount
        }));
      })
    },

    // 选择好友
    selectFriend(userId) {
      this.currentFriend = this.friends.find(friend => friend.userId === userId);
      this.showChatWindow = true;
    },

    // 新增关闭聊天窗口方法
    closeChatWindow() {
      this.showChatWindow = false;
      this.currentFriend = {
        userId: null,
        username: '',
        avatar: '',
        lastMessage: ''
      };
    },
    // 初始化WebSocket连接
    initWebSocket() {
      this.socket = getSocketInstance()

      this.socket.onopen = () => {
        console.log('WebSocket连接已建立');
        // this.loadHistoryMessages(); // 连接成功后加载历史消息
      };


      this.socket.onmessage = (event) => {
        console.log('收到消息:', event);
        const data = event.data;
        console.log('收到消息:', data);
        // this.handleSocketMessage(data);
      };

      this.socket.onclose = () => {
        console.log('WebSocket连接已关闭');
        // 5秒后尝试重连
        setTimeout(() => this.initWebSocket(), 5000);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket错误:', error);
      };
    },

    // 处理收到的消息
    handleSocketMessage(data) {
      switch(data.type) {
        case 'message':
          this.messages.push({
            id: data.messageId,
            sender: data.senderId,
            content: data.content,
            timestamp: new Date(data.timestamp),
            status: 'received',
            isRead: false
          });
          this.scrollToBottom();
          break;
      }
    },

    // 加载历史消息
    async loadHistoryMessages() {
      if (!this.currentFriend) return;

      try {
        const res = await getMessageHistory({
          friendId: this.currentFriend.userId,
          limit: 20
        });
        this.friendHistoryMessage = res.data.map(msg => ({
          ...msg,
          status: msg.sender === this.currentUser.id ? 'sent' : 'received'
        }));
        this.scrollToBottom();
      } catch (error) {
        console.error('加载历史消息失败:', error);
      }
    },

    // 发送消息
    sendMessage() {
      if (!this.newMessage.trim()) return;
      console.log('发送消息:', this.newMessage);
      const userInfo = getObject('userInfo');
      if(userInfo == null){
        return;
      }
      const senderId = userInfo.id;
      if(senderId == null) {
        return;
      }

      const message = {
        senderId: senderId,
        receiverId: this.currentFriend.userId,
        message: this.newMessage.trim()
      };
      console.log('消息体', JSON.stringify(message))

      // 发送消息
      this.socket.send(JSON.stringify(message));

      this.newMessage = '';
      // this.scrollToBottom();
    },

    // 更新消息状态
    updateMessageStatus(messageId, status) {
      const message = this.messages.find(m => m.id === messageId);
      if (message) {
        message.status = status;
      }
    },

    // 消息时间格式化
    formatTime(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
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
.friend-list {
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

.friend {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
}

/* 悬停效果 */
.friend:hover {
  background: #d9d9d9;
}

.friend.active {
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

.chat-window {
  transition: all 0.3s ease;
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
  scroll-behavior: smooth;
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
  overflow: hidden; /* 新增，防止图片溢出 */
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持图片比例填充 */
}

.avatar span {
  /* 文字头像的样式 */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-chat {
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
}

.close-chat:hover {
  color: #f56c6c;
}

.message-status {
  font-size: 11px;
  color: #999;
  text-align: right;
  margin-top: 4px;
}

.sending-icon {
  color: #ccc;
}

.read-icon {
  color: #4CAF50;
}

/* 发送中消息样式 */
.message.sending .content {
  opacity: 0.7;
  background-color: #e5f7d0;
}

/* 对方正在输入提示 */
.typing-indicator {
  display: flex;
  justify-content: flex-start;
  padding: 8px 12px;
}

.typing-dots {
  display: inline-flex;
  align-items: center;
}

.typing-dots span {
  animation: typing-bounce 1.4s infinite ease-in-out;
  margin: 0 1px;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-3px); }
}

/* 系统消息样式 */
.system-message {
  text-align: center;
  color: #888;
  font-size: 14px;
  padding: 10px;
}

/* 消息容器滚动条 */
.messages {
  //scroll-behavior: smooth;
}

.friend-status {
  display: flex;
  align-items: center;
  margin-left: 12px;
  flex-shrink: 0;
}

.online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ccc;
  margin-right: 6px;
}

.online-dot.online {
  background-color: #07C160;
}

.status-label {
  font-size: 12px;
  color: #999;
}
</style>
