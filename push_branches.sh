#!/bin/bash

# ScholarFlow - 推送所有功能分支到远程仓库

echo "🚀 开始推送所有功能分支到远程仓库..."
echo ""

# 分支列表
branches=(
  "feature/real-ai-content-generation"
  "feature/deep-document-understanding"
  "feature/automated-execution"
  "feature/global-coordination"
  "feature/reference-management"
  "feature/proactive-suggestions"
)

# 推送每个分支
for branch in "${branches[@]}"
do
  echo "📤 正在推送分支: $branch"
  git push -u origin "$branch"
  
  if [ $? -eq 0 ]; then
    echo "✅ $branch 推送成功"
  else
    echo "❌ $branch 推送失败"
  fi
  echo ""
done

echo "🎉 所有分支推送完成！"
echo ""
echo "📊 查看远程分支："
git branch -r

echo ""
echo "💡 提示："
echo "  - 你可以在 GitHub 上查看所有分支"
echo "  - 开发时请在对应的功能分支上进行"
echo "  - 完成后创建 Pull Request 合并到 main"
echo ""
echo "📖 详细信息请查看 BRANCH_FEATURES.md"

