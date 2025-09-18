<template>
  <div class="container">
    <div class="form-title">登录</div>
    <!-- 移除 label-width 属性，使用 CSS 控制对齐 -->
    <el-form :model="form" ref="formRef" :rules="rules" @submit.native.prevent="login">
      <!-- 用户名校验 -->
      <el-form-item prop="username">
        <el-input v-model="form.username" placeholder="用户名/邮箱" />
      </el-form-item>

      <!-- 密码校验 -->
      <el-form-item prop="password">
        <el-input v-model="form.password" type="password" placeholder="密码" show-password />
      </el-form-item>

      <!-- 登录按钮 -->
      <el-form-item>
        <el-button type="primary" native-type="submit" class="submit-btn" :loading="loading">{{ loading ? '登录中...' : '登录' }} </el-button>
      </el-form-item>
    </el-form>

    <!-- 注册链接 -->
    <div class="switch-link">
      还没有账户？<router-link to="/register">注册</router-link>
    </div>
  </div>
</template>

<script>
import {getUserInfo,} from "@/api/user.js";
import {login} from "@/api/auth.js";
import {setToken} from "@/utils/auth.js";
import {set, setObject} from "@/utils/localStorage.js";

export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      rules: {
        username: [
          { required: true, message: '请输入用户名/邮箱', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: ['blur', 'change'] }
        ]
      }
    };
  },
  methods: {
    async login() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请检查输入的内容');
          return;
        }
        const requestData = {
          username: this.form.username,
          password: this.form.password
        };

        this.loading = true;
        try {
          // 调用登录接口
          const loginRes = await login(requestData);
          if (loginRes.code != 200) {
            this.$message.error('登录失败：' + loginRes.data.msg);
          }
          // 缓存token
          setToken(loginRes.data.token)
        } catch (error) {
          return
        } finally {
          this.loading = false;
        }

        // 调用当前用户接口 缓存当前用户信息
        const userInfoRes = await getUserInfo()
        if (userInfoRes.code != 200) {
          this.$message.error('获取用户信息失败：' + userInfoRes.data.msg);
        }
        setObject('userInfo', userInfoRes.data)
        set('activeMenu', 'home')

        // 跳转到首页
        this.$router.push('/home');
      });
    }
  }
};
</script>

<style scoped>
.container {
  width: 300px; /* 缩小容器宽度 */
  padding: 20px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 200px;
}
.form-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}

/* 表单项居中 */
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
}

.el-input {
  width: 100%;
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
</style>
