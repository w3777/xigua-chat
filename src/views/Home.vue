<template>
  <div class="home-page">
    <!-- 顶部用户信息 -->
    <div class="user-header">
      <div class="greeting">
        <div class="analog-clock">
          <div class="clock-face">
            <div class="hand hour-hand" :style="hourStyle"></div>
            <div class="hand minute-hand" :style="minuteStyle"></div>
            <div class="hand second-hand" :style="secondStyle"></div>
          </div>
        </div>
        <div class="user-info">
          <h2>{{ greetingText }}，{{ this.currentUser?.username }}</h2>
          <p class="meta-info">
            {{ fullDateInfo }} |
            {{ location }} |
            天气：{{ weather.condition }} {{ weather.emoji }} {{ weather.temp }}℃
          </p>
        </div>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-value">{{ homeCount.friendCount }}</div>
        <div class="stat-label">好友</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ homeCount.unreadCount }}</div>
        <div class="stat-label">未读消息</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ homeCount.groupCount }}</div>
        <div class="stat-label">群聊</div>
      </div>
    </div>

    <!-- 快捷功能区 -->
    <div class="quick-actions">
      <h3 class="section-title">快捷入口</h3>
      <div class="action-grid">
        <div class="action-item" @click="$router.push('/chat')">
          <div class="action-icon" style="color: #07C160;">💬</div>
          <div class="action-text">发起聊天</div>
        </div>
        <div class="action-item" @click="showComingSoon">
          <div class="action-icon" style="color: #576B95;">👥</div>
          <div class="action-text">创建群聊</div>
        </div>
        <div class="action-item" @click="showComingSoon">
          <div class="action-icon" style="color: #FFCD00;">🌍</div>
          <div class="action-text">发现</div>
        </div>
        <div class="action-item" @click="$router.push('/profile')">
          <div class="action-icon" style="color: #FF9500;">👤</div>
          <div class="action-text">我的资料</div>
        </div>
      </div>
    </div>

    <div class="dashboard-section">
      <!-- 左侧：更新日志 (50%) -->
      <div class="update-log-panel">
        <div class="panel-header">
          <h3 class="panel-title">更新日志</h3>
          <div class="filter-tabs">
            <span class="tab active">全部</span>
            <span class="tab">新功能</span>
            <span class="tab">优化</span>
            <span class="tab">修复</span>
          </div>
        </div>

        <div class="scrollable-content">
          <!-- 体验环境上线卡片 -->
          <div class="update-card featured">
            <div class="card-header">
              <span class="version">体验版</span>
              <span class="date">2025年6月1日</span>
              <span class="tag milestone">里程碑</span>
            </div>
            <h4 class="card-title">体验环境上线</h4>
            <p class="card-desc">全新体验环境开放测试，欢迎反馈使用体验</p>
          </div>

          <!-- 月份分组 -->
          <div class="month-divider">2025年8月</div>

          <!-- 常规更新卡片 -->
          <div class="update-card">
            <div class="card-header">
              <span class="version">v1.0.0</span>
              <span class="date">08月12日</span>
              <span class="tag new">新功能</span>
            </div>
            <h4 class="card-title">消息失败重发功能上线</h4>
            <p class="card-desc">现在当消息发送失败时，系统会显示重试按钮</p>
          </div>

          <div class="update-card">
            <div class="card-header">
              <span class="version">v1.0.0</span>
              <span class="date">08月12日</span>
              <span class="tag optimized">优化</span>
            </div>
            <h4 class="card-title">消息抖动问题修复</h4>
            <p class="card-desc">优化了消息发送时的动画效果</p>
          </div>

          <div class="update-card">
            <div class="card-header">
              <span class="version">v1.0.0</span>
              <span class="date">08月03日</span>
              <span class="tag optimized">优化</span>
            </div>
            <h4 class="card-title">联系人页面改版</h4>
            <p class="card-desc">重新设计了联系人列表界面</p>
          </div>
        </div>
      </div>

      <!-- 右侧：本周活跃 (50%) -->
      <div class="activity-panel">
        <div class="panel-header">
          <h3 class="panel-title">本周活跃</h3>
          <span class="time-range">08.12-08.16</span>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">💬</div>
            <div class="stat-content">
              <div class="stat-value">128</div>
              <div class="stat-label">消息发送</div>
              <div class="trend up">↑12%</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <div class="stat-value">86%</div>
              <div class="stat-label">新增好友</div>
              <div class="trend up">↑5%</div>
            </div>
          </div>

          <div class="stat-card highlight">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-value">12.3</div>
              <div class="stat-label">日均使用(次)</div>
              <div class="trend up">↑8%</div>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
import { getLocation, getWeather } from "@/api/thirdParty.js";
import {getObject} from "@/utils/localStorage.js";
import {getHomeCount} from "@/api/home.js";
export default {
  name: 'Home',
  data() {
    return {
      time: new Date(),
      timer: null,
      location: '',
      weather: {
        condition: '',
        emoji: '',
        temp: ''
      },
      currentUser: {},
      homeCount: {
        friendCount: 0,
        unreadCount: 0,
        groupCount: 0
      }
    }
  },
  created() {
    this.currentUser = getObject('userInfo');
    this.getHomeCount()
  },
  computed: {
    greetingText() {
      const hour = this.time.getHours()
      if (hour < 6) return '凌晨好'
      if (hour < 9) return '早上好'
      if (hour < 12) return '上午好'
      if (hour < 14) return '中午好'
      if (hour < 18) return '下午好'
      return '晚上好'
    },
    fullDateInfo() {
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return `${this.time.getFullYear()}年${this.time.getMonth()+1}月${this.time.getDate()}日 ${weekdays[this.time.getDay()]}`
    },
    hourStyle() {
      return {
        transform: `rotate(${(this.time.getHours() % 12) * 30 + this.time.getMinutes() * 0.5}deg)`
      }
    },
    minuteStyle() {
      return {
        transform: `rotate(${this.time.getMinutes() * 6}deg)`
      }
    },
    secondStyle() {
      return {
        transform: `rotate(${this.time.getSeconds() * 6}deg)`
      }
    }
  },
  methods: {
    showComingSoon() {
      alert('功能即将上线，敬请期待！')
    },
    async getLocation() {
      const res = await getLocation()
      if(res.data.city != ''){
        this.location = res.data.city
      }else{
        this.location = '北京'
      }
    },
    async getWeather() {
      // 需要先获取城市名称（接上面的定位）
      const res = await getWeather( this.location)

      this.weather = {
        condition: res.data.info,
        emoji: this.getWeatherEmoji(res.data.info),
        temp: res.data.temperature || 26
      }
    },

    //根据天气情况返回对应的emoji
    getWeatherEmoji(weather) {
      // 简单的映射关系
      const map = {
        '晴': '☀️',
        '多云': '⛅',
        '阴': '☁️',
        '雨': '🌧️',
        '雪': '❄️',
        '雾': '🌫️',
        // 可以继续添加更多映射
      }
      return map[weather] || '🌤️'
    },

    // 获取首页统计信息
    async getHomeCount() {
      const res = await getHomeCount()
      if(res.code == 200){
        this.homeCount = res.data
      }
    },
  },
  mounted() {
    this.timer = setInterval(() => {
      this.time = new Date()
    }, 1000) // 每秒更新
    this.getLocation().then(() => {
      this.getWeather()
    })
  },
  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>

<style scoped>
.home-page {
  padding: 0;
  width: 100%;
  background: #f5f5f5;
}

/* 顶部用户信息 */
.user-header {
  padding: 16px;
  background: white;
  margin-bottom: 1px;
}

.greeting {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;
}

.user-info {
  text-align: left;
  flex: 1;
}

.user-info h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #333;
  font-weight: normal;
}

.meta-info {
  margin: 0;
  font-size: 14px;
  color: #888;
}

/* 时钟样式 */
.analog-clock {
  width: 48px;
  height: 48px;
  min-width: 48px;
  position: relative;
}

.clock-face {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f8f8f8;
  border: 2px solid #eee;
  position: relative;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.hand {
  position: absolute;
  left: 50%;
  bottom: 50%;
  transform-origin: 50% 100%;
}

.hour-hand {
  width: 3px;
  height: 12px;
  margin-left: -1.5px;
  background: #07C160;
  border-radius: 3px;
  z-index: 3;
}

.minute-hand {
  width: 2px;
  height: 18px;
  margin-left: -1px;
  background: #333;
  border-radius: 2px;
  z-index: 2;
}

.second-hand {
  width: 1px;
  height: 20px;
  margin-left: -0.5px;
  background: #ff4d4f;
  z-index: 1;
}

/* 卡片通用样式 */
.stats-card,
.quick-actions,
.update-log {
  padding: 16px;
  background: white;
  margin-bottom: 8px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

/* 数据概览 */
.stats-card {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #07C160;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

/* 快捷入口 */
.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  font-weight: normal;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px; /* 缩小格子间距 */
  padding: 8px; /* 减少容器内边距 */
}

.action-item {
  text-align: center;
  padding: 8px; /* 减少内边距 */
  border-radius: 8px; /* 可选：圆角 */
  transition: background 0.2s; /* 悬停动画 */
}

.action-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-item:hover {
  background: rgba(0, 0, 0, 0.05); /* 轻量悬停背景 */
  cursor: pointer;
}

.action-icon:hover {
  cursor: pointer;
}

.action-text {
  font-size: 13px;
  color: #333;
}

/* 更新日志 */
.log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  display: flex;
  gap: 12px;
}

.log-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #07C160;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
}

.log-content p {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.log-content span {
  font-size: 12px;
  color: #999;
}

/* 主容器 */
.dashboard-section {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

/* 左右面板通用样式 */
.update-log-panel,
.activity-panel {
  flex: 1;
  background: white;
  border-radius: 12px;
  height: 280px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 面板头部 */
.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.time-range {
  font-size: 12px;
  color: #999;
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 4px 10px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s;
}

.tab.active {
  background: #07C160;
  color: white;
}

/* 可滚动内容区域 */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

/* 更新卡片样式 */
.update-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  transition: all 0.2s;
}

.update-card:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

.update-card.featured {
  background: #f0f7ff;
  border-left: 3px solid #07C160;
}

.card-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.version {
  font-size: 12px;
  color: #07C160;
  font-weight: 500;
}

.date {
  font-size: 12px;
  color: #999;
}

.tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.tag.milestone {
  background: #4169E1;
  color: white;
}

.tag.new {
  background: rgba(7, 193, 96, 0.1);
  color: #07C160;
}

.tag.optimized {
  background: rgba(255, 205, 0, 0.1);
  color: #FFCD00;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.card-desc {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* 月份分隔线 */
.month-divider {
  font-size: 13px;
  color: #666;
  margin: 12px 0 8px 0;
  padding-left: 8px;
  position: relative;
}

.month-divider:before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  height: 1px;
  width: 100%;
  background: #f0f0f0;
  z-index: 0;
}

/* 活跃数据统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 12px;
}

.stat-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.stat-card.highlight {
  grid-column: span 2;
  background: #f0f7ff;
}

.stat-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  background: rgba(7, 193, 96, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #07C160;
}

.stat-card.highlight .stat-icon {
  background: rgba(7, 193, 96, 0.2);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.trend {
  font-size: 11px;
  margin-top: 4px;
}

.trend.up {
  color: #07C160;
}

.trend.down {
  color: #FF4D4F;
}

/* 底部摘要 */
.activity-summary {
  display: flex;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
}

.summary-item {
  flex: 1;
  text-align: center;
  padding: 12px;
}

.summary-value {
  font-size: 20px;
  font-weight: 600;
  color: #07C160;
}

.summary-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* 滚动条样式 */
.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: #e0e0e0;
  border-radius: 3px;
}
</style>
