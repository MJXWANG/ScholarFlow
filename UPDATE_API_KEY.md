# 🔑 更新OpenAI API密钥

## 当前问题

错误信息：`API密钥配置有误。请检查VITE_OPENAI_API_KEY是否正确设置。`

## 🔧 解决步骤

### 1. 获取新的API密钥

1. 访问 OpenAI 平台：https://platform.openai.com/api-keys
2. 登录你的账户
3. 点击 **"Create new secret key"** 按钮
4. 给密钥起个名字，如 "ScholarFlow Development"
5. 复制生成的密钥（格式：sk-...）
   - ⚠️ **重要**：密钥只显示一次，一定要复制保存！

### 2. 更新 .env 文件

**方式A：使用命令行**

```bash
# 在项目根目录
cd /Users/maiwang/Scholarflow

# 编辑 .env 文件
nano .env
# 或
code .env
```

**方式B：使用文本编辑器**

直接打开 `/Users/maiwang/Scholarflow/.env` 文件

### 3. 修改配置

找到这一行：
```
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

替换为新的密钥：
```
VITE_OPENAI_API_KEY=你的新密钥
```

### 4. 保存并重启服务器

**重要**：修改 .env 文件后必须重启！

```bash
# 停止当前服务器（在运行npm run dev的终端按 Ctrl+C）
# 然后重新启动
npm run dev
```

### 5. 强制刷新浏览器

```
Ctrl + Shift + R (Windows/Linux)
或
Cmd + Shift + R (Mac)
```

---

## 🔍 验证密钥是否有效

### 方法1：在浏览器控制台测试

1. 打开浏览器（http://localhost:3000）
2. 按 F12 打开控制台
3. 输入以下命令：

```javascript
console.log(import.meta.env.VITE_OPENAI_API_KEY?.substring(0, 10))
```

应该显示：`sk-proj-XX` 或 `sk-XXXXXX`

### 方法2：测试API调用

在控制台输入：

```javascript
fetch('https://api.openai.com/v1/models', {
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
  }
})
.then(r => r.json())
.then(d => console.log('✅ API密钥有效', d))
.catch(e => console.error('❌ API密钥无效', e))
```

---

## 💡 常见问题

### Q1: 密钥格式是什么？

**新格式（推荐）**：
```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**旧格式**：
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Q2: 为什么密钥无效？

可能原因：
1. ❌ 密钥已被删除或撤销
2. ❌ OpenAI账户余额不足（需要充值）
3. ❌ 密钥权限不够（需要有模型访问权限）
4. ❌ 达到使用配额限制

### Q3: 如何检查账户余额？

访问：https://platform.openai.com/account/billing

确保：
- ✅ 有可用余额（至少 $5）
- ✅ 没有达到使用限制
- ✅ 支付方式有效

### Q4: 使用哪个模型？

ScholarFlow 默认使用 **GPT-4**，确保：
- ✅ 你的账户有 GPT-4 访问权限
- ✅ API密钥有 GPT-4 使用权限

如果只有 GPT-3.5，可以修改 `src/services/aiService.ts`：
```typescript
// 第98行，将 gpt-4 改为 gpt-3.5-turbo
model: 'gpt-3.5-turbo',
```

---

## 🚀 快速测试流程

更新密钥后：

1. ✅ 重启开发服务器
2. ✅ 强制刷新浏览器（Ctrl+Shift+R）
3. ✅ 在AI助手输入："帮我生成关于AI的论文大纲"
4. ✅ 等待5-10秒
5. ✅ 查看是否生成内容

---

## 📞 需要帮助？

如果还有问题，请提供：
1. 浏览器控制台（F12）的完整错误信息
2. OpenAI账户状态（有余额吗？）
3. 使用的是GPT-4还是GPT-3.5？

---

**祝测试顺利！** 🚀

