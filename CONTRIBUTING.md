# 🤝 贡献指南

感谢你对 ScholarFlow 项目的关注！我们欢迎所有形式的贡献。

## 🚀 快速开始

1. **Fork 这个仓库**
2. **克隆你的Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ScholarFlow.git
   cd ScholarFlow
   ```
3. **安装依赖**
   ```bash
   npm install
   ```
4. **配置环境变量**
   ```bash
   cp env.example .env
   # 编辑 .env 文件，添加 OpenAI API Key
   ```

## 🎯 贡献方式

### 🐛 报告问题
- 使用 [Issues](https://github.com/MJXWANG/ScholarFlow/issues) 报告bug
- 提供详细的复现步骤
- 包含错误截图和日志

### ✨ 功能建议
- 在 [Discussions](https://github.com/MJXWANG/ScholarFlow/discussions) 中提出想法
- 描述使用场景和预期效果
- 讨论技术实现方案

### 💻 代码贡献
1. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **进行开发**
   - 遵循现有的代码风格
   - 添加必要的测试
   - 更新相关文档
3. **提交更改**
   ```bash
   git commit -m "feat: add your feature"
   ```
4. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **创建Pull Request**

## 📝 开发规范

### 代码风格
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 组件使用函数式组件和Hooks
- 状态管理使用 Zustand

### 提交信息
使用约定式提交格式：
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

### AI功能开发
- 在 `src/services/` 中添加新的AI服务
- 在 `src/components/` 中添加UI组件
- 在 `src/store/` 中管理状态
- 确保错误处理和用户体验友好

## 🧪 测试

### 运行测试
```bash
npm run test
```

### 手动测试
1. 启动开发服务器：`npm run dev`
2. 测试AI功能：输入"帮我生成论文大纲"
3. 检查控制台是否有错误
4. 验证UI交互是否正常

## 📚 文档

- 更新README.md（如果需要）
- 添加代码注释（关键逻辑）
- 更新API文档（如果有新接口）

## 🎉 贡献奖励

- 贡献者会在README中列出
- 重大贡献者会成为协作者
- 社区认可和感谢

## ❓ 需要帮助？

- 查看 [Issues](https://github.com/MJXWANG/ScholarFlow/issues)
- 在 [Discussions](https://github.com/MJXWANG/ScholarFlow/discussions) 中提问
- 联系维护者

---

**让我们一起打造更好的AI科研写作工具！** 🚀
