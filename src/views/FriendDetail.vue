<template>
  <div class="friend-right">
    <div class="friend-detail">
      <div class="detail-close" @click="closeDetail">
        <i class="el-icon-close"> × </i>
      </div>
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
</template>

<script>
import {delFriend, getFriendDetail} from '@/api/friendRelation.js'
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
  created() {

  },
  computed: {

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

    getFriendDetail(friendId) {
      getFriendDetail(friendId).then(response => {
        if (response.code === 200) {
          this.friendDetail = response.data
        }else{
          this.friendDetail = null;
          this.$message.error('获取好友详情失败')
        }
      })
    },

    // 删除好友
    deleteFriend() {
      const friend = this.friendDetail;
      if (!friend) {
        this.$message.error('请先获取好友详情');
        return;
      }

      // 删除好友逻辑
      this.$confirm(`确定要删除好友 ${friend.username} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delFriend(friend.userId).then(response => {
          if (response.code === 200) {
            this.$message.success('删除好友成功');
            // 刷新好友列表
            this.$parent.getContactCount();
            this.$parent.getFriendList();
            // 关闭详情页
            this.closeDetail();
          }else{
            this.$message.error('删除好友失败')
          }
        })
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

    closeDetail() {
      this.$emit('close'); // 触发close事件通知父组件
    },
  },
}
</script>

<style scoped>
.friend-right {
  height: 100%;
}

.friend-detail {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.section-title {
  padding: 8px 16px;
  font-size: 14px;
  color: #999;
  background-color: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
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

.detail-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e6e6e6;;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.detail-close:hover {
  background: #d9d9d9;
}

.detail-close i {
  font-size: 16px;
  color: #666;
}
</style>
