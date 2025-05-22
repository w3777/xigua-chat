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
        <div class="chat-title">{{ currentFriend && currentFriend.username ? currentFriend.username : '' }}</div>
        <div class="chat-actions">
          <i class="close-chat" @click="closeChatWindow">×</i>
        </div>
      </div>

      <!-- 聊天内容区域 -->
      <div class="messages" ref="messagesContainer">
        <!-- 历史消息 -->
        <div
            v-for="message in chatMessages"
            :key="message.id"
            class="message"
            :class="{
              'sender': message.senderId === currentUser.id,
              'receiver': message.senderId !== currentUser.id
            }"
        >
          <div class="content">
            {{ message.message }}
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
import {getFriendLastMes} from "@/api/chatMessage.js";
import {getSocketInstance} from '@/utils/websocket';
import {getObject} from '@/utils/localStorage.js'
import {ElMessage} from "element-plus";

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
      socket: null, // WebSocket实例,
      chatMessages: [],
      currentUser: {}
    }
  },
  created() {
    this.initWebSocket();
    this.currentUser = getObject('userInfo');

    // 通过其他页面直接跟好友聊天，聊天窗口设置为该好友
    this.topUserId = this.$route.query.friendId;
    this.getFriendLastMes(this.topUserId).then(() => {
      this.selectFriend(this.topUserId)
    })

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
    getFriendLastMes(topUserId) {
      const data = {
        topUserId: topUserId,
        pageNum: 1,
        pageSize: 10
      }
      return getFriendLastMes(data).then(res => {
        this.friends = res.data.rows.map(friend => ({
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
      if(this.socket == null){
        return;
      }

      this.socket.onopen = () => {
        // this.loadHistoryMessages(); // 连接成功后加载历史消息
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleSocketMessage(data);

        this.getFriendLastMes(this.topUserId).then(() => {
          this.selectFriend(this.topUserId)
        })
      };

      this.socket.onclose = () => {
        // 5秒后尝试重连
        setTimeout(() => this.initWebSocket(), 5000);
      };

      this.socket.onerror = (error) => {
      };
    },

    // 处理收到的消息
    handleSocketMessage(data) {
      if(data.messageType != 'chat'){
        return;
      }
      this.chatMessages.push({
        id: data.messageId,
        sender: data.senderId,
        receiverId: data.receiverId,
        messageType: data.messageType,
        message: data.message
      });
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
          status: msg.sender === this.currentUser.id ? 'sender' : 'receiver'
        }));
        this.scrollToBottom();
      } catch (error) {
        console.error('加载历史消息失败:', error);
      }
    },

    // 发送消息
    sendMessage() {
      if (!this.newMessage.trim()) return;

      if(this.currentUser == null){
        return;
      }
      const senderId = this.currentUser.id;
      if(senderId == null) {
        return;
      }

      const message = {
        senderId: senderId,
        receiverId: this.currentFriend.userId,
        message: this.newMessage.trim(),
        messageType: 'chat',
        createTime : Date.now()
      };

      // 立即显示到聊天窗口
      this.chatMessages.push(message);
      this.newMessage = '';
      this.scrollToBottom();
      // 发送消息
      this.socket.send(JSON.stringify(message));


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
    },

    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }
}
</script>

<style scoped>
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
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 15px;
  max-width: 70%;
  display: flex;
  align-self: flex-start;
  animation: fadeIn 0.3s ease-out;
}

.message.receiver {
  align-self: flex-start;
}

.message.sender {
  margin-left: auto;
  justify-content: flex-end;
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message .content {
  padding: 10px 15px;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  margin: 0 10px;
  max-width: 70%;
}

.message.receiver .content {
  background: white;
  border: 1px solid #e5e5e5;
}

.message.sender .content {
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

.main-content {
  display: flex;
  flex: 1;
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

/* 发送中消息样式 */
.message.sending .content {
  opacity: 0.7;
  background-color: #e5f7d0;
}

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-3px); }
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
