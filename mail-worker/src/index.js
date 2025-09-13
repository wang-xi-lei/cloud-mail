import app from './hono/webs';
import { email } from './email/email';
import userService from './service/user-service';
import verifyRecordService from './service/verify-record-service';
export default {
	 async fetch(req, env, ctx) {
		const url = new URL(req.url)


		if (url.pathname.startsWith('/api/')) {
			url.pathname = url.pathname.replace('/api', '')
			req = new Request(url.toString(), req)
			return app.fetch(req, env, ctx);
		}


		// 在开发环境下，如果 assets 不存在，返回一个简单的响应
	if (env.assets) {
		return env.assets.fetch(req);
	} else {
		return new Response('Development mode - assets not available', { status: 404 });
	}
	},
	email: email,
	async scheduled(c, env, ctx) {
		await verifyRecordService.clearRecord({env})
		await userService.resetDaySendCount({ env })
	},
};
