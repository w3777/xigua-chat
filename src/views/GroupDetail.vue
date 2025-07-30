<template>
  <div class="group-right">
    <div class="group-detail">
      <div class="detail-close" @click="closeDetail">
        <i class="el-icon-close"> × </i>
      </div>
      <div class="detail-header">
        <img :src="groupDetail.groupAvatar" alt="群头像" class="detail-avatar">
        <div class="detail-name">
          {{ groupDetail.groupName }}
          <span class="detail-status">
            {{ groupDetail.currentMember }}人
          </span>
        </div>
        <div class="detail-signature">
          {{ groupDetail.description || '这个群很懒，什么都没写' }}
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">基本信息</div>
        <div class="detail-rows">
          <div class="detail-row">
            <span class="row-label">群主：</span>
            <span class="row-value">{{ groupDetail.groupOwner || '未知' }}</span>
          </div>
          <div class="detail-row">
            <span class="row-label">地区：</span>
            <span class="row-value">{{ groupDetail.region || '未知' }}</span>
          </div>
          <div class="detail-row">
            <span class="row-label">创建时间：</span>
            <span class="row-value">{{ groupDetail.createTime }}</span>
          </div>
          <div class="detail-row">
            <span class="row-label">群号：</span>
            <span class="row-value">{{ 'xg_' + groupDetail.groupId || '未知' }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">社交信息</div>
        <div class="detail-row">
          <span class="row-label">加入时间：</span>
          <span class="row-value">{{ groupDetail.joinTime }}</span>
        </div>
        <div class="detail-row">
          <span class="row-label">我的角色：</span>
          <span class="row-value">{{ groupDetail.roleName }}</span>
        </div>
      </div>

      <div class="detail-actions">
        <div class="action-btn-container">
          <button class="action-btn chat-btn" @click="startGroupChat(groupDetail.groupId)">
            <i class="icon-message"></i> 发送消息
          </button>
        </div>
        <div class="action-btn-container">
          <button class="action-btn quit-btn" @click="quitGroup()" v-if="groupDetail.role !== 1">
            <i class="icon-delete"></i> 退出群聊
          </button>
          <button class="action-btn delete-btn" @click="disbandGroup()" v-if="groupDetail.role === 1">
            <i class="icon-delete"></i> 解散群聊
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getGroupDetail } from '@/api/group.js'

export default {
  data() {
    return {
      groupDetail: {
        groupId: '',
        groupName: '',
        groupAvatar: '',
        description: '',
        groupOwner: '',
        currentMember: 0,
        region: '',
        createTime: '',
        joinTime: '',
        roleName: ''
      },
    }
  },
  created() {
  },
  methods: {
    startGroupChat(groupId) {
      set('activeMenu', 'chat');
      this.$router.push({
        path: 'Chat',
        query: {
          "groupId": groupId
        }
      })
    },

    getGroupDetail(groupId) {
      getGroupDetail(groupId).then(response => {
        if (response.code === 200) {
          this.groupDetail = response.data
        } else {
          this.groupDetail = null;
          this.$message.error('获取群组详情失败')
        }
      })
    },

    quitGroup() {
      this.$confirm(`确定要退出群聊 ${this.groupDetail.groupName} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用退出群聊API
        console.log('退出群聊:', this.groupDetail.groupId)
        this.$message.success('已退出群聊')
        this.closeDetail()
      }).catch(() => {
        // 取消操作
      })
    },

    disbandGroup() {
      this.$confirm(`确定要解散群聊 ${this.groupDetail.groupName} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用解散群聊API
        console.log('解散群聊:', this.groupDetail.groupId)
        this.$message.success('群聊已解散')
        this.closeDetail()
      }).catch(() => {
        // 取消操作
      })
    },

    closeDetail() {
      this.$emit('close');
    },
  },
}
</script>

<style scoped>
.group-right {
  height: 100%;
}

.group-detail {
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
  max-width: 150px;
}

.action-btn {
  padding: 8px 16px;
  min-width: 100px;
  border-radius: 18px;
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

.quit-btn {
  background-color: #f8f8f8;
  color: #f56c6c;
  border: 1px solid #f0f0f0;
}

.quit-btn:hover {
  background-color: #fef0f0;
  color: #f56c6c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 108, 108, 0.1);
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
}

.delete-btn:hover {
  background-color: #e65c5c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 108, 108, 0.2);
}

.detail-rows {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.detail-row {
  flex: 0 0 calc(50% - 8px);
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
  background: #e6e6e6;
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
