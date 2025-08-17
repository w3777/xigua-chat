<template>
  <!-- 联系人列表 + 聊天窗口 -->
  <div class="main-content">
    <!-- 左侧消息列表 -->
    <div class="left-container">
      <div class="search-bar sticky">
        <input type="text" placeholder="搜索">
        <span class="back-btn" @click="openAddFriend">+</span>
      </div>
      <div class="message-list" @scroll="messageScroll">
        <div
            v-for="message in messages"
            :key="message.chatId"
            class="message-item"
            :class="{ active: currentChatWindow && currentChatWindow.chatId === message.chatId }"
            @click="openChatWindow(message.chatId)"
        >
          <div class="message-avatar-container">
            <div class="avatar">
              <img v-if="message.avatar" :src="message.avatar" :alt="message.chatName">
              <span v-else>{{ message.chatName.charAt(0) }}</span>
            </div>
            <div v-if="message.unreadCount > 0" class="unread-badge">
              {{ message.unreadCount > 99 ? '99+' : message.unreadCount }}
            </div>
          </div>
          <div class="info">
            <div class="name">{{ formatChatName(message.chatName) }}</div>
            <div class="last-msg">{{ message.lastMessageContent.content }}</div>
          </div>
          <div class="status-time">
            <div class="time">{{ formatTime(message.updateTime) }}</div>
            <div class="friend-status" v-if="message.chatType === 1">
              <span class="online-dot" :class="{ online: message.isOnline }"></span>
              <span class="status-label">{{ message.isOnline ? '在线' : '离线' }}</span>
            </div>
            <div v-if="message.chatType === 2" class="group-status">
              <span class="group-tag">群聊</span>
            </div>
          </div>
        </div>

        <!--      <div v-if="loading" class="loading-more">-->
        <!--        加载中...-->
        <!--      </div>-->
        <!--      <div v-if="noMoreData" class="no-more-data">-->
        <!--        没有更多数据了-->
        <!--      </div>-->
      </div>
    </div>

    <!-- 聊天窗口组件 -->
    <ChatWindow v-if="showChatWindow" ref="chatWindow" @close="closeChatWindow" />

    <!-- 添加好友组件 -->
    <AddFriend v-if="showAddFriend" @close="closeAddFriend" />
  </div>
</template>

<script>
import AddFriend from "./AddFriend.vue";
import ChatWindow from "./ChatWindow.vue";
import {getLastMes} from "@/api/chatMessage.js";
import {getObject, remove, setObject} from '@/utils/localStorage.js'
import "vue3-emoji-picker/css";
import {getSocketInstance, getWebSocketClient} from "@/ws/WebSocketClient.js";

export default {
  name: 'WeChatApp',
  mounted() {
    // 确保初始加载时路由到chat
    if (this.$route.path === '/') {
      this.$router.replace('/chat')
    }
  },
  components: {
    AddFriend,
    ChatWindow
  },
  data() {
    return {
      // 添加好友对话框状态
      showAddFriend: false,
      // 聊天窗口状态
      showChatWindow: false,
      // 顶部用户ID (其他页面带过来的)
      topUserId: null,
      // 左侧消息列表
      messages: [],
      // 当前选中的聊天窗口
      currentChatWindow: {},
      showEmptyWarn: false, // 空白消息提示
      newMessage: '', // 输入框内容
      webSocket: null, // WebSocket实例,
      chatMessages: [],
      currentUser: {},
    }
  },
  async created() {
    // 初始化WebSocket连接
    this.initWebSocket();

    this.currentUser = getObject('userInfo');
    // 通过其他页面直接跟好友聊天，聊天窗口设置为该好友
    this.currentChatWindow = getObject('currentChatWindow') || {};
    const chatId = this.currentChatWindow.chatId;
    const friendId = this.$route.query.friendId;

    if(friendId != null && friendId != ''){
      await this.initChat2(friendId)
    }else{
      await this.initChat(chatId)
    }
  },
  beforeDestroy() {
    // 组件销毁前关闭WebSocket
    if (this.webSocket) {
      getWebSocketClient().close();
    }
  },
  methods: {
    // 打开添加好友界面
    openAddFriend() {
      this.showAddFriend = true;
    },

    // 关闭添加好友界面
    closeAddFriend(){
      this.showAddFriend = false;
    },

    // 分页获取左侧好友列表
    getLastMes() {
      const data = {
        pageNum: 1,
        pageSize: 10
      }
      return getLastMes(data).then(res => {
        this.messages = res.data.rows;
      })
    },

    // 加载聊天
    async initChat(chatId){
      await this.getLastMes().then(() => {
        // 如果有好友ID，则锁定聊天窗口
        if(chatId != null){
          this.openChatWindow(chatId)
        }
      })
    },

    // 加载聊天
    async initChat2(friend){
      console.log(friend)
      // 消息列表如果有该好友，直接从消息列表打开，并打开聊天窗口

      // 消息列表没有该好友，要在消息列表创建一条空消息，再打开聊天窗口
    },

    // 打开聊天窗口
    async openChatWindow(chatId) {
      if(chatId == null){
        return
      }
      this.showChatWindow = true;

      // 切换了聊天窗口
      if(chatId != this.currentChatWindow.chatId){
        this.currentChatWindow = this.messages.find(chat => chat.chatId === chatId);
        if(this.currentChatWindow == null){
          return
        }

        // 切换聊天窗口，清空未读消息数量  (todo 后续这块需要优化)
        if(this.currentChatWindow.unreadCount && this.currentChatWindow.unreadCount > 0){
          this.currentChatWindow.unreadCount = 0;
        }

        // 更新当前聊天窗口缓存
        setObject('currentChatWindow', this.currentChatWindow);

        // 初始化聊天窗口
        if(this.$refs.chatWindow != null){
          this.$refs.chatWindow.initChatWindow()
        }

        // 告诉服务端当前打开的聊天窗口
        this.notifySwitchChatWindow();
      }
    },

    // 告诉服务端当前打开聊天窗口
    notifySwitchChatWindow(){
      const message = {
        senderId: this.currentUser.id,
        receiverId: this.currentChatWindow.chatId,
        message: this.newMessage.trim(),
        messageType: 'notify',
        subType: 'switch_chat_window'
      };
      this.webSocket.send(JSON.stringify(message))
    },

    // 告诉服务端关闭当前聊天窗口
    notifyCloseChatWindow(chatId){
      const message = {
        senderId: this.currentUser.id,
        receiverId: chatId,
        message: "",
        messageType: 'notify',
        subType: 'close_chat_window'
      };
      this.webSocket.send(JSON.stringify(message))
    },

    // 关闭聊天窗口方法
    closeChatWindow(chatId) {
      this.showChatWindow = false;
      if(chatId == null){
        return
      }

      // 告诉服务端关闭当前聊天窗口
      this.notifyCloseChatWindow(chatId);
      remove('currentChatWindow');
      this.currentChatWindow = {};
    },

    // 初始化WebSocket连接
    initWebSocket() {
      getWebSocketClient().connect();
      this.webSocket = getSocketInstance();
      if(this.webSocket == null){
        return;
      }

      // 订阅websocket消息
      getWebSocketClient().subscribe(message => {
        const data = JSON.parse(message);
        // 处理收到的消息
        this.handleReceiveMessage(data);
      })
    },

    // 根据不同类型 处理收到的消息
    handleReceiveMessage(data) {
      const messageType = data.messageType;
      const subType = data.subType;
      if(messageType == 'chat' && subType == 'mes_receive'){ // 聊天消息
        this.receiveChatMessage(data);
      }else if(messageType == 'notify' && subType == 'friend_online'){ // 好友上线通知
        this.receiveFriendOnlineNotify(data);
      }else if(messageType == 'notify' && subType == 'friend_offline'){  // 好友下线通知
        this.receiveFriendOfflineNotify(data);
      }
    },

    // 接收聊天消息
    receiveChatMessage(data){
      // 刷新左侧好友消息列表
      this.getLastMes()
    },

    // 接收好友上线通知
    receiveFriendOnlineNotify(data){
      const senderId = data.senderId;
      // 好友上线的是当前聊天窗口的好友，设置为在线
      if (this.currentChatWindow && this.currentChatWindow.chatId === senderId){
        this.currentChatWindow.isOnline = true;
      }

      // 刷新左侧好友列表
      this.getLastMes()
    },

    // 接收好友下线通知
    receiveFriendOfflineNotify(data){
      const senderId = data.senderId;
      // 好友下线的是当前聊天窗口的好友，设置为离线
      if (this.currentChatWindow && this.currentChatWindow.chatId === senderId){
        this.currentChatWindow.isOnline = false;
      }

      // 刷新左侧好友列表
      this.getLastMes()
    },

    // 滚动事件处理
    messageScroll(event) {
      // todo 按滚动做分页查询
    },

    // 格式化时间
    formatTime(timestamp) {
      if(timestamp == null || timestamp == ''){
        return '';
      }
      const date = new Date(timestamp)
      const now = new Date()

      // 获取今天、昨天和输入日期的00:00:00时间戳
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const yesterdayStart = todayStart - 86400000
      const inputDateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

      // 今天 - 显示时间（去掉小时前导零）
      if (inputDateStart >= todayStart) {
        const hours = date.getHours()
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
      }else if (inputDateStart >= yesterdayStart) { // 昨天 - 总是显示"昨天"
        return '昨天'
      }else if (this.isInCurrentWeek(date, now)) { // 本周内判断
        // 本周内（周一至周五） - 显示星期几
        const weekday = date.getDay()
        if (weekday >= 1 && weekday <= 5) {
          const weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五']
          return weekdays[weekday - 1]
        }
        // 如果是周六日，则显示日期格式
        return this.formatDate(date)
      }else { // 更早时间 - 显示完整年月日（保留前导零）
        return this.formatDate(date)
      }
    },

    /**
     * 判断日期是否在本周
     */
    isInCurrentWeek(date, now) {
      const nowStartOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() || 7) + 1)
      const dateStartOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() || 7) + 1)
      return nowStartOfWeek.getTime() === dateStartOfWeek.getTime()
    },

    /**
     * 格式化日期为YY/MM/DD
     */
    formatDate(date) {
      const year = date.getFullYear().toString().slice(-2).padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}/${month}/${day}`
    },

    // 格式化聊天名称
    formatChatName(chatName){
      if(chatName == null || chatName == ''){
        return '';
      }

      if(chatName.length > 8){
        // 名称长度大于8 截取前8个字符
        return chatName.substring(0, 8) + '...';
      }

      return chatName;
    },
  }
}
</script>

<style scoped>
/* 左侧联系人列表样式 */
.left-container {
  width: 30%;
  background: #eee;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}
.message-list {
  overflow-y: auto;
}

.message-list::-webkit-scrollbar {
  display: none;
  width: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.sticky {
  top: 0;
  z-index: 10;
  padding: 10px;
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

.message-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
}

/* 悬停效果 */
.message-item:hover {
  background: #d9d9d9;
}

.message-item.active {
  background: #d9d9d9;
}

.message-avatar-container{
  position: relative;
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

.input-row textarea {
  width: 100%;
  height: 100%;
  padding: 8px 50px 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  box-sizing: border-box;
  line-height: 1.5;
  overflow-y: auto;
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  resize: none;
  min-height: 40px;
  max-height: 150px; /* 限制最大高度 */
  overflow-y: auto; /* 超出时显示滚动条 */
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.input-row textarea::-webkit-scrollbar {
  display: none;
}

.input-row textarea.error {
  border-color: #f56c6c;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
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

/* 发送中消息样式 */
.message.sending .content {
  opacity: 0.7;
  background-color: #e5f7d0;
}

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-3px); }
}

.status-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  justify-content: space-between;
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
  margin-right: 4px;
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

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持图片比例填充 */
}

.unread-badge {
  position: absolute;
  top: -6px;
  right: -1px;
  background-color: #f56c6c;
  color: white;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  padding: 0 5px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  animation: pulse 1.5s infinite ease-in-out;
}

.unread-badge[data-count="99+"] {
  padding: 0 4px;
  min-width: 24px;
}

/* 好友未读呼吸动画 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.group-status {
  display: flex;
  align-items: center;
  margin-top: 2px;
  margin-left: 12px;
}

/* 群聊标签样式 */
.group-tag {
  display: inline-block;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: normal;
  line-height: 1;
  color: #7239EA;
  background-color: rgba(114, 57, 234, 0.1);
  border: 1px solid rgba(114, 57, 234, 0.3);
}

</style>
