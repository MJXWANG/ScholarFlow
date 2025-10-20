#!/bin/bash

# 检查OpenAI API余额的脚本
echo "🔍 检查OpenAI API余额..."

# 从.env文件读取API密钥
if [ -f ".env" ]; then
    API_KEY=$(grep "VITE_OPENAI_API_KEY" .env | cut -d '=' -f2)
    if [ -z "$API_KEY" ]; then
        echo "❌ 未找到API密钥"
        exit 1
    fi
else
    echo "❌ 未找到.env文件"
    exit 1
fi

echo "📊 正在查询API使用情况..."

# 使用OpenAI API查询使用情况
RESPONSE=$(curl -s -H "Authorization: Bearer $API_KEY" \
     -H "Content-Type: application/json" \
     "https://api.openai.com/v1/usage?date=$(date +%Y-%m-%d)")

echo "API响应:"
echo "$RESPONSE"

echo ""
echo "💡 提示:"
echo "- 如果显示API错误，可能是密钥无效或权限不足"
echo "- 如果显示使用量为0，说明今天还没有使用API"
echo "- 要查看完整的使用历史，请访问: https://platform.openai.com/usage"
echo "- 要查看账户余额，请访问: https://platform.openai.com/account/billing"