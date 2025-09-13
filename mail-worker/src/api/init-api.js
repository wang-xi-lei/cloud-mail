import app from '../hono/hono';
import initService from '../init/init';

// 添加初始化状态查询接口（放在前面避免被通配符路由拦截）
app.get('/init/status', async (c) => {
	const isInitialized = await initService.checkInitialized(c);
	return c.json({ initialized: isInitialized });
});

// 新的更安全的POST接口
app.post('/init', (c) => {
	return initService.init(c);
});

// 保留旧的GET接口用于兼容性，但添加警告
app.get('/init/:secret', (c) => {
	console.warn('[SECURITY WARNING] Using deprecated GET /init endpoint. Please use POST /init instead.');
	return initService.init(c);
});
