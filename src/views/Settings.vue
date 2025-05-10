<template>
  <div class="settings">
    <div class="setting-item" @click="$router.push('/settings/profile')">
      <i class="icon">👤</i>
      <span>个人资料</span>
      <i class="arrow">→</i>
    </div>
    <!-- 其他设置项... -->
  </div>
</template>

<style scoped>
.setting-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.setting-item:hover {
  background: #f9f9f9;
}
.arrow {
  margin-left: auto;
}
</style>
