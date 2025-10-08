<template>
  <div class="bot-right">
    <div class="bot-detail">
      <div class="detail-close" @click="closeDetail">
        <i class="el-icon-close"> × </i>
      </div>

      <!-- 头部信息 -->
      <div class="detail-header">
        <img :src="botDetail.avatar" alt="机器人头像" class="detail-avatar" @error="handleAvatarError">
        <div class="detail-name">
          {{ botDetail.name || '未命名机器人' }}
        </div>
        <div class="detail-signature">
          {{ botDetail.description || '这个机器人很神秘，没有留下任何描述' }}
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="detail-section">
        <div class="section-title">基本信息</div>
        <div class="detail-rows">
          <div class="detail-row">
            <span class="row-label">机器人：</span>
            <span class="row-value">{{ 'xg_' + botDetail.id }}</span>
          </div>
          <div class="detail-row">
            <span class="row-label">创建时间：</span>
            <span class="row-value">{{ botDetail.createTime }}</span>
          </div>
          <div class="detail-row">
            <span class="row-label">描述：</span>
            <span class="row-value">{{ botDetail.description }}</span>
          </div>
        </div>
      </div>

      <!-- 提示词配置 -->
      <div class="detail-section">
        <div class="section-title">
          <span>提示词配置</span>
          <el-tooltip content="提示词决定了机器人的行为和回复风格" placement="top">
            <i class="el-icon-info" style="margin-left: 5px; color: #909399;"></i>
          </el-tooltip>
        </div>
        <div class="prompt-content" @click="viewFullPrompt">
          <div class="prompt-preview">
            {{ truncatePrompt(botDetail.prompt) }}
            <span class="prompt-more" v-if="isPromptTooLong" @click="viewFullPrompt">...点击查看完整提示词</span>
          </div>
          <div class="prompt-stats">
            <span class="stat-item">字数: {{ getPromptLength(botDetail.prompt) }}</span>
            <span class="stat-item">Tokens: {{ estimateTokens(botDetail.prompt) }}</span>
          </div>
        </div>
      </div>

      <!-- 使用统计 -->
      <div class="detail-section" v-if="showUsageStats">
        <div class="section-title">使用统计</div>
        <div class="detail-rows">
          <div class="detail-row">
            <span class="row-label">今日对话：</span>
            <span class="row-value">{{ botDetail.todayConversations || 0 }}次</span>
          </div>
          <div class="detail-row">
            <span class="row-label">总对话数：</span>
            <span class="row-value">{{ botDetail.totalConversations || 0 }}次</span>
          </div>
          <div class="detail-row">
            <span class="row-label">满意度：</span>
            <span class="row-value">
              <el-rate
                  v-model="botDetail.satisfactionRate"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}">
              </el-rate>
            </span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="detail-actions">
        <div class="action-btn-container">
          <button class="action-btn chat-btn" @click="startBotChat">
            <i class="icon-message"></i> 发送消息
          </button>
        </div>
        <div class="action-btn-container">
          <button class="action-btn edit-btn" @click="editBot">
            <i class="icon-edit"></i> 编辑配置
          </button>
        </div>
        <div class="action-btn-container">
          <button class="action-btn delete-btn" @click="deleteBot">
            <i class="icon-delete"></i> 删除机器人
          </button>
        </div>
      </div>

      <!-- 完整提示词对话框 -->
      <el-dialog
          v-model="promptDialogVisible"
          title="完整提示词"
          width="60%"
          custom-class="prompt-dialog">
        <div class="full-prompt">
          <pre>{{ botDetail.prompt || '暂无提示词配置' }}</pre>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="promptDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="copyPrompt">复制提示词</el-button>
          </span>
        </template>
      </el-dialog>

<!--      &lt;!&ndash; 编辑机器人对话框 &ndash;&gt;-->
<!--      <el-dialog-->
<!--          title="编辑机器人"-->
<!--          :visible.sync="editDialogVisible"-->
<!--          width="500px"-->
<!--          @close="handleEditClose">-->
<!--        <el-form :model="editForm" label-width="80px" :rules="formRules" ref="editForm">-->
<!--          <el-form-item label="名称" prop="name">-->
<!--            <el-input v-model="editForm.name" placeholder="请输入机器人名称" maxlength="50" show-word-limit />-->
<!--          </el-form-item>-->
<!--          <el-form-item label="头像" prop="avatar">-->
<!--            <div class="avatar-upload">-->
<!--              <img :src="editForm.avatar || defaultAvatar" class="avatar-preview" @error="handleAvatarError">-->
<!--              <el-upload-->
<!--                  class="avatar-uploader"-->
<!--                  action="#"-->
<!--                  :show-file-list="false"-->
<!--                  :before-upload="beforeAvatarUpload"-->
<!--                  :http-request="handleAvatarUpload">-->
<!--                <el-button size="small">更换头像</el-button>-->
<!--              </el-upload>-->
<!--            </div>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="描述" prop="description">-->
<!--            <el-input-->
<!--                type="textarea"-->
<!--                v-model="editForm.description"-->
<!--                placeholder="请输入机器人描述"-->
<!--                maxlength="300"-->
<!--                show-word-limit-->
<!--                :rows="3" />-->
<!--          </el-form-item>-->
<!--          <el-form-item label="提示词" prop="prompt">-->
<!--            <el-input-->
<!--                type="textarea"-->
<!--                v-model="editForm.prompt"-->
<!--                placeholder="请输入机器人提示词，这将决定机器人的行为和回复风格"-->
<!--                :rows="6"-->
<!--                show-word-limit />-->
<!--            <div class="prompt-tips">-->
<!--              <i class="el-icon-info"></i>-->
<!--              提示词质量直接影响机器人回复效果，建议详细描述角色、能力和回复风格-->
<!--            </div>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--        <div slot="footer" class="dialog-footer">-->
<!--          <el-button @click="editDialogVisible = false">取消</el-button>-->
<!--          <el-button type="primary" @click="saveEdit" :loading="saving">保存</el-button>-->
<!--        </div>-->
<!--      </el-dialog>-->
    </div>
  </div>
</template>

<script>
import { getBotDetail } from '@/api/bot.js'

export default {
  data() {
    return {
      botDetail: {
        id: '',
        name: '',
        avatar: '',
        description: '',
        prompt: '',
        createTime: '',
      },
      promptDialogVisible: false,
      editDialogVisible: false,
      saving: false,
      editForm: {
        name: '',
        avatar: '',
        description: '',
        prompt: ''
      },
      formRules: {
        name: [
          { required: true, message: '请输入机器人名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        description: [
          { max: 300, message: '描述不能超过 300 个字符', trigger: 'blur' }
        ]
      },
      defaultAvatar: '/default-bot-avatar.png'
    }
  },
  computed: {
    isPromptTooLong() {
      return (this.botDetail.prompt || '').length > 150
    },
    showUsageStats() {
      return this.botDetail.totalConversations > 0
    }
  },
  methods: {
    // 获取机器人详情
    getBotDetail(botId) {
      getBotDetail(botId).then(response => {
        if (response.code === 200) {
          this.botDetail = response.data
          this.$emit('detail-loaded', this.botDetail)
        } else {
          this.$message.error('获取机器人详情失败')
        }
      }).catch(error => {
        console.error('获取机器人详情失败:', error)
        this.$message.error('获取机器人详情失败')
      })
    },

    // 提示词相关方法
    truncatePrompt(prompt) {
      if (!prompt) return '暂无提示词配置'
      return prompt.length > 150 ? prompt.substring(0, 150) : prompt
    },

    getPromptLength(prompt) {
      return (prompt || '').length
    },

    estimateTokens(prompt) {
      // 简单的token估算：中文字符算1个token，英文字符算0.25个token
      if (!prompt) return 0
      const chineseChars = prompt.match(/[\u4e00-\u9fa5]/g) || []
      const otherChars = prompt.length - chineseChars.length
      return Math.ceil(chineseChars.length + otherChars * 0.25)
    },

    viewFullPrompt() {
      this.promptDialogVisible = true
    },

    copyPrompt() {
      if (!this.botDetail.prompt) {
        this.$message.warning('暂无提示词可复制')
        return
      }

      navigator.clipboard.writeText(this.botDetail.prompt).then(() => {
        this.$message.success('提示词已复制到剪贴板')
      }).catch(() => {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = this.botDetail.prompt
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        this.$message.success('提示词已复制到剪贴板')
      })
    },

    // 时间格式化
    formatTime(time) {
      if (!time) return '未知'
      // return this.$dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },

    // 头像错误处理
    handleAvatarError(event) {
      event.target.src = this.defaultAvatar
    },

    // 操作相关方法
    startBotChat() {
      this.$emit('start-chat', this.botDetail.id)
    },

    editBot() {
      this.editForm = { ...this.botDetail }
      this.editDialogVisible = true
    },

    handleEditClose() {
      this.$refs.editForm?.clearValidate()
    },

    beforeAvatarUpload(file) {
      const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPGOrPNG) {
        this.$message.error('头像只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('头像大小不能超过 2MB!')
      }
      return isJPGOrPNG && isLt2M
    },

    handleAvatarUpload(options) {
      // 这里实现头像上传逻辑
      const formData = new FormData()
      formData.append('file', options.file)

      // 模拟上传成功
      setTimeout(() => {
        this.editForm.avatar = URL.createObjectURL(options.file)
        this.$message.success('头像上传成功')
      }, 1000)
    },

    saveEdit() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.saving = true
          updateBot(this.botDetail.id, this.editForm).then(response => {
            if (response.code === 200) {
              this.$message.success('机器人配置更新成功')
              this.editDialogVisible = false
              this.getBotDetail(this.botDetail.id) // 刷新详情
            } else {
              this.$message.error('更新失败：' + response.message)
            }
          }).finally(() => {
            this.saving = false
          })
        }
      })
    },

    deleteBot() {
      this.$confirm(`确定要删除机器人 "${this.botDetail.name}" 吗？此操作不可恢复。`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }).then(() => {
        deleteBot(this.botDetail.id).then(response => {
          if (response.code === 200) {
            this.$message.success('机器人删除成功')
            this.$emit('bot-deleted')
            this.closeDetail()
          } else {
            this.$message.error('删除失败：' + response.message)
          }
        })
      }).catch(() => {
        // 取消操作
      })
    },

    closeDetail() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.bot-right {
  height: 100%;
}

.bot-detail {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  position: relative;
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
  cursor: pointer;
}

.detail-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.detail-signature {
  font-size: 14px;
  color: #999;
  line-height: 1.4;
}

.section-title {
  padding: 8px 16px;
  font-size: 14px;
  color: #999;
  background-color: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.detail-section {
  margin-bottom: 20px;
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

/* 提示词样式 */
.prompt-content {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 12px;
  border-left: 3px solid #409EFF;
}

.prompt-preview {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.prompt-preview:hover {
  color: #333;
}

.prompt-more {
  color: #409EFF;
  font-size: 12px;
}

.prompt-stats {
  margin-top: 8px;
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 12px;
  color: #909399;
}

/* 完整提示词对话框 */
.full-prompt {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.full-prompt pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  color: #333;
}

/* 编辑表单样式 */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #dcdfe6;
}

.prompt-tips {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  font-size: 12px;
  color: #409EFF;
  border-left: 3px solid #409EFF;
}

.prompt-tips i {
  margin-right: 4px;
}

/* 操作按钮 */
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

.edit-btn {
  background-color: #409EFF;
  color: white;
}

.edit-btn:hover {
  background-color: #337ecc;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
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

/* 对话框样式优化 */
:deep(.prompt-dialog) {
  border-radius: 8px;
}

:deep(.prompt-dialog .el-dialog__header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 20px;
}

:deep(.prompt-dialog .el-dialog__body) {
  padding: 20px;
}

:deep(.prompt-dialog .el-dialog__footer) {
  border-top: 1px solid #f0f0f0;
  padding: 16px 20px;
}
</style>
