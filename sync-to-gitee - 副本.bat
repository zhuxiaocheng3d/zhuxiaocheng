@echo off
rem 强制设置为UTF-8编码，并切换到支持UTF-8的Consolas字体
chcp 65001 > nul
reg add "HKCU\Console" /v "CodePage" /t REG_DWORD /d 65001 /f > nul
reg add "HKCU\Console" /v "FaceName" /t REG_SZ /d "Consolas" /f > nul

cd /d "%~dp0"

echo 正在同步文件到 Gitee + GitHub...
git pull gitee master
git add .
git commit -m "自动同步: %date% %time%"
git push origin master

echo 同步完成！文件已推送到两个仓库
echo 网站将在1-2分钟内自动更新，请按任意键继续...
pause > nul