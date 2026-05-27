const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// 清理之前的构建
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist');

// 复制文件夹的函数
function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
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

// 渲染 EJS 模板
async function build() {
    try {
        // 1. 渲染 views 中的 EJS 文件
        if (fs.existsSync('views')) {
            const viewFiles = fs.readdirSync('views').filter(f => f.endsWith('.ejs'));
            
            for (let file of viewFiles) {
                const htmlContent = await ejs.renderFile(path.join('views', file), {
                    title: 'Personal Website',
                    // 添加你的模板变量
                });
                
                const htmlFileName = file.replace('.ejs', '.html');
                fs.writeFileSync(path.join('dist', htmlFileName), htmlContent);
                console.log(`✅ 生成: ${htmlFileName}`);
            }
        }
        
        // 2. 复制静态资源
        const dirsToCopy = ['public', 'assets'];
        for (let dir of dirsToCopy) {
            if (fs.existsSync(dir)) {
                copyDir(dir, path.join('dist', dir));
                console.log(`✅ 复制文件夹: ${dir}`);
            }
        }
        
        // 3. 复制单独的 JS 文件
        const filesToCopy = ['gameLogic.js'];
        for (let file of filesToCopy) {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, path.join('dist', file));
                console.log(`✅ 复制文件: ${file}`);
            }
        }
        
        console.log('\n🎉 构建完成！dist 文件夹已准备好');
        console.log('\n📌 下一步：');
        console.log('1. 将 dist 内容复制到根目录或使用 docs 文件夹');
        
    } catch (error) {
        console.error('❌ 构建失败:', error.message);
    }
}

build();