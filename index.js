const Redis = require('ioredis');
module.exports = function (opts = {}) {

    const defaultConfig = {
        maxAge: 60,
        cacheProperty: 'originalUrl',
        redis: {},
        onBeforeGet: null,
        onReadCache: null,
    };

    const cfg = Object.assign(defaultConfig, opts);

    const cache = new Redis(cfg.redis);

    return async function (ctx, next) {

        const key = ctx[cfg.cacheProperty];

        ctx.cacheStore = cache;

        ctx.cache = (value, opts = {}) => {
            return cache.set(key, value, 'EX', opts.maxAge || cfg.maxAge)
        };

        ctx.uncache = () => {
            return cache.del(key)
        };

        if (typeof cfg.onBeforeGet === 'function') {
            await cfg.onBeforeGet.call(ctx, key);
        }

        let value = await cache.get(key);

        if (value) {
            if (typeof cfg.onReadCache === 'function') {
                value = await cfg.onReadCache.call(ctx, key, value) || value;
            }
            return ctx.body = value;
        }

        await next();
    }
};