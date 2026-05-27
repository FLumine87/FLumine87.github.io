const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// 清理并重建 dist 文件夹
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function build() {
    try {
        // 渲染 EJS
        if (fs.existsSync('views')) {
            const viewFiles = fs.readdirSync('views').filter(f => f.endsWith('.ejs'));
            for (let file of viewFiles) {
                const htmlContent = await ejs.renderFile(path.join('views', file), {
                    title: 'Personal Website',
                });
                const htmlFileName = file.replace('.ejs', '.html');
                fs.writeFileSync(path.join('dist', htmlFileName), htmlContent);
                console.log(`✅ 生成: ${htmlFileName}`);
            }
        }
        
        // 复制静态资源
        const dirsToCopy = ['public', 'assets'];
        for (let dir of dirsToCopy) {
            if (fs.existsSync(dir)) {
                copyDir(dir, path.join('dist', dir));
                console.log(`✅ 复制: ${dir}`);
            }
        }
        
        // 复制 JS 文件
        const filesToCopy = ['gameLogic.js'];
        for (let file of filesToCopy) {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, path.join('dist', file));
                console.log(`✅ 复制: ${file}`);
            }
        }
        
        console.log('\n🎉 构建完成！现在运行：');
        console.log('npm run deploy');
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
    }
}

build();