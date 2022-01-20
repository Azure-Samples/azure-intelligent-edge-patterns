/* eslint-disable */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware(['/api', '/video_feed', '/cancel_upload'], {
      target: `http://localhost:${process.env.PROXY_PORT}`,
      changeOrigin: true,
    }),
  );
};
