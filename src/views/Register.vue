<template>
  <div class="container">
    <div class="form-title">注册</div>
    <el-form :model="form" ref="formRef" :rules="rules" label-width="100px" @submit.prevent="register">
      <!-- 用户名输入框 -->
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="用户名" />
      </el-form-item>

      <!-- 电子邮件输入框与验证码按钮 -->
      <el-form-item label="电子邮件" prop="email">
        <div class="input-wrapper">
          <el-input
              v-model="form.email"
              placeholder="请输入您的邮箱"
              @input="validateEmail"
              class="email-input"
          />
          <span class="email-suffix">@qq.com</span>
        </div>
      </el-form-item>

      <!-- 验证码输入框与发送按钮 -->
      <el-form-item label="验证码" prop="code">
        <div class="code-wrapper">
          <el-input v-model="form.code" placeholder="请输入验证码" class="code-input" />
          <el-button
              :disabled="isCodeButtonDisabled"
              type="success"
              @click="sendEmailCode"
              class="code-btn">
            发送验证码
          </el-button>
          <span v-if="timer > 0" class="timer">{{ timer }}秒</span>
<!--          <span v-if="emailCodeSent" class="info-message">验证码已发送，请查收邮箱。</span>-->
        </div>
      </el-form-item>

      <!-- 密码输入框 -->
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="密码" show-password />
      </el-form-item>

      <!-- 注册按钮 -->
      <el-form-item>
        <el-button type="primary" native-type="submit" class="submit-btn">注册</el-button>
      </el-form-item>
    </el-form>

    <!-- 登录链接 -->
    <div class="switch-link">
      已有账户？<router-link to="/login">登录</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        email: '',
        code: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入电子邮件', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: ['blur', 'change'] }
        ]
      },
      isCodeButtonDisabled: false,  // 是否禁用验证码按钮
      timer: 0,  // 倒计时秒数
      emailCodeSent: false,  // 是否发送验证码
      countdownTimer: null,  // 倒计时定时器
    };
  },
  methods: {
    // 注册方法
    async register() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请检查输入的内容');
          return;
        }

        const requestData = {
          username: this.form.username,
          email: this.form.email + '@qq.com',  // 自动补充 @qq.com
          code: this.form.code,
          password: this.form.password
        };

        try {
          const response = await this.$axios.post('/api/client/user/register', requestData);
          if (response.data.code === 200) {
            this.$message.success('注册成功！');
            this.$router.push('/login');  // 注册成功后跳转到登录页面
          } else {
            this.$message.error('注册失败：' + response.data.msg);
          }
        } catch (error) {
          this.$message.error('注册请求失败: ' + error.message);
        }
      });
    },

    // 监听并验证电子邮件输入
    validateEmail() {
      // 强制补充 @qq.com
      if (this.form.email && !this.form.email.endsWith('@qq.com')) {
        this.form.email = this.form.email.split('@')[0];  // 只保留 @qq.com 之前的部分
      }
    },

    // 发送电子邮件验证码
    async sendEmailCode() {
      if (!this.form.email) {
        this.$message.error('请输入电子邮件');
        return;
      }
      const regex = /^[1-9][0-9]{4,10}$/;
      if (!regex.test(this.form.email)) {
        this.$message.error('请输入正确的QQ号');
        return;
      }

      const email = this.form.email + '@qq.com';  // 自动补充 @qq.com

      // 调用后端接口发送验证码
      this.startCountdown()
      // try {
      //   const response = await this.$axios.post('/api/client/email/send?email=' + email);
      //   if (response.data.code === 200) {
      //     this.emailCodeSent = true;  // 标记验证码已发送
      //     this.startCountdown();  // 启动倒计时
      //   } else {
      //     this.$message.error('发送验证码失败：' + response.data.msg);
      //   }
      // } catch (error) {
      //   this.$message.error('发送验证码失败: ' + error.message);
      // }
    },

    // 启动倒计时
    startCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);  // 清除之前的定时器
      }
      this.timer = 60;  // 重置倒计时为60秒
      this.isCodeButtonDisabled = true;  // 禁用发送验证码按钮
      this.countdownTimer = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          clearInterval(this.countdownTimer);  // 停止倒计时
          this.isCodeButtonDisabled = false;  // 启用发送验证码按钮
        }
      }, 1000)
    }
  },
  beforeDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);  // 清除定时器
    }
  }
};
</script>

<style scoped>
/* 页面整体布局 */
.container {
  width: 100%;
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
}

/* 表单标题 */
.form-title {
  font-size: 24px;
  margin-bottom: 20px;
}

/* 输入框样式 */
.el-input {
  width: 100%;
  margin-bottom: 20px;
}

/* 邮箱输入框 */
.email-input {
  width: 70%;
  margin-right: 5px;
}

/* 邮箱后缀 */
.email-suffix {
  font-size: 14px;
  margin-left: 5px;
}

/* 验证码输入框 */
.code-input {
  width: 50%;
  margin-right: 5px;
}

/* 按钮样式 */
.submit-btn {
  width: 100%;
  padding: 10px;
  font-size: 16px;
}

.el-button {
  padding: 6px 12px;
  font-size: 14px;
}

/* 注册链接 */
.switch-link {
  margin-top: 20px;
}

.switch-link a {
  color: #007bff;
  text-decoration: none;
}

.switch-link a:hover {
  text-decoration: underline;
}

/* 信息提示 */
.info-message {
  font-size: 14px;
  color: green;
  margin-top: 10px;
}

/* 计时器 */
.timer {
  color: red;
  font-size: 14px;
  margin-left: 10px;
}

/* 发送验证码按钮 */
.code-btn {
  width: 40%;
}

/* 验证码与按钮容器 */
.code-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .container {
    padding: 15px;
  }
}
</style>
