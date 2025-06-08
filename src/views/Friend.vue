<template>
  <div class="friend-container">
    <!-- 头部 -->
    <div class="friend-header">
      <div class="friend-title">好友</div>
    </div>

    <!-- 内容区域 -->
    <div class="friend-main-content">
      <!-- 左侧 好友列表/好友请求 -->
      <div class="friend-left">
        <!-- 好友列表和通知切换 -->
        <div class="friend-tabs">
          <div
              class="tab-item"
              :class="{ active: activeTab === 'friends' }"
              @click="activeTab = 'friends'">
            好友列表
          </div>
          <div
              class="tab-item"
              :class="{ active: activeTab === 'requests' }"
              @click="activeTab = 'requests'">
            好友请求
            <span class="badge" v-if="unreadRequests > 0">{{ unreadRequests }}</span>
          </div>
        </div>

        <div class="friend-content">
          <!-- 好友列表 -->
          <div class="friend-list" v-show="activeTab === 'friends'">
            <div v-if="friends.length === 0" class="no-friends">
              暂无好友
            </div>
            <div class="friend-item" v-for="friend in friends" :key="friend.id" @click="startChat(friend.userId)" @contextmenu.prevent="showContextMenu($event, friend.userId)">
              <img :src="friend.avatar" alt="头像" class="friend-avatar">
              <div class="friend-info">
                <div class="friend-name">{{ friend.username }}</div>
                <div class="friend-signature">{{ friend.signature || '这个人很懒，什么都没留' }}</div>
              </div>
              <div class="friend-status">
                <span class="online-dot" :class="{ online: friend.isOnline }"></span>
                <span class="status-label">{{ friend.isOnline ? '在线' : '离线' }}</span>
              </div>
            </div>
          </div>

          <!-- 好友请求列表 -->
          <div class="request-list" v-show="activeTab === 'requests'">
            <div v-if="receivedRequests.length === 0 && sentRequests.length === 0" class="no-requests">
              暂无好友请求
            </div>

            <!-- 接收到的请求 -->
            <div class="request-section" v-if="receivedRequests.length > 0">
              <div class="section-title">收到的请求</div>
              <div class="request-item" v-for="request in receivedRequests" :key="'receive-'+request.id">
                <img :src="request.avatar" alt="头像" class="request-avatar">
                <div class="request-content">
                  <div class="request-info">
                    <div class="request-name">{{ request.name }}</div>
                    <div class="request-message">
                      {{ request.message || '请求添加你为好友' }}
                    </div>
                    <div class="request-time">{{ formatTime(request.createTime) }}</div>
                  </div>
                  <div class="request-actions">
                    <div class="status-container">
                      <span class="status-pending" v-if="request.flowStatus == 0">待验证</span>
                      <span class="status-accepted" v-if="request.flowStatus == 1">已通过</span>
                      <span class="status-rejected" v-if="request.flowStatus == 2">已拒绝</span>
                    </div>
                    <div class="action-buttons" v-if="request.flowStatus == 0">
                      <button class="accept-btn" @click.stop="handleRequest(request.requestId, 1)">接受</button>
                      <button class="reject-btn" @click.stop="handleRequest(request.requestId, 2)">拒绝</button>
                    </div>
                    <button v-if="request.flowStatus == 2" class="retry-btn" @click.stop="handleRequest(request.requestId, 1)">
                      <i class="icon-refresh"></i> 重新添加
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 发送的请求 -->
            <div class="request-section" v-if="sentRequests.length > 0">
              <div class="section-title">发送的请求</div>
              <div class="request-item" v-for="request in sentRequests" :key="'send-'+request.id">
                <img :src="request.avatar" alt="头像" class="request-avatar">
                <div class="request-content">
                  <div class="request-info">
                    <div class="request-name">{{ request.name }}</div>
                    <div class="request-message">
                      {{ request.message || '我请求添加你为好友' }}
                    </div>
                    <div class="request-time">{{ formatTime(request.createTime) }}</div>
                  </div>
                  <div class="request-status">
                    <div class="status-container">
                      <span class="status-pending" v-if="request.flowStatus == 0">待验证</span>
                      <span class="status-accepted" v-if="request.flowStatus == 1">已通过</span>
                      <span class="status-rejected" v-if="request.flowStatus == 2">已拒绝</span>
                    </div>
<!--                    <button v-if="request.status == 2" class="retry-btn" @click.stop="handleRequest(request.id, 1)">-->
<!--                      <i class="icon-refresh"></i> 重新添加-->
<!--                    </button>-->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧 好友详情 -->
      <div class="friend-right" v-if="showFriendDetailFlag">
        <div class="friend-detail">
          <div class="detail-header">
            <img :src="friendDetail.avatar" alt="头像" class="detail-avatar">
            <div class="detail-name">
              {{ friendDetail.username }}
              <span class="detail-status" :class="{ online: friendDetail.isOnline }">
          {{ friendDetail.isOnline ? '在线' : '离线' }}
        </span>
            </div>
            <div class="detail-signature">
              {{ friendDetail.signature || '这个人很懒，什么都没留' }}
            </div>
          </div>

          <div class="detail-section">
            <!-- 可以继续添加更多信息项，会自动每行两个排列 -->
            <div class="section-title">基本信息</div>
            <div class="detail-rows">
              <div class="detail-row">
                <span class="row-label">性别：</span>
                <span class="row-value">{{ getSexCN(friendDetail.sex) }}</span>
              </div>
              <div class="detail-row">
                <span class="row-label">地区：</span>
                <span class="row-value">{{ friendDetail.region || '未知' }}</span>
              </div>
              <div class="detail-row">
                <span class="row-label">年龄：</span>
                <span class="row-value">{{ friendDetail.age || '未知' }}</span>
              </div>
              <div class="detail-row">
                <span class="row-label">邮箱：</span>
                <span class="row-value">{{ friendDetail.email || '未知' }}</span>
              </div>
              <div class="detail-row">
                <span class="row-label">手机：</span>
                <span class="row-value">{{ friendDetail.phone || '未知' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <div class="section-title">社交信息</div>
            <div class="detail-row">
              <span class="row-label">注册时间：</span>
              <span class="row-value">{{ formatDetailTime(friendDetail.registerTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="row-label">成为好友：</span>
              <span class="row-value">{{ formatDetailTime(friendDetail.createFriendTime) }}</span>
            </div>
          </div>

          <div class="detail-actions">
            <div class="action-btn-container">
              <button class="action-btn chat-btn" @click="startChat(friendDetail.userId)">
                <i class="icon-message"></i> 发消息
              </button>
            </div>
            <div class="action-btn-container">
              <button class="action-btn delete-btn" @click="deleteFriend()">
                <i class="icon-delete"></i> 删除好友
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右键菜单 -->
      <div
          class="context-menu"
          v-show="contextMenu.visible"
          :style="{ top: contextMenu.top + 'px', left: contextMenu.left + 'px' }"
          @mouseleave="hideContextMenu">
        <div class="menu-item" @click="handleMenuClick('chat')">
          <i class="icon-message"></i> 发消息
        </div>
        <div class="menu-item" @click="handleMenuClick('detail')">
          <i class="icon-profile"></i> 查看详情
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" @click="handleMenuClick('delete')">
          <i class="icon-delete"></i> 删除好友
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sendFriendRequest, friendRequest, getFriendList, friendVerify, getFriendDetail } from '@/api/friendRelation.js'
import {set} from "@/utils/localStorage.js";

export default {
  data() {
    return {
      activeTab: 'friends',
      unreadRequests: 0,
      friends: [],
      friendRequests: [],
      receivedRequests: [],
      sentRequests: [],
      contextMenu: {
        visible: false,
        top: 0,
        left: 0,
        friendId:null
      },
      showFriendDetailFlag: false,
      friendDetail: {},
    }
  },
  computed: {
    processedRequests() {
      return this.receivedRequests.filter(req => req.processed)
    }
  },
  methods: {
    startChat(friendId) {
      set('activeMenu', 'chat');
      this.$router.push({
        path: 'Chat',
        query: {
          "friendId": friendId
        }
      })
    },
    formatTime(date) {
      const now = new Date();
      const inputDate = new Date(date);

      // 将当前日期和输入日期都调整为当天的 00:00:00
      now.setHours(0, 0, 0, 0);
      inputDate.setHours(0, 0, 0, 0);

      const diff = now - inputDate;
      const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (dayDiff === 0) {
        const hours = new Date(date).getHours().toString().padStart(2, '0');
        const minutes = new Date(date).getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else if (dayDiff === 1) {
        return '昨天';
      } else if (dayDiff < 7) {
        return `${dayDiff}天前`;
      } else {
        const month = inputDate.getMonth() + 1;
        const day = inputDate.getDate();
        return `${month}月${day}日`;
      }
    },
    handleRequest(requestId, flowStatus) {
      const request = this.receivedRequests.find(req => req.requestId === requestId)
      if (!request) return

      const reqData = {
        friendId: request.userId,
        flowStatus: flowStatus
      }

      friendVerify(reqData).then(response => {
        if (response.code === 200) {
          // 刷新请求列表
          this.fetchFriendRequests()
          if (flowStatus === 1) {
            // 如果是接受请求，刷新好友列表
            this.fetchFriendList()
          }
        }
      })
    },
    sendRequestAgain(requestId) {
      const request = this.receivedRequests.find(req => req.id === requestId)
      if (request) {
        sendFriendRequest({userId: request.userId})
            .then(response => {
              if (response.code === 200) {
                this.fetchFriendRequests()
                this.fetchFriendList()
              }
            })
            .catch(error => {
              console.error('重新发送请求失败', error)
            })
      }
    },
    updateUnreadRequests() {
      this.unreadRequests = this.receivedRequests.filter(req => !req.processed).length
    },
    fetchFriendRequests() {
      friendRequest()
          .then(response => {
            this.friendRequests = response.data || []
            // 分离接收和发送的请求
            this.receivedRequests = this.friendRequests
                .filter(req => req.source === 'receive')

            this.sentRequests = this.friendRequests
                .filter(req => req.source === 'send')

            this.updateUnreadRequests()
          })
          .catch(error => {
            console.error('获取好友请求失败', error)
          })
    },
    fetchFriendList() {
      getFriendList()
          .then(response => {
            this.friends = response.data || []
          })
          .catch(error => {
            console.error('获取好友列表失败', error)
          })
    },
    showContextMenu(event, friendId) {
      this.contextMenu = {
        visible: true,
        top: event.clientY,
        left: event.clientX,
        friendId: friendId
      }
      // 点击其他地方关闭菜单
      document.addEventListener('click', this.hideContextMenu)
    },
    hideContextMenu() {
      this.contextMenu.visible = false
      document.removeEventListener('click', this.hideContextMenu)
    },
    handleMenuClick(action) {
      this.hideContextMenu()
      if (!this.contextMenu.friendId) return

      const friendId = this.contextMenu.friendId
      switch(action) {
        case 'chat':
          this.startChat(friendId)
          break
        case 'detail':
          this.showFriendDetailFlag = true
          this.showFriendDetail(friendId)
          break
        case 'delete':
          this.deleteFriend(friendId)
          break
      }
    },
    showFriendDetail(friendId) {
      getFriendDetail(friendId).then(response => {
        if (response.code === 200) {
          this.friendDetail = response.data
        }else{
          this.friendDetail = null;
          this.$message.error('获取好友详情失败')
        }
      })
    },
    deleteFriend(friend) {
      // 删除好友逻辑
      this.$confirm(`确定要删除好友 ${friend.username} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用删除好友API
        console.log('删除好友:', friend.id)
        // 成功后刷新好友列表
        this.fetchFriendList()
      }).catch(() => {
        // 取消操作
      })
    },
    getSexCN(sex) {
      const sexMap = {
        1: '男',
        2: '女'
      };
      return sexMap[sex] || '未知';
    },

    formatDetailTime(timestamp) {
      if (!timestamp) return '未知';
      const date = new Date(timestamp);
      return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
    },
  },
  created() {
    this.fetchFriendRequests()
    this.fetchFriendList()
  }
}
</script>

<style scoped>
.friend-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  border-right: 1px solid #e6e6e6;
  overflow: hidden;
}

.friend-header {
  width: 30%;
  height: 44px;
  background-color: #ededed;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e6e6e6;
  flex-shrink: 0;
}

.friend-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.friend-main-content {
  display: flex; /* 启用flex布局 */
  flex: 1; /* 占据剩余空间 */
  overflow: hidden; /* 防止内容溢出 */
}

.friend-left {
  width: 30%;
  height: 100%;
  border-right: 1px solid #ddd;
}

.friend-tabs {
  display: flex;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fff;
  flex-shrink: 0;
  height: 8%;
}

.friend-content{
  height: 92%;
  overflow-y: auto;
}

.friend-content::-webkit-scrollbar {
  display: none;
  width: 0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 16px;
  color: #666;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-item:hover {
  background-color: #f9f9f9;
}

.tab-item.active {
  color: #07C160;
  border-bottom: 2px solid #07C160;
  font-weight: 500;
}

.badge {
  position: absolute;
  top: 8px;
  right: 20px;
  background-color: #f56c6c;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  min-width: 12px;
  height: 14px;
  line-height: 14px;
  text-align: center;
}

.friend-list, .request-list {
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
}

.request-section {
  margin-bottom: 16px;
}

.section-title {
  padding: 8px 16px;
  font-size: 14px;
  color: #999;
  background-color: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.friend-item, .request-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
  transition: background-color 0.2s;
}

.friend-item:hover, .request-item:hover {
  background-color: #f9f9f9;
  cursor: default;
}

.friend-avatar, .request-avatar {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 12px;
  flex-shrink: 0;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.request-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.request-info {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.friend-name, .request-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.friend-signature, .request-message {
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.request-time {
  font-size: 12px;
  color: #bbb;
  margin-top: 4px;
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

.request-actions {
  display: flex;
  flex-shrink: 0;
}

.accept-btn, .reject-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s;
}

.accept-btn {
  background-color: #07C160;
  color: white;
}

.accept-btn:hover {
  background-color: #06ad56;
}

.reject-btn {
  background-color: #f5f5f5;
  color: #666;
}

.reject-btn:hover {
  background-color: #e6e6e6;
}

.retry-btn {
  background-color: #f56c6c;
  color: white;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  margin-top: 8px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #e74c3c;
}

.request-result, .request-status {
  font-size: 14px;
  color: #999;
  flex-shrink: 0;
  margin-left: 12px;
}

.status-pending {
  color: #E6A23C;
}

.status-accepted {
  color: #67C23A;
}

.status-rejected {
  color: #F56C6C;
}

.no-friends, .no-requests {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 40px 0;
}

/* 滚动条样式 */
.friend-list::-webkit-scrollbar,
.request-list::-webkit-scrollbar {
  width: 4px;
}

.friend-list::-webkit-scrollbar-thumb,
.request-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.friend-list::-webkit-scrollbar-track,
.request-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.friend-right {
  width: 70%;
  height: 100%;
}

.request-actions, .request-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 60px;
}

.status-container {
  margin-bottom: 4px;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 状态标签样式 */
.status-pending,
.status-accepted,
.status-rejected {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
}

.status-pending {
  color: #E6A23C;
  background-color: #fdf6ec;
}

.status-accepted {
  color: #67C23A;
  background-color: #f0f9eb;
}

.status-rejected {
  color: #F56C6C;
  background-color: #fef0f0;
}

/* 重新添加按钮样式 */
.retry-btn {
  padding: 6px 10px;
  background-color: #f5f5f5;
  color: #606266;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.retry-btn:hover {
  background-color: #e6e6e6;
}

.retry-btn .icon-refresh {
  margin-right: 4px;
  font-size: 12px;
}

.context-menu {
  position: fixed;
  z-index: 9999;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 5px 0;
  min-width: 160px;
}

.menu-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item i {
  margin-right: 8px;
  font-size: 16px;
}

.menu-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 5px 0;
}

.icon-message:before {
  content: "💬";
}

.icon-profile:before {
  content: "👤";
}

.icon-delete:before {
  content: "🗑️";
}

.friend-detail {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.detail-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #e6e6e6;
  margin-bottom: 10px;
  object-fit: cover;
}

.detail-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-status {
  font-size: 12px;
  font-weight: normal;
  color: #999;
  margin-left: 8px;
}

.detail-status.online {
  color: #07C160;
}

.detail-signature {
  font-size: 14px;
  color: #999;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.row-label {
  color: #666;
  width: 70px;
  text-align: right;
  margin-right: 10px;
}

.row-value {
  color: #333;
  flex: 1;
}

.detail-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-btn-container {
  display: flex;
  justify-content: center;
  flex: 1;
  max-width: 150px; /* 控制最大宽度 */
}

.action-btn {
  padding: 8px 16px; /* 减小左右padding */
  min-width: 100px; /* 设置最小宽度 */
  border-radius: 18px; /* 更圆的按钮 */
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-btn i {
  margin-right: 6px;
  font-size: 14px;
}

.chat-btn {
  background-color: #07C160;
  color: white;
}

.chat-btn:hover {
  background-color: #06ad56;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(7, 193, 96, 0.2);
}

.delete-btn {
  background-color: #f8f8f8;
  color: #f56c6c;
  border: 1px solid #f0f0f0;
}

.delete-btn:hover {
  background-color: #fef0f0;
  color: #f56c6c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 108, 108, 0.1);
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #e6e6e6;
  margin-bottom: 10px;
  object-fit: cover;
}

.empty-tip i {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.empty-tip p {
  margin: 0;
  font-size: 14px;
}

.detail-rows {
  display: flex;
  flex-wrap: wrap;
  gap: 16px; /* 行间距和列间距 */
}

.detail-row {
  flex: 0 0 calc(50% - 8px); /* 每行两个，减去gap的一半 */
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.row-label {
  color: #666;
  min-width: 60px;
  margin-right: 8px;
  font-size: 14px;
}

.row-value {
  color: #333;
  font-size: 14px;
  flex: 1;
}
</style>
