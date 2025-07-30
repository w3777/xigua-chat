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

        <!-- 好友申请列表 -->
        <div class="dropdown-section">
          <div class="dropdown-header" @click="toggleDropdown('friendRequest')">
            <span>好友申请</span>
            <span class="badge" v-if="friendRequestCount > 0">{{ friendRequestCount }}</span>
            <span class="arrow">{{ dropdowns.friendRequest ? '▼' : '▶' }}</span>
          </div>
          <div class="dropdown-content" v-show="dropdowns.friendRequest">
            <div class="request-item" v-for="request in friendRequests" :key="request.id">
              <div class="avatar-placeholder" v-if="!request.avatar">
                {{ request.name.charAt(0) }}
              </div>
              <img v-else :src="request.avatar" class="avatar" alt="申请者头像">
              <div class="request-info">
                <span class="name">{{ request.name }}</span>
                <span class="request-message">{{ request.message }}</span>
              </div>
              <div class="request-actions">
                <button @click="acceptRequest(request.id)" class="accept-btn">接受</button>
                <button @click="rejectRequest(request.id)" class="reject-btn">拒绝</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧好友详情 -->
    <div :class="{'right-container': showFriendDetail}">
      <div :class="{'right-content': showFriendDetail}">
        <FriendDetail v-if="showFriendDetail" ref="friendDetail" @close="closeFriendDetail" />
      </div>
    </div>

    <!-- 右侧群组详情 -->
    <div :class="{'right-container': showGroupDetail}">
      <div :class="{'right-content': showGroupDetail}">
        <GroupDetail v-if="showGroupDetail" ref="groupDetail" @close="closeGroupDetail" />
      </div>
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
      <div class="menu-item" @click="handleFriendRightClickMenu('delete')">
        <i class="icon-delete"></i> 删除好友
      </div>
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
      <div class="menu-item" @click="handleGroupRightClickMenu('delete')">
        <i class="icon-delete"></i> 删除群组
      </div>
    </div>
  </div>
</template>

<script>
import {getContactCount, getFriendList, getGroupList} from "@/api/contact.js";
import FriendDetail from "@/views/FriendDetail.vue";
import GroupDetail from "@/views/GroupDetail.vue";
import {getFriendDetail} from "@/api/friendRelation.js";

export default {
  data() {
    return {
      dropdowns: {
        friends: false,
        groups: false,
        friendRequest: false
      },
      friendCount: 0,
      groupCount: 0,
      friendRequestCount: 0,
      friends: [],
      groups: [],
      friendRequests: [
        { id: 1, name: '赵六', avatar: '', message: '你好，请加我好友' },
        { id: 2, name: '钱七', avatar: '', message: '共同好友推荐' }
      ],
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
    }
  },
  created() {
    // 获取联系人数量
    this.getContactCount();
  },
  components: {
    FriendDetail,
    GroupDetail
  },
  methods: {
    toggleDropdown(type) {
      this.dropdowns[type] = !this.dropdowns[type];
    },
    acceptRequest(id) {
      const request = this.friendRequests.find(r => r.id === id);
      this.friends.push({
        id: this.friends.length + 1,
        name: request.name,
        avatar: request.avatar,
        online: true
      });
      this.friendRequests = this.friendRequests.filter(r => r.id !== id);
      this.unreadRequests--;
    },
    rejectRequest(id) {
      this.friendRequests = this.friendRequests.filter(r => r.id !== id);
      this.unreadRequests--;
    },

    // 获取联系人数量
    async getContactCount() {
      const res = await getContactCount();
      if (res.code === 200) {
        this.friendCount = res.data.friendCount;
        this.groupCount = res.data.groupCount;
        this.friendRequestCount = res.data.friendRequestCount;
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

    // 打开好友详情
    openFriendDetail(friendId) {
      if(this.showGroupDetail){
        this.showGroupDetail = false;
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

.left-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.left-content::-webkit-scrollbar {
  display: none;
  width: 0;
}

.right-container {
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

.request-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 12px;
  min-width: 0;
}

.request-message {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.request-actions {
  display: flex;
  gap: 6px;
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

.accept-btn {
  background-color: #1890ff;
  color: white;
}

.reject-btn {
  background-color: #f5f5f5;
  color: #666;
}

.accept-btn:hover {
  background-color: #40a9ff;
}

.reject-btn:hover {
  background-color: #e9e9e9;
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
</style>
