<template>
  <!-- 弹框遮罩层 -->
  <div class="dialog-overlay">
    <div class="multi-card-dialog">
      <!-- 弹框标题栏 -->
      <div class="dialog-header">
        <div class="dialog-tabs">
          <div
              class="tab-item"
              :class="{active: activeTab === 'friend'}"
              @click="switchTab('friend')"
          >
            添加好友
          </div>
          <div
              class="tab-item"
              :class="{active: activeTab === 'group'}"
              @click="switchTab('group')"
          >
            创建群聊
          </div>
        </div>
        <div class="dialog-close" @click="closeDialog">×</div>
      </div>

      <!-- 添加好友卡片 -->
      <div class="card-content" v-show="activeTab === 'friend'">
        <!-- 搜索区域 -->
        <div class="search-section">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="请输入用户名/qq号"
              @input="handleSearchInput"
              @keyup.enter="searchFriends"
              ref="searchInput"
          >
          <button @click="searchFriends" class="search-btn">搜索</button>
        </div>

        <!-- 搜索结果列表 -->
        <div class="search-results" v-if="searchResults.length > 0">
          <div class="result-item" v-for="user in searchResults" :key="user.id">
            <div class="user-avatar">
              <img v-if="user.avatar" :src="user.avatar" alt="头像">
              <span v-else>{{ user.name.charAt(0) }}</span>
            </div>
            <div class="user-info">
              <div class="name-line">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-sex" v-if="user.sex">
                  <img v-if="user.sex === 1" src="../static/icons/man.png" alt="男" class="sex-icon">
                  <img v-if="user.sex === 2" src="../static/icons/woman.png" alt="女" class="sex-icon">
                </span>
                <span class="user-status" :class="{'online': user.isOnline, 'offline': !user.isOnline}">
                  <i class="status-icon"></i>
                  {{ user.isOnline ? '在线' : '离线' }}
                </span>
              </div>
              <div class="user-id">微信号: xg_{{ user.id }}</div>
            </div>
            <button
                class="add-btn"
                @click="sendFriendRequest(user.id)"
                :disabled="user.requestSent"
            >
              {{ user.requestSent ? '已发送' : '添加' }}
            </button>
          </div>
        </div>

        <!-- 无结果提示 -->
        <div class="no-results" v-else-if="searchQuery && !isSearching">
          没有找到相关用户
        </div>

        <!-- 搜索提示 -->
        <div class="search-tips" v-else>
          输入用户名/qq号搜索好友
        </div>
      </div>

      <!-- 创建群聊卡片 -->
      <div class="card-content" v-show="activeTab === 'group'">
        <div class="group-creation-form">
          <div class="member-selection">
            <label>选择成员</label>
            <div class="member-list">
              <div
                  class="member-item"
                  v-for="friend in friends"
                  :key="friend.userId"
                  @click="toggleMemberSelection(friend.userId)"
              >
                <div class="member-avatar">
                  <img v-if="friend.avatar" :src="friend.avatar" alt="头像">
                  <span v-else>{{ friend.name.charAt(0) }}</span>
                </div>
                <div class="member-name">{{ friend.name }}</div>
                <div class="member-checkbox" :class="{selected: selectedMembers.includes(friend.userId)}">
                  <i class="check-icon"></i>
                </div>
              </div>
            </div>
          </div>

          <button
              class="create-group-btn"
              @click="createGroup"
              :disabled="!canCreateGroup"
          >
            创建群聊
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getListByName } from "@/api/user.js";
import { sendFriendRequest } from "@/api/friendRelation.js";
import { getFriendList } from "@/api/friendRelation.js";
import { createGroup } from "@/api/group.js";
import { getObject} from "@/utils/localStorage.js";

export default {
  data() {
    return {
      activeTab: 'friend', // 默认显示添加好友卡片
      // 添加好友相关数据
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      // 创建群聊相关数据
      friends: [],
      selectedMembers: []
    }
  },
  computed: {
    canCreateGroup() {
      return this.selectedMembers.length >= 2;
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close');
    },

    // 切换卡片
    switchTab(tab) {
      this.activeTab = tab;
      if (tab === 'group' && this.friends.length === 0) {
        // todo 切换到创建群组 可以单独在显示好友列表加个loading
        this.loadFriendsForGroup();
      }
    },

    // 添加好友相关方法
    handleSearchInput() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
      }
    },
    async searchFriends() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }

      this.isSearching = true;

      try {
        const response = await getListByName(this.searchQuery);
        this.searchResults = response.data.map(user => ({
          id: user.id,
          name: user.username,
          avatar: user.avatar,
          isOnline: user.isOnline,
          sex: user.sex,
          requestSent: false
        }));
      } catch (error) {
        console.error('搜索用户失败:', error);
        this.searchResults = [];
      } finally {
        this.isSearching = false;
      }
    },
    sendFriendRequest(userId) {
      const user = this.searchResults.find(u => u.id === userId);
      const reqData = {
        friendId: userId
      }
      sendFriendRequest(reqData).then(response => {
        if (response.code === 200) {
          user.requestSent = true;
          this.$message.success('添加好友请求已发送');
        }
      })
    },

    // 创建群聊相关方法
    async loadFriendsForGroup() {
      try {
        const response = await getFriendList();
        this.friends = response.data.map(friend => ({
          userId: friend.userId,
          name: friend.username,
          avatar: friend.avatar
        }));
      } catch (error) {
        console.error('加载好友列表失败:', error);
        this.$message.error('加载好友列表失败');
      }
    },

    // 创建群聊 选中成员
    toggleMemberSelection(memberId) {
      const index = this.selectedMembers.indexOf(memberId);
      if (index === -1) {
        this.selectedMembers.push(memberId);
      } else {
        this.selectedMembers.splice(index, 1);
      }
    },

    // 创建群组
    async createGroup() {
      if (!this.canCreateGroup) return;
      const currentUserId = getObject('userInfo').id;

      const groupData = {
        memberIds: [currentUserId, ...this.selectedMembers]
      };

      const response = await createGroup(groupData);
      if (response.code === 200) {
        this.$message.success('群聊创建成功');
        this.closeDialog();
        this.$emit('group-created', response.data);
      } else {
        this.$message.error(response.msg || '创建群聊失败');
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.searchInput?.focus();
    });
  }
}
</script>

<style scoped>
/* 弹框遮罩层 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 多卡片弹框 */
.multi-card-dialog {
  width: 460px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: dialog-fade 0.3s ease-out;
}

@keyframes dialog-fade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 弹框标题栏 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e6e6e6;
  height: 56px;
}

.dialog-tabs {
  display: flex;
  height: 100%;
}

.tab-item {
  padding: 0 16px;
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  position: relative;
  transition: all 0.2s;
}

.tab-item:hover {
  color: #333;
}

.tab-item.active {
  color: #07C160;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 3px;
  background: #07C160;
  border-radius: 3px 3px 0 0;
}

.dialog-close {
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0 5px;
  line-height: 1;
}

.dialog-close:hover {
  color: #333;
}

/* 卡片内容区域 */
.card-content {
  padding: 20px;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}

/* 添加好友卡片样式 */
.search-section {
  display: flex;
  margin-bottom: 16px;
}

.search-section input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-section input:focus {
  border-color: #07C160;
}

.search-btn {
  margin-left: 12px;
  padding: 0 16px;
  background: #07C160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #06AD56;
}

.search-results {
  margin-top: 16px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.result-item:hover {
  background-color: #f9f9f9;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 4px;
  background: #07C160;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
  flex-shrink: 0;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.name-line {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.user-sex {
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
}

.sex-icon {
  width: 14px;
  height: 14px;
  margin-right: 2px;
}

.user-status {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 10px;
  background-color: #f5f5f5;
}

.user-status.online {
  color: #07C160;
}

.user-status.offline {
  color: #999;
}

.status-icon {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  background-color: currentColor;
}

.user-id {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.add-btn {
  padding: 6px 16px;
  background: #07C160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 12px;
}

.add-btn:hover {
  background: #06AD56;
}

.add-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.no-results,
.search-tips {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
  line-height: 1.5;
}

/* 创建群聊卡片样式 */
.group-creation-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-item input,
.form-item select,
.form-item textarea {
  padding: 10px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
  border-color: #07C160;
}

.form-item textarea {
  resize: vertical;
}

.member-selection {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.member-selection label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.member-item:hover {
  background-color: #f5f5f5;
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #07C160;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
  flex-shrink: 0;
  overflow: hidden;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.member-checkbox.selected {
  background: #07C160;
  border-color: #07C160;
}

.member-checkbox .check-icon {
  width: 10px;
  height: 6px;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(-45deg);
  margin-top: -2px;
}

.create-group-btn {
  margin-top: 16px;
  padding: 10px 0;
  background: #07C160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
}

.create-group-btn:hover {
  background: #06AD56;
}

.create-group-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style>
