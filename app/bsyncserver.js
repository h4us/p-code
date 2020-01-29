const browserSync = require('browser-sync');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const webpackConfig = require('./webpack.dev');
const bundler = webpack(webpackConfig);

const browserSyncs = [];
const numSyncServer = process.argv.length > 2 ? parseInt(process.argv[2]) : 1;
for(let i = 0; i < numSyncServer; i ++) {
  browserSyncs.push(browserSync.create(`syncserver-{i}`));
}

bundler.plugin('done', function(stats) {
  if (stats.hasErrors() || stats.hasWarnings()) {
    // TODO: Catch error
    // return browserSync.sockets.emit('fullscreen:message', {
    //   title: 'Webpack Error:',
    //   body: '-',
    //   timeout: 100000
    // });
  }
  for(i in browserSyncs) {
    browserSyncs[i].reload();
  }
});

for(i in browserSyncs) {
  browserSyncs[i].init({
    server: 'dist',
    https: {
      key: 'server.key',
      cert: 'server.crt'
    },
    open: false,
    port: 3000 + (i * 10),
    ui: false,
    logFileChanges: false,
    middleware: i == 0 ? [
      webpackDevMiddleware(bundler, {
        publicPath: webpackConfig.output.publicPath,
        stats: { colors: true }
      })
    ] : [],
    files: ['app/*.js', 'app/*.html']
  });
}
