@echo off
cd /d "%~dp0"

echo 正在同步文件到 Gitee...
git pull origin master
git add .
git commit -m "自动同步: %date% %time%"
git push origin master

echo 同步完成！按任意键退出...
pause