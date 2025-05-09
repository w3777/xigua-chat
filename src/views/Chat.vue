<template>
  <div class="wechat-app">
    <!-- 左侧菜单栏 -->
    <div class="menu-bar">
      <div class="user-avatar">
        <img src="@/static/images/user_default.png" alt="头像">
      </div>
      <div class="menu-item">
        <i class="icon-message">💬</i>
      </div>
      <div class="menu-item">
        <i class="icon-contacts">👥</i>
      </div>
      <div class="menu-item">
        <i class="icon-discover">🌍</i>
      </div>
      <div class="menu-item">
        <i class="icon-moments">📱</i>
      </div>
      <div class="menu-item settings">
        <i class="icon-settings">⚙️</i>
      </div>
    </div>

    <!-- 左侧联系人列表 -->
    <div class="contact-list">
      <div class="search-bar">
        <input type="text" placeholder="搜索">
        <span class="back-btn">+</span>
      </div>

      <div class="contact active">
        <div class="avatar">郝</div>
        <div class="info">
          <div class="name">郝宇恒</div>
          <div class="last-msg">在吗</div>
        </div>
        <div class="time">14:30</div>
      </div>

      <div class="contact">
        <div class="avatar">西瓜</div>
        <div class="info">
          <div class="name">西瓜</div>
          <div class="last-msg">[动画表情]</div>
        </div>
        <div class="time">18:25</div>
      </div>
    </div>

    <!-- 右侧聊天窗口 -->
    <div class="chat-window">
      <!-- 聊天标题栏 -->
      <div class="chat-header">
        <div class="chat-title">郝宇恒</div>
        <div class="chat-actions">
          <i class="icon-action">...</i>
        </div>
      </div>

      <!-- 聊天内容区域 -->
      <div class="messages">
        <div class="message received">
          <div class="content">你好</div>
        </div>
        <div class="message received">
          <div class="content">在吗</div>
        </div>
        <div class="message sent">
          <div class="content">嗯嗯</div>
        </div>
        <div class="message sent">
          <div class="content">在的</div>
        </div>
      </div>

      <div class="input-container">
        <div class="input-tools">
          <div class="left-tools">
            <i class="icon-tool">😊</i>
            <i class="icon-tool">📷</i>
          </div>
          <div class="right-tools">
            <i class="icon-tool">🎤</i>
            <i class="icon-tool">📹</i>
          </div>
        </div>

        <!-- 输入和发送行 -->
        <div class="input-row">
          <input type="text" placeholder="发送消息">
          <button class="send-btn">发送(S)</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeChatApp'
}
</script>

<style scoped>
.wechat-app {
  display: flex;
  width: 1000px;
  height: 650px;
  margin: 0 auto;
  border: 1px solid #ddd;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 左侧菜单栏样式 */
.menu-bar {
  width: 70px;
  background: #2E2E2E;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 4px;
  margin-bottom: 30px;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-item {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7D7D7D;
  margin-bottom: 15px;
  cursor: pointer;
}

.menu-item.active {
  color: #07C160;
  border-left: 3px solid #07C160;
}

.menu-item.settings {
  margin-top: auto;
  margin-bottom: 20px;
}

/* 左侧联系人列表样式 */
.contact-list {
  width: 250px;
  background: #eee;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.search-bar input {
  flex: 1;
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  background: white;
  outline: none;
}

.search-bar .back-btn {
  margin-left: 10px;
  font-size: 20px;
  cursor: pointer;
}

.contact {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
}

.contact.active {
  background: #d9d9d9;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #07C160;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.info {
  flex: 1;
  overflow: hidden;
}

.name {
  font-size: 16px;
  margin-bottom: 4px;
  text-align: left;
}

.last-msg {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.time {
  font-size: 12px;
  color: #888;
  margin-left: 10px;
}

/* 右侧聊天窗口样式 */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  height: 50px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.chat-title {
  font-size: 18px;
  flex: 1;
  text-align: left;
}

.chat-actions {
  cursor: pointer;
}

.messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f5f5f5;
  background-image: url('@/static/images/background.png');
  background-size: cover;
  background-position: center;
}

.message {
  margin-bottom: 15px;
  max-width: 70%;
  display: flex;
}

.message.received {
  align-self: flex-start;
}

.message.sent {
  margin-left: auto;
  justify-content: flex-end;
}

.message .content {
  padding: 10px 15px;
  border-radius: 4px;
  display: inline-block;
  position: relative;
}

.message.received .content {
  background: white;
  border: 1px solid #e5e5e5;
}

.message.sent .content {
  background: #95EC69;
}

.input-tools {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 8px;
}

.left-tools {
  display: flex;
}

.icon-tool {
  margin-right: 15px;
  font-size: 20px;
  cursor: pointer;
  color: #7d7d7d;
}

.right-tools {
  margin-right: 0;
}

.input-row {
  display: flex;
  width: 100%;
}

.input-row input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  outline: none;
}

.input-row button {
  margin-left: 8px;
  padding: 0 12px;
  background: #07C160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-container {
  padding: 10px;
  background: #f5f5f5;
  border-top: 1px solid #e6e6e6;
}

.toolbar {
  margin-bottom: 8px;
  overflow: hidden; /* 清除浮动 */
}

.tool-icon {
  margin-right: 15px;
  font-size: 20px;
  cursor: pointer;
}

.input-row {
  display: flex;
}

.input-row input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  outline: none;
}

.send-btn {
  margin-left: 8px;
  padding: 0 15px;
  background: #07C160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
