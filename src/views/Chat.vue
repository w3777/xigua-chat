<template>
  <!-- 联系人列表 + 聊天窗口 -->
  <div class="main-content">
    <!-- 左侧联系人列表 -->
    <div class="left-container">
      <div class="search-bar sticky">
        <input type="text" placeholder="搜索">
        <span class="back-btn" @click="openAddFriend">+</span>
      </div>
      <div class="friend-list" @scroll="friendScroll">
        <div
            v-for="friend in friends"
            :key="friend.userId"
            class="friend"
            :class="{ active: currentFriend && currentFriend.userId === friend.userId }"
            @click="lockFriendWindow(friend.userId)"
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

        <!--      <div v-if="loading" class="loading-more">-->
        <!--        加载中...-->
        <!--      </div>-->
        <!--      <div v-if="noMoreData" class="no-more-data">-->
        <!--        没有更多数据了-->
        <!--      </div>-->
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
      <div class="messages" ref="messagesContainer" @scroll="handleMessagesScroll">
        <!-- 加载更多提示 -->
        <div v-if="loadingHistory" class="loading-history">
          加载历史消息中...
        </div>

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

          <!-- 接收方头像 -->
          <div v-if="message.senderId !== currentUser.id" class="avatar-container">
            <div class="message-avatar">
              <img v-if="currentFriend.avatar" :src="currentFriend.avatar" :alt="currentFriend.username">
              <span v-else>{{ currentFriend && currentFriend.username ? currentFriend.username[0] : '' }}</span>
            </div>
          </div>

          <!-- 消息内容 -->
          <div class="message-content">
            <div
                class="message-header"
                :class="{
                    'sender': message.senderId === currentUser.id,
                    'receiver': message.senderId !== currentUser.id
                  }">
              <span class="message-time">{{ message.createTime }}</span>
            </div>
            <div class="content">
              {{ message.message }}
            </div>
            <div class="message-bottom">
              <span v-if="message.senderId === currentUser.id" class="read-status">
                {{ message.isRead ? '已读' : '未读' }}
              </span>
            </div>
          </div>

          <!-- 发送方头像 -->
          <div v-if="message.senderId === currentUser.id" class="avatar-container">
            <div class="message-avatar">
              <img v-if="currentUser.avatar" :src="currentUser.avatar" :alt="currentUser.username">
              <span v-else>{{ currentUser.username.charAt(0) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="input-container">
        <div class="input-tools">
          <div class="left-tools">
            <!-- 模板部分 -->
            <div class="emoji-trigger-container">
              <i class="icon-tool emoji-trigger" @click.stop="toggleEmojiPicker">😊</i>

              <div v-if="showEmojiPicker" class="emoji-picker-floating">
                <emoji-picker
                    :native="true"
                    :disable-skin-tones="true"
                    :display-recent="true"
                    :hide-search="true"
                    :show-categories="true"
                    @select="addEmoji"
                />
              </div>
            </div>
            <i class="icon-tool">📷</i>
          </div>
          <div class="right-tools">
            <i class="icon-tool">🎤</i>
            <i class="icon-tool">📹</i>
          </div>
        </div>

        <!-- 输入和发送行 -->
        <div class="input-row">
          <div class="textarea-container">
            <textarea
                type="text"
                v-model="newMessage"
                @keyup.enter="handleKeyDown"
                placeholder="发送消息"
                rows="1"
                @input=""
                ref="messageInput"
                :class="{ 'error': showEmptyError }"
            ></textarea>
            <div class="send-btn-wrapper">
              <transition name="fade">
                <div v-if="showEmptyWarn" class="message-empty-warn">
                  <span class="error-text">不能发送空白信息</span>
                  <span class="error-arrow"></span>
                </div>
              </transition>
              <button class="send-btn" @click="sendMessage">发送(S)</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加好友组件 -->
    <AddFriend v-if="showAddFriend" @close="closeAddFriend" />
  </div>
</template>

<script>
import {removeToken} from "@/utils/auth.js";
import router from "@/router";
import AddFriend from "./AddFriend.vue";
import {getFriendLastMes, getHistoryMes} from "@/api/chatMessage.js";
import {closeWebSocket, connectWebSocket, getSocketInstance} from '@/utils/websocket';
import {getObject, setObject} from '@/utils/localStorage.js'
import {ElMessage} from "element-plus";
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";
import defaultAvatar from "@/static/images/user_default.png";

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
    EmojiPicker
  },
  data() {
    return {
      // 添加好友对话框状态
      showAddFriend: false,
      showEmojiPicker: false,
      // 顶部用户ID (其他页面带过来的)
      topUserId: null,
      friends: [],
      // 当前选中的好友
      currentFriend: {
        userId: '',
        username: '',
        avatar: '',
        lastMessage: '',
        isOnline: false,
      },
      defaultAvatar: defaultAvatar, // 默认头像
      showEmptyWarn: false, // 空白消息提示
      // 聊天窗口状态
      showChatWindow: false,
      newMessage: '', // 输入框内容
      socket: null, // WebSocket实例,
      chatMessages: [],
      currentUser: {},
      historyPageNum: 1, // 当前页码（从1开始）
      historyPageSize: 20, // 每页条数
      hasMoreHistory: false, // 是否还有更多历史消息
      loadingHistory: false, // 是否正在加载
      isScrollingUp: false, // 是否正在向上滚动
      lastScrollTop: 0, // 记录滚动位置
      prevScrollHeight: 0, // 记录加载前容器高度
      lastKnownPosition: 0, // 记录上次已知的滚动位置
    }
  },
  async created() {
    this.currentUser = getObject('userInfo');
    // 通过其他页面直接跟好友聊天，聊天窗口设置为该好友
    this.currentFriend = getObject('currentFriend') || {};
    const currentFriendId = this.$route.query.friendId || this.currentFriend.userId;
    await this.getFriendLastMes().then(() => {
      // 如果有好友ID，则锁定聊天窗口
      if(currentFriendId != null){
        this.lockFriendWindow(currentFriendId)
      }
    })
    this.initWebSocket();

  },
  beforeDestroy() {
    // 组件销毁前关闭WebSocket
    if (this.socket) {
      this.socket.close();
    }
  },
  methods: {
    // 打开添加好友界面
    openAddFriend() {
      this.showAddFriend = true;
    },

    // 分页获取左侧好友列表
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

    // 锁定好友聊天窗口
    lockFriendWindow(friendId) {
      if(friendId == null){
        return
      }
      this.showChatWindow = true;

      // 缓存当前好友信息
      this.currentFriend = this.friends.find(friend => friend.userId === friendId);
      setObject('currentFriend', this.currentFriend);

      this.$nextTick(() => {
        // 告诉服务端当前打开的好友聊天框
        this.notifyFriendOpenChatWindow();
      });

      // 清空历史消息所需参数
      this.clearHistoryMes();

      // 加载历史消息
      this.loadHistoryMessages();
    },

    // 告诉服务端当前打开的好友聊天框
    notifyFriendOpenChatWindow(){
      const message = {
        senderId: this.currentUser.id,
        receiverId: this.currentFriend.userId,
        message: this.newMessage.trim(),
        messageType: 'notify',
        subType: 'switch_friend',
        createTime : this.formatDate(new Date())
      };
      this.socket.send(JSON.stringify(message))
    },

    // 加载历史消息方法
    async loadHistoryMessages() {
      // 查询历史消息
      await this.getHistoryMes();
      // 滚动到底部
      this.scrollToBottom();
    },

    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          // 立即设置滚动位置，没有平滑效果
          container.style.scrollBehavior = 'auto';
          container.scrollTop = container.scrollHeight;
        }
      });
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

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // 处理收到的消息
        this.handleReceiveMessage(data);
      };
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
      }else if(messageType == 'notify' && subType == 'mes_read'){ // 消息已读通知
        this.receiveMessageReadNotify(data);
      }
    },

    // 接收聊天消息
    receiveChatMessage(data){
      const senderId = data.senderId;
      // 判断是否在当前聊天窗口
      if (this.currentFriend && this.currentFriend.userId === senderId){
        this.currentChatWindow(data)
      }

      // 刷新左侧好友最后一条消息
      this.getFriendLastMes().then(() => {
        this.lockFriendWindow(this.topUserId)
      })
    },

    // 在当前聊天窗口
    currentChatWindow(data) {
      // 在聊天窗口添加新消息
      this.chatMessages.push({
        id: data.messageId,
        sender: data.senderId,
        receiverId: data.receiverId,
        messageType: data.messageType,
        message: data.message,
        createTime: data.createTime
      });

      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    // 接收好友上线通知
    receiveFriendOnlineNotify(data){
      const senderId = data.senderId;
      // 好友上线的是当前聊天窗口的好友，设置为在线
      if (this.currentFriend && this.currentFriend.userId === senderId){
        this.currentFriend.isOnline = true;
      }

      // 刷新左侧好友列表
      this.getFriendLastMes()
    },

    // 接收好友下线通知
    receiveFriendOfflineNotify(data){
      const senderId = data.senderId;
      // 好友下线的是当前聊天窗口的好友，设置为离线
      if (this.currentFriend && this.currentFriend.userId === senderId){
        this.currentFriend.isOnline = false;
      }

      // 刷新左侧好友列表
      this.getFriendLastMes()
    },

    // 加载更多历史消息
    async loadMoreHistory() {
      await this.getHistoryMes();

      // todo 这里保持滚动位置有问题，获取到新消息时，虽然加载了历史消息但不要滚动页面
      // 保持滚动位置
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          const prevHeight = container.scrollHeight;
          const prevScroll = container.scrollTop;
          container.scrollTop = container.scrollHeight - prevHeight + prevScroll;
        }
      });
    },

    // 分页查询历史记录
    async getHistoryMes(){
      const req = {
        senderId: this.currentUser.id,
        receiverId: this.currentFriend.userId,
        pageNum: this.historyPageNum,
        pageSize: this.historyPageSize
      };

      // loading打开
      this.loadingHistory = true;
      // 调用接口查询
      const res = await getHistoryMes(req);
      // 将新消息插入到数组开头
      this.chatMessages = [...res.data.rows, ...this.chatMessages];
      // loading关闭
      this.loadingHistory = false;

      // 判断是否还有更多数据  当前页码 < 总页数，说明还有更多数据
      if(this.historyPageNum < res.data.totalPage){
        this.hasMoreHistory = true;
      }else{
        this.hasMoreHistory = false
      }
    },

    // 处理消息窗口滚动
    handleMessagesScroll(event) {
      const container = event.target;
      this.isScrollingUp = container.scrollTop < this.lastScrollTop;
      this.lastScrollTop = container.scrollTop;

      // 只在向上滚动、未在加载、还有数据且未触发过时检查
      if (this.isScrollingUp &&
          !this.loadingHistory &&
          this.hasMoreHistory &&
          !this.scrollTriggered
      ) {
        // 计算距离顶部的剩余可滚动距离
        const remainingSpace = container.scrollHeight - container.clientHeight - container.scrollTop;

        // todo 这里可能还需要优化 要根据上次获取到消息的数据高度判断
        // 当剩余空间大于650px时触发加载（可根据实际情况调整）
        if (remainingSpace > 650) {
          this.historyPageNum ++;
          this.scrollTriggered = true;
          this.prevScrollHeight = container.scrollHeight;
          this.loadMoreHistory();
        }
      }
    },

    // 校验消息
    checkMessage(){
      const messageText = this.newMessage.trim();

      // 检查是否空白消息
      if (!messageText) {
        this.showEmptyWarn = true;
        setTimeout(() => {
          this.showEmptyWarn = false;
        }, 2000); // 2秒后自动隐藏错误提示
        return false;
      }

      return true;
    },

    // 发送消息
    sendMessage() {
      // 校验消息
      const checkFlag = this.checkMessage();
      if(!checkFlag){
        return;
      }

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
        subType: 'mes_send',
        createTime : this.formatDate(new Date())
      };

      // 立即显示到聊天窗口
      this.chatMessages.push(message);
      this.newMessage = '';
      this.scrollToBottom();
      // 发送消息
      this.socket.send(JSON.stringify(message));


    },

    // 格式化日期 xxxx-xx-xx xx:xx:xx
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以加1
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // 处理键盘输入
    handleKeyDown(event) {
      if(event.key !== 'Enter') {
        return;
      }

      // 校验消息
      const checkFlag = this.checkMessage();
      if(!checkFlag){
        event.preventDefault();
        return;
      }

      // Shift+Enter 或 Ctrl+Enter 换行 - 允许默认行为
      if (event.shiftKey || event.ctrlKey) {
        return; // 让浏览器执行默认的换行行为
      }

      // 普通Enter键发送消息
      event.preventDefault(); // 阻止默认换行行为

      // 只有当有内容时才发送
      if (this.newMessage.trim()) {
        this.sendMessage();
      }
    },

    // 更新消息状态
    updateMessageStatus(messageId, status) {
      const message = this.messages.find(m => m.id === messageId);
      if (message) {
        message.status = status;
      }
    },

    // 滚动事件处理
    friendScroll(event) {
      // todo 按滚动做分页查询
    },

    // 清空历史消息所需要的参数
    clearHistoryMes(){
      this.chatMessages = [];
      this.historyPageNum = 1;
      this.historyPageSize = 20;
      this.hasMoreHistory = false;
      this.loadingHistory = false;
      this.isScrollingUp = false;
      this.lastScrollTo = 0;
      this.prevScrollHeight = 0;
      this.lastKnownPosition = 0;
    },

    addEmoji(emoji) {
      this.newMessage += emoji.i; // 在输入框中添加表情
      this.showEmojiPicker = false; // 选择后关闭表情框
    },

    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },

    // 接收消息已读通知
    receiveMessageReadNotify(data){
      const receiverId = data.receiverId;
      if(this.currentUser.id == receiverId){
        // 根据服务端发过来的已读消息id，改变消息状态
        this.chatMessages.forEach(message => {
          if(message.chatMessageId == data.chatMessageId){
            message.isRead = true;
          }
        })
      }
    }
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
.friend-list {
  overflow-y: auto;
}

.friend-list::-webkit-scrollbar {
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

.loading-history {
  padding: 10px;
  text-align: center;
  color: #999;
  font-size: 14px;
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

.messages::-webkit-scrollbar {
  display: none;
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
  text-align: left;
}

.message.sender {
  margin-left: auto;
  justify-content: flex-end;
  align-self: flex-end;
  text-align: right;
  align-items: flex-start;
}

.message .content {
  padding: 8px 10px;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  /* 确保消息内容中的换行符有效 */
  white-space: pre-wrap;
  word-break: break-word;
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
  height: 20%;
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

/* 样式部分 */
.emoji-trigger-container {
  position: relative;
  display: inline-block;
}

.emoji-trigger {
  cursor: pointer;
  font-size: 20px;
  padding: 5px 8px;
  transition: all 0.2s;
  border-radius: 4px;
}

.emoji-trigger:hover {
  background: #f0f0f0;
  transform: scale(1.1);
}

.emoji-picker-floating {
  position: absolute;
  bottom: 40px;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  animation: popup 0.2s ease-out;
}

.right-tools {
  margin-right: 0;
}

.input-row {
  display: flex;
  width: 100%;
  position: relative;
  height: 80%;
}

.textarea-container {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
  overflow: hidden;
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

.send-btn-wrapper {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.send-btn {
  margin-left: 8px;
  margin-top: 3px;
  background: #07C160;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 12px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s;
}

.send-btn:hover {
  background: #06ad56;
}

.message-empty-warn {
  padding: 4px 8px;
  background: #fef0f0;
  color: #f56c6c;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  animation: fadeIn 0.3s;
  position: absolute;
  bottom: calc(100% + 5px);
}

.error-arrow {
  position: absolute;
  bottom: -6px;
  right: 12px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #ffccc7;
}

.error-arrow::after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: -5px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #fff2f2;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.input-container {
  padding: 10px;
  background: #f5f5f5;
  border-top: 1px solid #e6e6e6;
  height: 100%;
  max-height: 130px;
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

.message-header {
  margin-bottom: 5px;
  align-items: center;
}

.message-header .sender {
  text-align: right;
}

.message-header.receiver {
  text-align: left;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.read-status {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.message.sender .message-content {
  order: -1; /* Make content appear before avatar */
  margin-right: 10px;
}

.message.receiver .message-content {
  margin-left: 10px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #07C160;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持图片比例填充 */
}

</style>
