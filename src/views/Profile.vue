<template>
  <div class="profile-container">
    <!-- 头部 -->
    <div class="profile-header">
      <div class="profile-title">个人信息</div>
    </div>

    <!-- 内容区域 -->
    <div class="profile-main-content">
      <div class="profile-left">
        <!-- 头像区域 -->
        <div class="profile-section" @click="editAvatar">
          <div class="section-label">头像</div>
          <div class="section-value">
            <div class="avatar-wrapper">
              <img :src="userInfo.avatar" class="avatar" alt="头像">
              <i class="edit-icon">✎</i>
            </div>
          </div>
        </div>

        <!-- 表单区域 -->
        <form @submit.prevent="handleSubmit" class="profile-form">
          <!-- 昵称 -->
          <div class="profile-section">
            <div class="section-label">名字</div>
            <div class="section-value">
              <input v-model="formData.username" class="form-input" type="text">
            </div>
          </div>

          <!-- 微信号 -->
          <div class="profile-section">
            <div class="section-label">微信号</div>
            <div class="id-input-container">
              <span class="id-prefix">xgid_</span>
              <input
                  v-model="formData.id"
                  class="form-input with-prefix"
                  type="text"
              >
            </div>
          </div>

          <!-- 更多信息 -->
          <div class="info-group">
            <div class="group-title">更多信息</div>
            <!-- 性别 -->
            <div class="profile-section">
              <div class="section-label">性别</div>
              <div class="section-value">
                <div class="sex-select-wrapper">
                  <select v-model="formData.sex" class="sex-select">
                    <option value="1">男</option>
                    <option value="2">女</option>
                  </select>
                  <i class="select-arrow">▼</i>
                </div>
              </div>
            </div>

            <!-- 地区 -->
            <div class="profile-section">
              <div class="section-label">地区</div>
              <div class="section-value">
                <input v-model="formData.region" class="form-input" type="text">
              </div>
            </div>

            <!-- 个性签名 -->
            <div class="profile-section">
              <div class="section-label">个性签名</div>
              <div class="section-value">
                <input v-model="formData.signature" class="form-input" type="text">
              </div>
            </div>
          </div>

          <!-- 保存按钮 -->
          <div class="save-button-container">
            <button type="submit" class="save-button">保存</button>
          </div>
        </form>
      </div>

      <div class="profile-right">
        <!-- 头像编辑器 -->
        <AvatarEditorView
            v-if="showAvatarEditor"
            :initialImage="avatarImage"
            @confirm="handleAvatarConfirm"
            @back="handleCloseEditor"
        />
        <WelcomeWelcome v-else />
      </div>
    </div>
  </div>
</template>

<script>
import {getUserInfo, updateUserInfo} from "@/api/user.js";
import AvatarEditorView from "./AvatarEditor.vue";
import router from "@/router";
import WelcomeWelcome from "@/components/WelcomeWelcome.vue";

export default {
  components: {
    AvatarEditorView,
    WelcomeWelcome
  },
  data() {
    return {
      formData: {
        username: '',
        id: '',
        sex: null,
        region: '',
        signature: ''
      },
      defaultSignature: '这个人很懒，什么都没留下',
      userInfo: {
        avatar: ""
      },
      showAvatarEditor: false,
      avatarImage: ''
    }
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    editAvatar() {
      this.showAvatarEditor = true;
      // 传递当前头像
      this.avatarImage = this.userInfo.avatar;
    },
    async getUserInfo() {
      // 调用回显接口获取用户信息
      const response = await getUserInfo();
      const data = response.data;

      // 填充表单数据
      this.formData = {
        username: data.username,
        id: data.id,
        sex: data.sex,
        region: data.region,
        signature: data.signature || this.defaultSignature
      };

      // 单独设置头像
      this.userInfo.avatar = data.avatar || '';
    },
    handleSubmit() {
      // todo 校验
      this.formData.signature === this.defaultSignature ? '' : this.formData.signature
      console.log(this.formData)
      updateUserInfo(this.formData).then(response => {
        if (response.code === 200) {
          this.$message.success('更新成功');
        }
      })
    },
    // 关闭头像编辑器
    closeAvatarEditor() {
      this.showAvatarEditor = false;
    },
    // 处理头像确认
    handleAvatarConfirm(newAvatar) {
      this.userInfo.avatar = newAvatar;
      this.closeAvatarEditor();
    },
    handleCloseEditor() {
      this.showAvatarEditor = false;
    },
    handleBack() {
      // 使用 Vue Router 的 go(-1) 实现返回上一页
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.profile-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.profile-header {
  width: 30%;
  height: 44px;
  background-color: #ededed;
  display: flex;
  align-items: center;
  position: relative;
}

.back-button {
  font-size: 20px;
  color: #07C160;
  margin-right: 15px;
  cursor: pointer;
  position: relative;
  display: inline-block;
  padding: 0 15px;
}

.back-button:hover::after {
  content: "返回";
  position: absolute;
  left: 50%;
  bottom: -25px;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.icon-back {
  cursor: pointer;
  display: inline-block;
  padding: 5px;
}

.profile-title {
  font-size: 17px;
  font-weight: 500;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.profile-main-content {
  display: flex; /* 启用flex布局 */
  flex: 1; /* 占据剩余空间 */
  overflow: hidden; /* 防止内容溢出 */
}

.profile-left {
  width: 30%;
  height: 100%;
  border-right: 1px solid #ddd;
}

.profile-right {
  width: 70%;
  height: 100%;
}

.profile-section {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
}

.section-label {
  width: 80px;
  font-size: 16px;
  color: #333;
}

.section-value {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 15px;
}

.avatar-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.edit-icon {
  position: absolute;
  right: -5px;
  bottom: -5px;
  background-color: #07C160;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.info-group {
  margin-top: 15px;
}

.group-title {
  padding: 5px 15px;
  font-size: 14px;
  color: #888;
  background-color: #f5f5f5;
}

.form-input, .form-select {
  border: none;
  text-align: right;
  width: 100%;
  padding: 5px 0;
  font-size: 15px;
  color: #999;
  background: transparent;
  outline: none;
}

.form-select {
  appearance: none;
  text-align-last: right;
}

.save-button-container {
  padding: 20px 15px;
  margin-top: 20px;
}

.save-button {
  width: 100%;
  padding: 12px 0;
  background-color: #07C160;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.save-button:active {
  background-color: #06AD56;
}

.sex-select-wrapper {
  position: relative;
  width: 100%;
}

.sex-select {
  width: 100%;
  padding: 8px 25px 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  color: #333;
  font-size: 15px;
  appearance: none;
  outline: none;
  transition: border-color 0.3s;
}

.sex-select:focus {
  border-color: #07C160;
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #999;
  font-size: 12px;
}

/* 下拉选项样式 */
.sex-select option {
  padding: 8px;
  background: white;
  color: #333;
}

/* 悬停效果 */
.sex-select option:hover {
  background-color: #f5f5f5;
}

.id-input-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

/* 前缀样式 */
.id-prefix {
  position: absolute;
  left: 0;
  padding: 0 5px;
  color: #888;
  font-size: 15px;
  pointer-events: none; /* 防止干扰输入框点击 */
  z-index: 1;
}

/* 输入框样式调整 */
.form-input.with-prefix {
  padding-left: 40px; /* 根据前缀宽度调整 */
  width: 100%;
  box-sizing: border-box;
}

/* 保持原有输入框基础样式 */
.form-input {
  border: none;
  text-align: right;
  padding: 5px 0;
  font-size: 15px;
  color: #999;
  background: transparent;
  outline: none;
}

/* 聚焦状态 */
.form-input.with-prefix:focus {
  padding-left: 45px; /* 保持前缀空间 */
}
</style>
