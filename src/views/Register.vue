<template>
  <div class="container">
    <div class="form-title">注册</div>
    <el-form :model="form" ref="formRef" :rules="rules" @submit.native.prevent="register">
      <!-- 用户名输入框 -->
      <el-form-item prop="username">
        <el-input v-model="form.username" placeholder="用户名" />
      </el-form-item>

      <el-form-item prop="email">
        <div class="email-input-wrapper">
          <el-input
              v-model="form.email"
              placeholder="请输入QQ号"
              @input="validateEmail"
              class="email-input"
          />
          <span class="email-suffix">@qq.com</span>
        </div>
      </el-form-item>

      <!-- 验证码输入框 -->
      <el-form-item prop="code">
        <div class="code-wrapper">
          <el-input v-model="form.code" maxlength="6" placeholder="验证码" />
          <el-button
              :disabled="isCodeButtonDisabled"
              @click="sendEmailCode"
              class="code-btn">
            获取验证码
            <span v-if="timer > 0" class="timer">({{ timer }}s)</span>
          </el-button>
        </div>
      </el-form-item>

      <!-- 密码输入框 -->
      <el-form-item prop="password">
        <el-input v-model="form.password" type="password" placeholder="密码" show-password />
      </el-form-item>

      <!-- 注册按钮 -->
      <el-form-item>
        <el-button type="primary" native-type="submit" class="submit-btn">注册</el-button>
      </el-form-item>
    </el-form>

    <!-- 登录链接 -->
    <div class="switch-link">
      已有账户，<router-link to="/login">登录</router-link>
    </div>
  </div>
</template>

<script>
import {register} from "@/api/auth.js";
import {sendEmail} from "@/api/email.js";

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
          { required: true, message: '请输入QQ号', trigger: 'blur' },
          { pattern: /^[1-9][0-9]{4,10}$/, message: '请输入正确的QQ号', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: ['blur', 'change'] }
        ]
      },
      isCodeButtonDisabled: false,
      timer: 0,
      countdownTimer: null
    };
  },
  methods: {
    async register() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请检查输入的内容');
          return;
        }
        const requestData = {
          username: this.form.username,
          email: this.form.email + '@qq.com',
          code: this.form.code,
          password: this.form.password
        };

        const response = await register(requestData);
        if (response.code === 200) {
          this.$message.success('注册成功！');
          this.$router.push('/login');
        } else {
          this.$message.error('注册失败：' + response.data.msg);
        }
      });
    },
    validateEmail() {
      if (this.form.email && this.form.email.includes('@')) {
        this.form.email = this.form.email.split('@')[0];
      }
    },
    async sendEmailCode() {
      if (!this.form.email) {
        this.$message.error('请输入QQ号');
        return;
      }

      const email = {
        email: this.form.email + '@qq.com'// 自动补充 @qq.com
      };
      const response = await sendEmail(email);
      if (response.code === 200) {
        this.startCountdown();  // 启动倒计时
      } else {
        this.$message.error('发送验证码失败：' + response.data.msg);
      }
    },
    startCountdown() {
      if (this.countdownTimer) clearInterval(this.countdownTimer);
      this.timer = 60;
      this.isCodeButtonDisabled = true;
      this.countdownTimer = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          clearInterval(this.countdownTimer);
          this.isCodeButtonDisabled = false;
        }
      }, 1000);
    }
  },
  beforeDestroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
};
</script>

<style scoped>
.container {
  width: 300px;
  padding: 20px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 80px;
}

.form-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.el-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.el-form-item {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.el-input {
  width: 100%;
}

.email-suffix {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
}

.code-wrapper {
  display: flex;
  width: 100%;
  gap: 10px;
}

.code-btn {
  white-space: nowrap;
}

.timer {
  color: #f56c6c;
  font-size: 12px;
}

.submit-btn {
  width: 100%;
  padding: 10px;
}

.switch-link {
  display: block;
  text-align: center;
  margin-top: 10px;
  color: #007bff;
}

.switch-link a {
  color: #007bff;
  text-decoration: none;
}

.switch-link a:hover {
  text-decoration: underline;
}

.email-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.email-suffix {
  margin-left: 8px;
  color: #666;
  white-space: nowrap;
}
</style>
