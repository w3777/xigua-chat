<template>
  <div class="watermelon-welcome">
    <div class="welcome-container">
      <!-- 大西瓜图标 -->
      <div class="watermelon-icon">
        <div class="watermelon">
          <div class="rind"></div>
          <div class="flesh">
            <div class="seed"></div>
            <div class="seed"></div>
            <div class="seed"></div>
            <div class="seed"></div>
            <div class="seed"></div>
          </div>
          <div class="stem"></div>
        </div>
      </div>

      <!-- 文案部分 -->
      <div class="welcome-text">
        <h2>清爽沟通，从一颗西瓜开始</h2>
        <p>享受如西瓜般清甜畅快的交流</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomePlaceholder'
}
</script>

<style scoped>
.watermelon-welcome {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5; /* 微信风格浅灰色背景 */
  padding: 20px;
  box-sizing: border-box;
}

.welcome-container {
  text-align: center;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 大西瓜图标 */
.watermelon-icon {
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.watermelon {
  position: relative;
  width: 150px;  /* 更大的西瓜 */
  height: 150px;
  animation: float 4s ease-in-out infinite;
}

.rind {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2E8B57, #228B22);
  border-radius: 50%;
  box-shadow: 0 6px 25px rgba(46, 139, 87, 0.25);
}

.flesh {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #FF6B6B, #FF5252);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 15px;
}

.seed {
  width: 8px;
  height: 10px;
  background: #2D3436;
  border-radius: 50%;
  margin: 3px;
  transform: rotate(var(--rotation, 0deg));
}

.seed:nth-child(1) { --rotation: -20deg; margin-right: 12px; }
.seed:nth-child(2) { --rotation: 10deg; margin-left: 12px; }
.seed:nth-child(3) { --rotation: -10deg; margin-top: 12px; }
.seed:nth-child(4) { --rotation: 20deg; margin-bottom: 12px; }
.seed:nth-child(5) { --rotation: 5deg; margin: 12px 0 0 12px; }

.stem {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 18px;
  background: linear-gradient(to bottom, #8BC34A, #689F38);
  border-radius: 3px 3px 0 0;
}

/* 文案部分 */
.welcome-text {
  width: 100%;
  text-align: center;
}

.welcome-text h2 {
  font-size: 28px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 16px;
  line-height: 1.4;
  letter-spacing: -0.5px;
}

.welcome-text p {
  font-size: 17px;
  color: #7f7f7f;
  line-height: 1.6;
  margin: 0;
  font-weight: 400;
  max-width: 350px;
  margin: 0 auto;
}

/* 动画效果 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(1.06);
  }
}

.watermelon:hover {
  animation: float 2s ease-in-out infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .watermelon-welcome {
    padding: 40px 20px;
  }

  .watermelon {
    width: 120px;
    height: 120px;
  }

  .flesh {
    width: 90px;
    height: 90px;
    top: 15px;
    left: 15px;
  }

  .seed {
    width: 6px;
    height: 8px;
  }

  .welcome-text h2 {
    font-size: 24px;
  }

  .welcome-text p {
    font-size: 16px;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .watermelon {
    width: 100px;
    height: 100px;
  }

  .flesh {
    width: 70px;
    height: 70px;
    top: 15px;
    left: 15px;
  }

  .welcome-text h2 {
    font-size: 22px;
  }

  .welcome-text p {
    font-size: 15px;
    max-width: 280px;
  }
}

/* 确保100%高度 */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
