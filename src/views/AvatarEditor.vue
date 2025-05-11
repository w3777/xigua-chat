<template>
  <div class="avatar-editor-container">
    <!-- 编辑器头部 -->
    <div class="editor-header">
      <h2 class="editor-title">编辑头像</h2>
      <button class="close-button" @click="$emit('back')">
        <img src="@/static/icons/close.png" alt="关闭" />
      </button>
    </div>

    <!-- 图片预览和编辑区域 -->
    <div class="editor-content">
      <!-- 当前头像预览 -->
      <div class="avatar-preview">
        <img :src="currentImage" class="preview-image" alt="头像预览">
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="selectImage" class="btn select-btn">选择图片</button>
        <button
            @click="saveAvatar"
            class="btn save-btn"
            :disabled="!hasChanges"
        >
          保存
        </button>
      </div>

      <!-- 隐藏的文件输入 -->
      <input
          type="file"
          ref="fileInput"
          accept="image/*"
          @change="handleFileSelect"
          style="display: none;"
      >
    </div>
  </div>
</template>

<script>
import { uploadFile } from '@/api/file'
import { uploadAvatar, getUserInfo } from '@/api/user'

export default {
  props: {
    initialImage: {
      type: String,
      default: '' // 默认值
    }
  },
  data() {
    return {
      currentImage: this.initialImage,
      selectedFile: null,
      hasChanges: false
    }
  },
  methods: {
    selectImage() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) {
        // 直接预览选择的图片
        const reader = new FileReader();
        reader.onload = (event) => {
          this.currentImage = event.target.result;
          this.selectedFile = file;
          this.hasChanges = true;
        };
        reader.readAsDataURL(file);
      }
    },
    async saveAvatar() {
      if (!this.selectedFile) {
        this.$emit('confirm', null);
        return;
      }

      // 通过文件后缀名验证图片类型（更简单的方式）
      const validExtensions = ['.jpg', '.png',];
      const fileExtension = this.selectedFile.name.toLowerCase()
          .slice(this.selectedFile.name.lastIndexOf('.'));

      if (!validExtensions.includes(fileExtension)) {
        this.$message.error('请上传常规图片格式（JPG/PNG）');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        // 调用上传接口（根据您的后端接口）
        uploadFile(this.selectedFile).then(response => {
          if (response.code !== 200) {
            this.$message.error(response.data.msg || '上传失败');
            return;
          }
          // 上传头像
          uploadAvatar(response.data)
          // todo 更新个人信息  更新最左侧菜单头像
          this.$message.success('头像更新成功');
        })
      } catch (error) {
        console.error('上传出错:', error);
        this.$message.error('上传服务异常，请稍后重试');
      }
    }
  }
}
</script>

<style scoped>
.avatar-editor-container {
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.editor-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  text-align: left;
  flex: 1;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.close-button:hover::after {
  content: "关闭";
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

.close-button img {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-button:hover img {
  opacity: 1;
}

.editor-content {
  flex: 1;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.action-buttons {
  display: flex;
  gap: 15px;
  width: 100%;
  max-width: 300px;
}

.btn {
  flex: 1;
  padding: 12px 0;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
  outline: none;
}

.select-btn {
  background-color: #f7f7f7;
  color: #333;
}

.select-btn:hover {
  background-color: #eee;
}

.save-btn {
  background-color: #07C160;
  color: white;
}

.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
