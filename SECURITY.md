# 🔒 Cloud Mail 安全指南

## 初始化安全

### ⚠️ 安全风险

原始的初始化接口存在以下安全风险：

1. **JWT密钥暴露**: 密钥在URL中明文传输
2. **重复执行**: 可能导致数据重复或系统异常
3. **无访问控制**: 任何知道密钥的人都能调用
4. **日志泄露**: 密钥可能被记录在各种日志中

### ✅ 安全改进

我们实现了以下安全措施：

#### 1. 初始化状态检查
- 系统会检查是否已经初始化过
- 防止重复初始化导致的数据问题
- 使用KV存储持久化初始化状态

#### 2. 更安全的API设计
```bash
# ❌ 不安全的方式（已弃用但保留兼容性）
GET /api/init/your-jwt-secret

# ✅ 安全的方式
POST /api/init
Content-Type: application/json
{
  "secret": "your-jwt-secret",
  "confirmInit": true
}
```

#### 3. 明确确认机制
- 需要在请求体中明确设置 `confirmInit: true`
- 防止意外调用初始化接口

#### 4. 状态查询接口
```bash
GET /api/init/status
# 返回: {"initialized": true/false}
```

### 🛠️ 推荐使用方法

#### 方法1: 使用安全初始化脚本（推荐）

```bash
# 1. 设置JWT密钥环境变量
export JWT_SECRET="your-jwt-secret-here"

# 2. 运行安全初始化脚本
cd mail-worker
node scripts/safe-init.js

# 3. 强制重新初始化（谨慎使用）
node scripts/safe-init.js --force

# 4. 跳过确认提示（自动化部署时使用）
node scripts/safe-init.js --yes
```

#### 方法2: 手动API调用

```bash
# 1. 检查初始化状态
curl "http://your-domain.com/api/init/status"

# 2. 如果未初始化，执行初始化
curl -X POST "http://your-domain.com/api/init" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-jwt-secret",
    "confirmInit": true
  }'
```

### 🚨 生产环境注意事项

#### 1. 环境隔离
- 开发环境和生产环境使用不同的JWT密钥
- 生产环境的JWT密钥应该足够复杂且定期更换

#### 2. 网络安全
- 生产环境应该使用HTTPS
- 考虑使用VPN或内网访问初始化接口
- 初始化完成后可以考虑禁用初始化接口

#### 3. 监控和日志
- 监控初始化接口的调用
- 记录初始化操作的IP和时间
- 设置异常调用的告警

#### 4. 备份策略
- 初始化前备份现有数据
- 测试初始化脚本在测试环境中的效果

### 🔧 故障排除

#### 问题1: "系统已经初始化过了"
```bash
# 检查初始化状态
curl "http://your-domain.com/api/init/status"

# 如果确实需要重新初始化，使用force参数
JWT_SECRET=your-secret node scripts/safe-init.js --force
```

#### 问题2: "JWT密钥不匹配"
- 检查环境变量 `JWT_SECRET` 是否正确设置
- 确认wrangler.toml中的jwt_secret配置
- 注意密钥的大小写和特殊字符

#### 问题3: 无法连接到服务器
- 确认后端服务正在运行
- 检查端口和域名配置
- 确认防火墙设置

### 📝 最佳实践

1. **定期更换密钥**: 建议每季度更换JWT密钥
2. **最小权限原则**: 只在必要时暴露初始化接口
3. **监控访问**: 记录所有初始化相关的API调用
4. **自动化部署**: 使用CI/CD时集成安全初始化脚本
5. **文档更新**: 及时更新部署文档和安全指南

### 🆘 紧急情况处理

如果怀疑JWT密钥泄露：

1. 立即更换JWT密钥
2. 检查系统日志，确认是否有异常初始化操作
3. 如有必要，重新初始化系统
4. 加强监控和访问控制

---

**记住**: 安全是一个持续的过程，不是一次性的设置！
