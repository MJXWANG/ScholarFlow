# 📤 如何推送功能分支到GitHub

## 🎯 当前状态

已成功创建以下6个功能分支：

### P0 优先级分支（核心功能）
1. ✅ `feature/real-ai-content-generation` - 真实AI内容生成
2. ✅ `feature/deep-document-understanding` - 深度文档理解
3. ✅ `feature/automated-execution` - 自动化执行完善
4. ✅ `feature/global-coordination` - 全局协调服务

### P1 优先级分支（功能增强）
5. ✅ `feature/reference-management` - 引用管理系统
6. ✅ `feature/proactive-suggestions` - 主动建议增强

---

## 🔐 推送分支需要GitHub身份验证

由于Git使用HTTPS协议连接GitHub，推送时需要身份验证。有以下几种方法：

---

## 方法1：使用GitHub CLI（推荐）⭐

如果你安装了GitHub CLI，这是最简单的方法：

```bash
# 1. 登录GitHub CLI
gh auth login

# 2. 运行推送脚本
./push_branches.sh
```

---

## 方法2：使用Personal Access Token（推荐）🔑

### 步骤1：创建GitHub Personal Access Token

1. 访问 GitHub Settings: https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 给token一个描述性名称，如 "ScholarFlow Development"
4. 选择权限范围（至少需要 `repo` 权限）
5. 点击 "Generate token"
6. **重要**: 复制并保存token（只显示一次！）

### 步骤2：使用Token推送

```bash
# 运行推送脚本，当提示输入用户名和密码时：
./push_branches.sh

# Username: 你的GitHub用户名
# Password: 粘贴你的Personal Access Token（不是GitHub密码！）
```

### 步骤3：保存凭证（可选）

为了避免每次都输入token，可以保存凭证：

```bash
# 在macOS上使用Keychain
git config --global credential.helper osxkeychain

# 然后再次推送，输入token后会自动保存
./push_branches.sh
```

---

## 方法3：手动逐个推送分支

如果自动脚本有问题，可以手动推送每个分支：

```bash
# 推送每个分支
git push -u origin feature/real-ai-content-generation
git push -u origin feature/deep-document-understanding
git push -u origin feature/automated-execution
git push -u origin feature/global-coordination
git push -u origin feature/reference-management
git push -u origin feature/proactive-suggestions

# 查看远程分支
git branch -r
```

---

## 方法4：切换到SSH（一劳永逸）🔒

### 步骤1：生成SSH密钥（如果还没有）

```bash
# 生成SSH密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 启动ssh-agent
eval "$(ssh-agent -s)"

# 添加SSH密钥到ssh-agent
ssh-add ~/.ssh/id_ed25519
```

### 步骤2：添加SSH密钥到GitHub

```bash
# 复制SSH公钥
cat ~/.ssh/id_ed25519.pub | pbcopy

# 然后访问 https://github.com/settings/keys
# 点击 "New SSH key"，粘贴公钥
```

### 步骤3：更改远程仓库URL

```bash
# 将远程仓库从HTTPS改为SSH
git remote set-url origin git@github.com:MJXWANG/ScholarFlow.git

# 验证
git remote -v

# 现在可以直接推送，无需密码
./push_branches.sh
```

---

## 🚀 快速推送（推荐流程）

### 如果你有GitHub CLI：
```bash
gh auth login
./push_branches.sh
```

### 如果你有Personal Access Token：
```bash
# 第一次推送
./push_branches.sh
# 输入用户名和token

# 保存凭证
git config --global credential.helper osxkeychain

# 之后就不用再输入了
```

### 如果你想用SSH（一次设置，永久使用）：
```bash
# 生成并添加SSH密钥（参考上面的步骤）
git remote set-url origin git@github.com:MJXWANG/ScholarFlow.git
./push_branches.sh
```

---

## ✅ 验证推送成功

推送成功后，你可以：

1. **在终端查看**：
```bash
git branch -r
```

应该能看到所有新分支：
```
origin/feature/real-ai-content-generation
origin/feature/deep-document-understanding
origin/feature/automated-execution
origin/feature/global-coordination
origin/feature/reference-management
origin/feature/proactive-suggestions
```

2. **在GitHub网页查看**：
访问：https://github.com/MJXWANG/ScholarFlow/branches

---

## 🔍 常见问题

### Q: "Device not configured" 错误
**A**: 这表示Git无法读取用户凭证。使用上面的方法1、2或4来解决。

### Q: 推送时要求输入密码，但我的密码不对
**A**: GitHub已经不支持密码验证了，你需要使用Personal Access Token。参考方法2。

### Q: 每次推送都要输入token
**A**: 使用 `git config --global credential.helper osxkeychain` 保存凭证，或者切换到SSH（方法4）。

### Q: 我想撤销某个分支的推送
**A**: 
```bash
# 删除远程分支（谨慎使用！）
git push origin --delete feature/branch-name
```

---

## 📖 接下来做什么？

推送成功后：

1. **查看分支说明**：阅读 `BRANCH_FEATURES.md` 了解每个分支的用途
2. **开始开发**：
   ```bash
   # 切换到你要开发的分支
   git checkout feature/real-ai-content-generation
   
   # 开始编码...
   
   # 提交更改
   git add .
   git commit -m "feat: 实现xxx功能"
   git push
   ```
3. **创建Pull Request**：在GitHub上从功能分支创建PR到main分支
4. **代码审查**：请团队成员审查代码
5. **合并到main**：审查通过后合并

---

## 📞 需要帮助？

- 查看 `BRANCH_FEATURES.md` - 分支详细说明
- 查看 `TASK_ASSIGNMENT.md` - 任务分配
- 查看 `README.md` - 技术架构
- GitHub Issues: https://github.com/MJXWANG/ScholarFlow/issues

---

**祝开发顺利！** 🚀

