@echo off
chcp 65001 > nul  :: 强制命令行使用UTF-8编码，解决中文乱码问题
cd /d "%~dp0"

echo 正在同步文件到 Gitee + GitHub...
git pull gitee master
git add .
git commit -m "自动同步: %date% %time%"
git push origin master

echo 同步完成！文件已推送到两个仓库
echo 网站将在1-2分钟内自动更新，请按任意键继续...
pause > nul