const fs = require('fs');
const path = require('path');

// 配置：tu 文件夹路径（与脚本同级）
const TU_DIR = path.join(__dirname, 'tu');
const OUTPUT_JSON = path.join(__dirname, 'images.json');

// 支持的图片扩展名
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
// 视频扩展名（遵循原规则：仅包含 _x264 的 mp4）
const VIDEO_EXTS = ['.mp4'];

// 提取文件名中的任意6位数字作为日期标签
function extractDateLabel(filename) {
    const match = filename.match(/(\d{6})/);
    if (!match) return null;
    const num = match[1];
    const year = 2000 + parseInt(num.slice(0,2));
    const month = parseInt(num.slice(2,4));
    const day = parseInt(num.slice(4,6));
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}.${month.toString().padStart(2,'0')}.${day.toString().padStart(2,'0')}`;
    }
    return num;
}

// 清理标题：去掉6位数字、开头序号等
function cleanTitle(originalName) {
    let cleaned = originalName;
    cleaned = cleaned.replace(/\d{6}/g, '');
    cleaned = cleaned.replace(/^\d+[\s\-_]+/, '');
    cleaned = cleaned.replace(/\s*\(\d+\)\s*/g, '');
    cleaned = cleaned.replace(/^[\s\-_]+|[\s\-_]+$/g, '');
    return cleaned.trim() || '未命名作品';
}

// 读取同名txt文件的首行作为链接
function getLinkFromTxt(filePathWithoutExt) {
    const txtPath = filePathWithoutExt + '.txt';
    if (fs.existsSync(txtPath)) {
        const content = fs.readFileSync(txtPath, 'utf-8').trim();
        const firstLine = content.split(/\r?\n/)[0];
        return firstLine || '';
    }
    return '';
}

function scanTuFolder() {
    if (!fs.existsSync(TU_DIR)) {
        console.error(`❌ 错误：找不到 "${TU_DIR}" 文件夹，请确保 tu 文件夹与脚本同级。`);
        process.exit(1);
    }
    const files = fs.readdirSync(TU_DIR);
    const items = [];

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const baseName = path.basename(file, ext);
        const fullPath = path.join(TU_DIR, file);
        const stat = fs.statSync(fullPath);
        if (!stat.isFile()) continue;

        let mediaType = null;
        let isValid = false;

        // 图片检测
        if (IMAGE_EXTS.includes(ext)) {
            mediaType = 'image';
            isValid = true;
        }
        // 视频检测：仅包含 _x264 的 mp4
        else if (VIDEO_EXTS.includes(ext) && file.toLowerCase().includes('_x264')) {
            mediaType = 'video';
            isValid = true;
        }

        if (!isValid) continue;

        const displayTitle = cleanTitle(baseName);
        const dateLabel = extractDateLabel(baseName);
        const linkUrl = getLinkFromTxt(path.join(TU_DIR, baseName));

        items.push({
            url: `tu/${file}`,
            displayTitle: displayTitle,
            dateLabel: dateLabel,
            linkUrl: linkUrl,
            mediaType: mediaType,
            originalName: baseName
        });
    }

    // 排序：按日期降序（若有日期），否则按标题
    items.sort((a, b) => {
        if (a.dateLabel && b.dateLabel) {
            return b.dateLabel.localeCompare(a.dateLabel);
        }
        if (a.dateLabel) return -1;
        if (b.dateLabel) return 1;
        return a.displayTitle.localeCompare(b.displayTitle);
    });

    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(items, null, 2), 'utf-8');
    console.log(`✅ 成功生成索引：${OUTPUT_JSON}`);
    console.log(`📦 共扫描到 ${items.length} 个作品（图片+视频）`);
}

scanTuFolder();