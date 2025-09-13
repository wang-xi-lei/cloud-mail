#!/usr/bin/env node

/**
 * 安全的数据库初始化脚本
 * 使用方法：node scripts/safe-init.js [options]
 */

const readline = require('readline');

// Fetch polyfill for older Node.js versions
if (!globalThis.fetch) {
    try {
        globalThis.fetch = require('node-fetch');
    } catch (e) {
        console.error('❌ 需要安装 node-fetch: npm install node-fetch');
        process.exit(1);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 配置
const config = {
    baseUrl: process.env.INIT_BASE_URL || 'http://127.0.0.1:8787/api',
    jwtSecret: process.env.JWT_SECRET || '',
    force: process.argv.includes('--force'),
    skipConfirm: process.argv.includes('--yes')
};

// 颜色输出
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function checkInitStatus() {
    try {
        const response = await fetch(`${config.baseUrl}/init/status`);
        const data = await response.json();
        return data.initialized;
    } catch (error) {
        log(`❌ 无法检查初始化状态: ${error.message}`, 'red');
        return null;
    }
}

async function performInit() {
    try {
        const response = await fetch(`${config.baseUrl}/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                secret: config.jwtSecret,
                confirmInit: true
            })
        });

        const result = await response.text();
        
        if (response.ok) {
            log(`✅ ${result}`, 'green');
            return true;
        } else {
            log(`❌ 初始化失败: ${result}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ 初始化过程中发生错误: ${error.message}`, 'red');
        return false;
    }
}

async function main() {
    log('🔧 Cloud Mail 安全初始化工具', 'blue');
    log('================================', 'blue');

    // 检查JWT密钥
    if (!config.jwtSecret) {
        log('❌ 错误: 未提供JWT密钥', 'red');
        log('请设置环境变量 JWT_SECRET 或在 wrangler.toml 中配置', 'yellow');
        log('示例: JWT_SECRET=your-secret-key node scripts/safe-init.js', 'yellow');
        process.exit(1);
    }

    // 检查当前初始化状态
    log('🔍 检查系统初始化状态...', 'yellow');
    const isInitialized = await checkInitStatus();
    
    if (isInitialized === null) {
        log('⚠️  无法连接到服务器，请确保后端服务正在运行', 'yellow');
        process.exit(1);
    }

    if (isInitialized && !config.force) {
        log('✅ 系统已经初始化过了', 'green');
        log('如果需要强制重新初始化，请使用 --force 参数', 'yellow');
        process.exit(0);
    }

    if (isInitialized && config.force) {
        log('⚠️  系统已经初始化过了，但检测到 --force 参数', 'yellow');
        log('⚠️  强制重新初始化可能会导致数据问题！', 'red');
    }

    // 确认操作
    if (!config.skipConfirm) {
        log('\n📋 即将执行的操作:', 'blue');
        log('  • 创建数据库表结构', 'blue');
        log('  • 插入默认权限和角色数据', 'blue');
        log('  • 初始化系统设置', 'blue');
        
        if (isInitialized) {
            log('  • ⚠️  覆盖现有的初始化状态', 'red');
        }

        const confirm = await question('\n❓ 确定要继续吗？(yes/no): ');
        if (confirm.toLowerCase() !== 'yes') {
            log('❌ 操作已取消', 'yellow');
            process.exit(0);
        }
    }

    // 执行初始化
    log('\n🚀 开始初始化...', 'green');
    const success = await performInit();
    
    if (success) {
        log('\n🎉 初始化完成！', 'green');
        log('💡 建议:', 'blue');
        log('  • 立即修改默认管理员密码', 'blue');
        log('  • 检查系统设置配置', 'blue');
        log('  • 配置邮件发送服务', 'blue');
    } else {
        log('\n💥 初始化失败，请检查错误信息', 'red');
        process.exit(1);
    }

    rl.close();
}

// 处理命令行参数
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Cloud Mail 安全初始化工具

使用方法:
  node scripts/safe-init.js [options]

选项:
  --force     强制重新初始化（即使已经初始化过）
  --yes       跳过确认提示
  --help, -h  显示帮助信息

环境变量:
  JWT_SECRET      JWT密钥（必需）
  INIT_BASE_URL   API基础URL（默认: http://127.0.0.1:8787/api）

示例:
  JWT_SECRET=your-secret node scripts/safe-init.js
  JWT_SECRET=your-secret node scripts/safe-init.js --force --yes
`);
    process.exit(0);
}

// 运行主程序
main().catch((error) => {
    log(`💥 未处理的错误: ${error.message}`, 'red');
    process.exit(1);
});
