<template>
  <div class="main-container">

    <!-- 左侧联系人 -->
    <div class="left-container">
      <div class="left-content">
        <h1>联系人</h1>

        <!-- 好友列表 -->
        <div class="dropdown-section">
          <div class="dropdown-header" @click="toggleFriendDropdown('friends')">
            <span>好友 ({{ friendCount }})</span>
            <span class="arrow">{{ dropdowns.friends ? '▼' : '▶' }}</span>
          </div>
          <div class="dropdown-content" v-show="dropdowns.friends">
            <div class="contact-item" v-for="friend in friends" :key="friend.userId" @contextmenu.prevent="showFriendClickMenu($event, friend.userId)">
              <div class="avatar-placeholder" v-if="!friend.avatar">
                {{ friend.username && friend.username.charAt(0) }}
              </div>
              <img v-else :src="friend.avatar" class="avatar" alt="好友头像">
              <span class="name">{{ friend.username }}</span>
              <span class="status" :class="friend.isOnline ? 'online' : 'offline'"></span>
            </div>
          </div>
        </div>

        <!-- 群聊列表 -->
        <div class="dropdown-section">
          <div class="dropdown-header" @click="toggleGroupDropdown('groups')">
            <span>群聊 ({{ groupCount }})</span>
            <span class="arrow">{{ dropdowns.groups ? '▼' : '▶' }}</span>
          </div>
          <div class="dropdown-content" v-show="dropdowns.groups">
            <div class="contact-item" v-for="group in groups" :key="group.groupId" @contextmenu.prevent="showGroupClickMenu($event, group.groupId)">
              <div class="avatar-placeholder group" v-if="!group.groupAvatar">
                {{ group.groupName && group.groupName.charAt(0) }}
              </div>
              <img v-else :src="group.groupAvatar" class="avatar" alt="群聊头像">
              <span class="name">{{ group.groupName }}</span>
              <span class="member-count">{{ group.currentMember }}人</span>
            </div>
          </div>
        </div>

        <!-- 机器人列表 -->
        <div class="dropdown-section">
          <div class="dropdown-header" @click="toggleBotDropdown('bots')">
            <span>机器人 ({{ botCount }})</span>
            <span class="arrow">{{ dropdowns.bots ? '▼' : '▶' }}</span>
          </div>
          <div class="dropdown-content" v-show="dropdowns.bots">
            <div class="contact-item" v-for="bot in bots" :key="bot.id" @contextmenu.prevent="showBotClickMenu($event, bot.id)">
              <div class="avatar-placeholder" v-if="!bot.avatar">
                {{ bot.name && bot.name.charAt(0) }}
              </div>
              <img v-else :src="bot.avatar" class="avatar" alt="机器人头像">
              <span class="name">{{ bot.name }}</span>
            </div>
          </div>
        </div>

        <!-- 发送的好友申请列表 -->
        <div class="dropdown-section">
          <div class="dropdown-header" @click="toggleSendFriendRequestDropdown('sendFriendRequest')">
            <span>发送申请 ({{ this.sendCount }})</span>
            <span class="arrow">{{ dropdowns.sendFriendRequest ? '▼' : '▶' }}</span>
          </div>
          <div class="dropdown-content" v-show="dropdowns.sendFriendRequest">
            <div class="request-item" v-for="request in sendFriendRequests" :key="request.requestId">
              <div class="avatar-placeholder" v-if="!request.avatar">
                  {{ request.username && request.username.charAt(0) }}
              </div>
              <img v-else :src="request.avatar" class="avatar" alt="用户头像">
              <div class="request-content">
                <div class="request-top-line">
                  <span class="name">{{ request.username }}</span>
                  <span class="request-time">{{ formatTime(request.createTime) }}</span>
                </div>
                <div class="request-meta-line">
                  <span class="request-message" :title="request.applyMsg">{{ request.applyMsg }}</span>
                  <div class="request-right">
                    <span class="request-status"
                          :class="request.flowStatus === 0
                          ? 'request-status-pending'
                          : request.flowStatus === 1
                          ? 'request-status-accepted'
                          : request.flowStatus === 2
                          ? 'request-status-rejected'
                          : ''">
                      {{ getStatusText(request.flowStatus) }}
                    </span>
                    <button v-if="request.flowStatus === 2"
                            @click="handleRequest(request, 0)"
                            class="resend-btn">重新发送</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 接收的好友申请列表 -->
        <div class="dropdown-section">
          <div class="dropdown-header" @click="toggleReceiveFriendRequestDropdown('receiveFriendRequest')">
            <span>接收申请 ({{ this.receiveCount }})</span>
            <span class="arrow">{{ dropdowns.receiveFriendRequest ? '▼' : '▶' }}</span>
          </div>
          <div class="dropdown-content" v-show="dropdowns.receiveFriendRequest">
            <div class="request-item" v-for="request in receiveFriendRequests" :key="request.requestId">
              <div class="avatar-placeholder" v-if="!request.avatar">
                {{ request.username && request.username.charAt(0) }}
              </div>
              <img v-else :src="request.avatar" class="avatar" alt="用户头像">
              <div class="request-content">
                <div class="request-top-line">
                  <span class="name">{{ request.username }}</span>
                  <span class="request-time">{{ formatTime(request.createTime) }}</span>
                </div>
                <div class="request-meta-line">
                  <span class="request-message" :title="request.applyMsg">{{ request.applyMsg }}</span>
                  <div class="request-actions" v-if="request.flowStatus == 0">
                    <button @click="handleRequest(request, 1)" class="accept-btn">同意</button>
                    <button @click="handleRequest(request, 2)" class="reject-btn">拒绝</button>
                  </div>
                  <div class="request-right" v-if="request.flowStatus == 1 || request.flowStatus == 2">
                    <span class="request-status"
                          :class="request.flowStatus === 1
                          ? 'request-status-accepted'
                          : request.flowStatus === 2
                          ? 'request-status-rejected'
                          : ''">
                      {{ getStatusText(request.flowStatus) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="right-container">
      <!-- 右侧好友详情 -->
      <div :class="{'detail-container': showFriendDetail}">
        <div :class="{'right-content': showFriendDetail}">
          <FriendDetail v-if="showFriendDetail" ref="friendDetail" @close="closeFriendDetail" />
        </div>
      </div>

      <!-- 右侧群组详情 -->
      <div :class="{'detail-container': showGroupDetail}">
        <div :class="{'right-content': showGroupDetail}">
          <GroupDetail v-if="showGroupDetail" ref="groupDetail" @close="closeGroupDetail" />
        </div>
      </div>

      <!-- 右侧机器人详情 -->
      <div :class="{'detail-container': showBotDetail}">
        <div :class="{'right-content': showBotDetail}">
          <BotDetail v-if="showBotDetail" ref="botDetail" @close="closeBotDetail" />
        </div>
      </div>

      <!-- 欢迎页 -->
      <WelcomeWelcome v-if="showFriendDetail == false && showGroupDetail == false && showBotDetail == false"></WelcomeWelcome>
    </div>

    <!-- 好友右键菜单 -->
    <div class="right-click-menu"
         v-show="friendRightClickMenu.visible"
         :style="{ top: friendRightClickMenu.top + 'px', left: friendRightClickMenu.left + 'px' }"
         @mouseleave="hideFriendRightClickMenu">
      <div class="menu-item" @click="handleFriendRightClickMenu('chat')">
        <i class="icon-message"></i> 发消息
      </div>
      <div class="menu-item" @click="handleFriendRightClickMenu('detail')">
        <i class="icon-friend"></i> 查看详情
      </div>
      <div class="menu-divider"></div>
<!--      <div class="menu-item" @click="handleFriendRightClickMenu('delete')">-->
<!--        <i class="icon-delete"></i> 删除好友-->
<!--      </div>-->
    </div>

    <!-- 群组右键菜单 -->
    <div class="right-click-menu"
         v-show="groupRightClickMenu.visible"
         :style="{ top: groupRightClickMenu.top + 'px', left: groupRightClickMenu.left + 'px' }"
         @mouseleave="hideGroupRightClickMenu">
      <div class="menu-item" @click="handleGroupRightClickMenu('chat')">
        <i class="icon-message"></i> 发消息
      </div>
      <div class="menu-item" @click="handleGroupRightClickMenu('detail')">
        <i class="icon-group"></i> 查看详情
      </div>
      <div class="menu-divider"></div>
<!--      <div class="menu-item" @click="handleGroupRightClickMenu('delete')">-->
<!--        <i class="icon-delete"></i> 删除群组-->
<!--      </div>-->
    </div>

    <!-- 机器人右键菜单 -->
    <div class="right-click-menu"
         v-show="botRightClickMenu.visible"
         :style="{ top: botRightClickMenu.top + 'px', left: botRightClickMenu.left + 'px' }"
         @mouseleave="hideBotRightClickMenu">
      <div class="menu-item" @click="handleBotRightClickMenu('chat')">
        <i class="icon-message"></i> 发消息
      </div>
      <div class="menu-item" @click="handleBotRightClickMenu('detail')">
        <i class="icon-group"></i> 查看详情
      </div>
      <div class="menu-divider"></div>
    </div>

  </div>
</template>

<script>
import {
  getBotList,
  getContactCount,
  getFriendList,
  getGroupList,
  getReceiveFriendRequestList,
  getSendFriendRequestList
} from "@/api/contact.js";
import { friendVerify } from '@/api/friendRelation.js'
import FriendDetail from "@/views/FriendDetail.vue";
import GroupDetail from "@/views/GroupDetail.vue";
import BotDetail from "@/views/BotDetail.vue";
import {getFriendDetail} from "@/api/friendRelation.js";
import {set} from "@/utils/localStorage.js";
import WelcomeWelcome from "@/components/WelcomeWelcome.vue";

export default {
  data() {
    return {
      dropdowns: {
        friends: false,
        groups: false,
        bots: false,
        sendFriendRequest: false,
        receiveFriendRequest: false,
      },
      friendCount: 0,
      groupCount: 0,
      botCount: 0,
      sendCount: 0,
      receiveCount: 0,
      friends: [],
      groups: [],
      bots: [],
      sendFriendRequests: [],
      receiveFriendRequests: [],
      unreadRequests: 0,
      showFriendDetail: false, // 好友详情
      friendRightClickMenu: {
        visible: false,
        top: 0,
        left: 0,
        friendId:null
      },
      showGroupDetail: false, // 群组详情
      groupRightClickMenu: {
        visible: false,
        top: 0,
        left: 0,
        groupId:null
      },
      showBotDetail: false, // 机器人详情
      botRightClickMenu: {
        visible: false,
        top: 0,
        left: 0,
        botId:null
      },
    }
  },
  created() {
    // 获取联系人数量
    this.getContactCount();
  },
  components: {
    FriendDetail,
    GroupDetail,
    BotDetail,
    WelcomeWelcome
  },
  methods: {
    // 打开/关闭 下拉列表
    toggleDropdown(type) {
      this.dropdowns[type] = !this.dropdowns[type];
    },

    // 获取联系人数量
    async getContactCount() {
      const res = await getContactCount();
      if (res.code === 200) {
        this.friendCount = res.data.friendCount;
        this.groupCount = res.data.groupCount;
        this.botCount = res.data.botCount;
        this.sendCount = res.data.sendCount;
        this.receiveCount = res.data.receiveCount;
      }
    },

    // 获取好友列表
    async getFriendList() {
      const res = await getFriendList();
      if (res.code === 200) {
        this.friends = res.data;
      }
    },

    // 获取群聊列表
    async getGroupList() {
      const res = await getGroupList();
      if (res.code === 200) {
        this.groups = res.data;
      }
    },

    // 获取机器人列表
    async getBotList() {
      const res = await getBotList();
      if (res.code === 200) {
        this.bots = res.data;
      }
    },

    // 展开好友下拉列表
    toggleFriendDropdown(type) {
      this.toggleDropdown(type);

      // 展开好友下拉表表时，获取好友列表数据
      if(this.dropdowns.friends == true){
        this.getFriendList();
      }
    },

    // 展开群聊下拉列表
    toggleGroupDropdown(type) {
      this.toggleDropdown(type);

      // 展开群聊下拉表表时，获取群聊列表数据
      if(this.dropdowns.groups == true){
        this.getGroupList();
      }
    },

    // 展开群聊下拉列表
    toggleBotDropdown(type) {
      this.toggleDropdown(type);

      // 展开群聊下拉表表时，获取群聊列表数据
      if(this.dropdowns.bots == true){
        this.getBotList();
      }
    },

    startChat(friendId) {
      set('activeMenu', 'chat');
      this.$router.push({
        path: 'Chat',
        query: {
          "friendId": friendId
        }
      })
    },

    // 打开好友详情
    openFriendDetail(friendId) {
      if(this.showGroupDetail){
        this.showGroupDetail = false;
      }
      if(this.showBotDetail){
        this.showBotDetail = false;
      }
      this.showFriendDetail = true;

      this.$nextTick(() => {
        if (this.$refs.friendDetail) {
          // 调用子组件方法
          this.$refs.friendDetail.getFriendDetail(friendId);
        }
      });
    },

    // 关闭好友详情
    closeFriendDetail() {
      this.showFriendDetail = false;
    },

    // 打开好友右键菜单
    showFriendClickMenu(event, friendId) {
      this.friendRightClickMenu = {
        visible: true,
        top: event.clientY,
        left: event.clientX,
        friendId: friendId
      }
      // 点击其他地方关闭菜单
      document.addEventListener('click', this.hideFriendRightClickMenu)
    },

    hideFriendRightClickMenu() {
      this.friendRightClickMenu.visible = false
      document.removeEventListener('click', this.hideFriendRightClickMenu)
    },

    handleFriendRightClickMenu(action) {
      this.hideFriendRightClickMenu()
      if (!this.friendRightClickMenu.friendId) return

      const friendId = this.friendRightClickMenu.friendId
      switch(action) {
        case 'chat':
          this.startChat(friendId)
          break
        case 'detail':
          this.openFriendDetail(friendId)
          break
        case 'delete':
          this.deleteFriend(friendId)
          break
      }
    },

    showGroupClickMenu(event, groupId) {
      this.groupRightClickMenu = {
        visible: true,
        top: event.clientY,
        left: event.clientX,
        groupId: groupId
      }
      // 点击其他地方关闭菜单
      document.addEventListener('click', this.hideGroupRightClickMenu)
    },

    hideGroupRightClickMenu() {
      this.groupRightClickMenu.visible = false
      document.removeEventListener('click', this.hideGroupRightClickMenu)
    },

    handleGroupRightClickMenu(action) {
      this.hideGroupRightClickMenu()
      if (!this.groupRightClickMenu.groupId) return

      const groupId = this.groupRightClickMenu.groupId
      switch(action) {
        case 'chat':
          this.startChat(groupId)
          break
        case 'detail':
          this.openGroupDetail(groupId)
          break
        case 'delete':
          this.deleteGroup(groupId)
          break
      }
    },

    // 打开群组详情
    openGroupDetail(groupId) {
      if(this.showFriendDetail){
        this.showFriendDetail = false;
      }
      if(this.showBotDetail){
        this.showBotDetail = false;
      }
      this.showGroupDetail = true;

      this.$nextTick(() => {
        if (this.$refs.groupDetail) {
          // 调用子组件方法
          this.$refs.groupDetail.getGroupDetail(groupId);
        }
      });
    },

    // 关闭群组详情
    closeGroupDetail() {
      this.showGroupDetail = false;
    },


    showBotClickMenu(event, botId) {
      this.botRightClickMenu = {
        visible: true,
        top: event.clientY,
        left: event.clientX,
        botId: botId
      }
      // 点击其他地方关闭菜单
      document.addEventListener('click', this.hideBotRightClickMenu)
    },

    hideBotRightClickMenu() {
      this.botRightClickMenu.visible = false
      document.removeEventListener('click', this.hideBotRightClickMenu)
    },

    handleBotRightClickMenu(action) {
      this.hideBotRightClickMenu()
      if (!this.botRightClickMenu.botId) return

      const botId = this.botRightClickMenu.botId
      switch(action) {
        case 'chat':
          this.startChat(botId)
          break
        case 'detail':
          this.openBotDetail(botId)
          break
      }
    },

    // 打开群组详情
    openBotDetail(botId) {
      if(this.showFriendDetail){
        this.showFriendDetail = false;
      }
      if(this.showGroupDetail){
        this.showGroupDetail = false;
      }
      this.showBotDetail = true;

      this.$nextTick(() => {
        if (this.$refs.botDetail) {
          // 调用子组件方法
          this.$refs.botDetail.getBotDetail(botId);
        }
      });
    },

    // 关闭群组详情
    closeBotDetail() {
      this.showBotDetail = false;
    },

    // 展开发送好友申请下拉列表
    toggleSendFriendRequestDropdown(type) {
      this.toggleDropdown(type);

      // 展开送好友申请下拉表表时，获取送好友申请列表数据
      if(this.dropdowns.sendFriendRequest == true){
        this.getSendFriendRequestList();
      }
    },

    // 获取发送好友申请列表
    async getSendFriendRequestList() {
      const res = await getSendFriendRequestList();
      if (res.code === 200) {
        this.sendFriendRequests = res.data;
      }
    },

    // 展开接收好友申请下拉列表
    toggleReceiveFriendRequestDropdown(type) {
      this.toggleDropdown(type);

      // 展开接收好友申请下拉表表时，获取接收好友申请列表数据
      if(this.dropdowns.receiveFriendRequest == true){
        this.getReceiveFriendRequestList();
      }
    },

    // 获取接收好友申请列表
    async getReceiveFriendRequestList() {
      const res = await getReceiveFriendRequestList();
      if (res.code === 200) {
        this.receiveFriendRequests = res.data;
      }
    },

    getStatusText(status) {
      const statusMap = {
        0: '等待验证',
        1: '已通过',
        2: '已拒绝'
      }
      return statusMap[status] || status
    },

    formatTime(datetimeStr) {
      if (!datetimeStr) return '';

      const date = new Date(datetimeStr); // 直接解析
      const now = new Date();

      // 获取今天、昨天和输入日期的00:00:00时间戳
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const yesterdayStart = todayStart - 86400000;
      const inputDateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

      // 今天 - 显示时间（去掉小时前导零）
      if (inputDateStart >= todayStart) {
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else if (inputDateStart >= yesterdayStart) {
        return '昨天';
      } else if (this.isInCurrentWeek(date, now)) {
        const weekday = date.getDay();
        if (weekday >= 1 && weekday <= 5) {
          const weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五'];
          return weekdays[weekday - 1];
        }
        return this.formatDate(date);
      } else {
        return this.formatDate(date);
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

    // 处理好友验证请求
    handleRequest(request, flowStatus) {
      const reqData = {
        requestId: request.requestId,
        friendId: request.userId,
        flowStatus: flowStatus
      }

      // 处理好友验证请求
      friendVerify(reqData).then(response => {
        if(response.code != 200){
          this.$message({
            message: response.msg,
            type: 'error'
          })
        }

        // 提示成功
        this.$message({
          message: '操作成功',
          type: 'success'
        })

        // 刷新列表
        if(flowStatus == 0){
          this.getSendFriendRequestList();
        }else if(flowStatus ==1 || flowStatus == 2){
          this.getReceiveFriendRequestList();
        }
      })
    },
  }
}
</script>

<style scoped>
.main-container {
  display: flex;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.left-container {
  width: 30%;
  height: 100%;
  background-color: #f0f0f0;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.right-container {
  width: 70%;
  height: 100%;
}

.left-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.left-content::-webkit-scrollbar {
  display: none;
  width: 0;
}

.detail-container {
  height: 100%;
  flex: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.right-content {
  flex: 1;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: #999;
  font-size: 16px;
}

h1 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1a1a1a;
  padding-bottom: 8px;
  border-bottom: 1px solid #d9d9d9;
}

.dropdown-section {
  margin-bottom: 12px;
}

.dropdown-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: #e6e6e6;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.dropdown-header span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dropdown-header:hover {
  background-color: #d9d9d9;
}

.arrow {
  margin-left: auto;
  font-size: 12px;
  color: #666;
}

.badge {
  background-color: #ff4d4f;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 6px;
}

.dropdown-content {
  margin-top: 6px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f9f9f9;
}

.contact-item, .request-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  transition: background-color 0.2s ease;
}

.contact-item:hover, .request-item:hover {
  background-color: #f0f0f0;
  cursor: default;
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-weight: 500;
}

.avatar-placeholder.group {
  background-color: #52c41a;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.name {
  font-weight: 500;
  color: #333;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 8px;
}

.status.online {
  background-color: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

.status.offline {
  background-color: #d9d9d9;
}

.member-count {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.request-message {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.right-click-menu {
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

.icon-friend:before {
  content: "👤";
}

.icon-group:before {
  content: "👥";
}

.icon-delete:before {
  content: "🗑️";
}

.request-item {
  display: flex;
  padding: 10px 16px;
  align-items: center;
  min-height: 56px;
}

.request-content {
  flex: 1;
  min-width: 0;
}

.request-top-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.request-meta-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-time {
  font-size: 11px;
  color: #999;
}

.request-message {
  font-size: 12px;
  color: #666;
  flex: 1;
  margin-right: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.request-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.request-status {
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.request-status-pending {
  background-color: #e6f7ff;
  color: #1890ff;
}

.request-status-accepted {
  background-color: #f6ffed;
  color: #52c41a;
}

.request-status-rejected {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.request-actions {
  display: flex;
  gap: 8px;
}

.accept-btn, .reject-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.accept-btn, .reject-btn, .resend-btn {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  border: none;
  white-space: nowrap;
}

.accept-btn {
  background-color: #1890ff;
  color: white;
}

.accept-btn:hover {
  background-color: #40a9ff;
}

.reject-btn {
  background-color: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
}

.resend-btn {
  background-color: #fff;
  color: #1890ff;
  border: 1px solid #1890ff;
}

.reject-btn:hover {
  background-color: #e9e9e9;
}
</style>
