const request = require('supertest');
const koa = require('koa');
const Router = require('koa-router');
const cache = require('../');

describe('cache', function () {

    it('should be done with save set to false', function (done) {
        const app = new koa();

        app.use(cache({
            redis: {
                keyPrefix: 'my-test'
            },
            onBeforeGet(key) {
                return this.cacheStore.set(key, 'ciao');
            },
            onReadCache() {
                done()
            }
        }));

        app.use(async ctx => {
            const result = 'hello world';
            await ctx.cache(result);
            ctx.body = result;
        });

        request(app.listen()).get('/').end((err, res) => {
            console.log(res.text);
            //done()
        });
    });

});