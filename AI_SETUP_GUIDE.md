# 🔧 **AI助手配置指南**

## 🚨 **问题诊断**

你遇到的错误是因为OpenAI API密钥没有正确配置。AI助手无法连接到OpenAI服务，所以一直返回错误信息。

## 📋 **解决步骤**

### **1. 创建环境变量文件**
在项目根目录创建 `.env` 文件：

```bash
# 在项目根目录执行
touch .env
```

### **2. 配置OpenAI API密钥**
在 `.env` 文件中添加以下内容：

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here

# Application Configuration
VITE_APP_NAME=ScholarFlow
VITE_VERSION=1.0.0

# Development Configuration
VITE_DEBUG=true
VITE_LOG_LEVEL=info

# AI Service Configuration
VITE_AI_MODEL=gpt-4
VITE_AI_TEMPERATURE=0.7
VITE_AI_MAX_TOKENS=2000

# Feature Flags
VITE_ENABLE_AI_OUTLINE=true
VITE_ENABLE_AI_CONTENT=true
VITE_ENABLE_AI_POLISH=true
VITE_ENABLE_COLLABORATION=false
VITE_ENABLE_LITERATURE_SEARCH=false
```

### **3. 获取OpenAI API密钥**
1. 访问 [OpenAI官网](https://platform.openai.com/)
2. 注册或登录账户
3. 进入 API Keys 页面
4. 创建新的API密钥
5. 复制密钥并替换 `your_actual_openai_api_key_here`

### **4. 重启开发服务器**
```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
# 或
yarn dev
```

## 🔍 **验证配置**

配置完成后，AI助手应该能够：
- ✅ 理解你的自然语言输入
- ✅ 生成智能回复
- ✅ 提供主动建议
- ✅ 检测文档问题

## 🚨 **常见问题**

### **问题1: API密钥无效**
- 检查密钥是否正确复制
- 确认账户有足够的余额
- 验证密钥权限设置

### **问题2: 网络连接问题**
- 检查网络连接
- 确认防火墙设置
- 尝试使用VPN

### **问题3: 环境变量不生效**
- 确认文件名为 `.env`（不是 `.env.txt`）
- 重启开发服务器
- 检查文件位置（应在项目根目录）

## 💡 **测试AI功能**

配置完成后，尝试以下输入：
- "帮我写一个关于深度学习的引言"
- "润色这段文字"
- "检查引用格式"
- "生成论文大纲"

## 🎯 **下一步**

配置完成后，你就可以享受完整的Cursor式AI科研写作体验了！

- 🧠 **智能对话**：自然语言交互
- 💡 **主动建议**：AI主动发现问题
- 🔍 **问题检测**：自动检测文档问题
- ✨ **内容生成**：智能生成学术内容
