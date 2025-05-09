<template>
  <div class="container">
    <div class="form-title">登录</div>
    <!-- @submit.native.prevent 防止默认提交，使用 validate 进行校验 -->
    <el-form :model="form" ref="formRef" :rules="rules" label-width="100px" @submit.native.prevent="login">
      <!-- 用户名校验 -->
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="用户名/邮箱" />
      </el-form-item>

      <!-- 密码校验 -->
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="密码" show-password />
      </el-form-item>

      <!-- 登录按钮 -->
      <el-form-item>
        <el-button type="primary" native-type="submit" class="submit-btn">登录</el-button>
      </el-form-item>
    </el-form>

    <!-- 注册链接 -->
    <div class="switch-link">
      还没有账户？<router-link to="/register">注册</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        // 用户名校验规则
        username: [
          { required: true, message: '请输入用户名/邮箱', trigger: 'blur' }
        ],
        // 密码校验规则
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: ['blur', 'change'] }
        ]
      }
    };
  },
  methods: {
    // 登录方法
    async login() {
      // 获取表单实例并进行校验
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) {
          // 校验失败，提示用户
          this.$message.error('请检查输入的内容');
          return;
        }
        // 校验通过，发送登录请求
        const requestData = {
          username: this.form.username,
          password: this.form.password
        };

        try {
          const response = await this.$axios.post('/api/client/user/login', requestData);

          if (response.data.code === 200) {
            this.$message.success(`登录成功！用户名: ${this.form.username}`);
            this.$router.push('/chat'); // 登录成功后跳转到聊天页面
          } else {
            this.$message.error('登录失败：' + response.data.msg);
          }
        } catch (error) {
          this.$message.error('登录请求失败: ' + error.message);
        }
      });
    }
  }
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f0f0f0;
  height: 100vh; /* 确保页面高度为视窗高度 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.container {
  width: 350px;
  padding: 20px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.form-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.el-input {
  width: 100%;
  padding: 10px;
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
