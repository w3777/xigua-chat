<template>
  <!-- 添加好友弹框 -->
  <div class="dialog-overlay" v-if="showDialog">
    <div class="add-friend-dialog">
      <!-- 弹框标题栏 -->
      <div class="dialog-header">
        <div class="dialog-title">添加好友</div>
        <div class="dialog-close" @click="closeDialog">×</div>
      </div>

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
            <img v-if="user.sex === 1" src="@/static/icons/man.png" alt="男" class="sex-icon">
            <img v-if="user.sex === 2" src="@/static/icons/woman.png" alt="女" class="sex-icon">
          </span>
              <span class="user-status" :class="{'online': user.connectStatus === 1, 'offline': user.connectStatus === 2}">
                <i class="status-icon"></i>
                {{ user.connectStatus === 1 ? '在线' : '离线' }}
              </span>
            </div>
            <div class="user-id">微信号: {{ user.id }}</div>
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
  </div>
</template>

<script>
import {getListByName} from "@/api/user.js";

export default {
  data() {
    return {
      showDialog: true,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
    }
  },
  methods: {
    closeDialog() {
      this.showDialog = false;
      this.$emit('close');
    },
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
          id: 'xg_' + user.id,
          name: user.username,
          avatar: user.avatar,
          connectStatus: user.connectStatus,
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
      if (user) {
        user.requestSent = true;
        console.log(`好友请求已发送给: ${userId}`);
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.searchInput.focus();
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

/* 添加好友弹框 */
.add-friend-dialog {
  width: 420px;
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
  padding: 16px 20px;
  border-bottom: 1px solid #e6e6e6;
}

.dialog-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
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

/* 搜索区域 */
.search-section {
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
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

/* 搜索结果列表 */
.search-results {
  max-height: 360px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
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
  font-size: 14px;
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

/* 无结果提示和搜索提示 */
.no-results,
.search-tips {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
  line-height: 1.5;
}

/* 头像样式 */
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
  overflow: hidden; /* 确保图片不会超出容器 */
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持图片比例并填满容器 */
}

/* 性别图标样式 */
.user-gender {
  margin-right: 8px;
  font-size: 14px;
}

/* 性别图标样式 */
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
</style>
