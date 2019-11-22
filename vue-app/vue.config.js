const fs = require('fs');
// const yargv = require('yargs').argv;

module.exports = {
  configureWebpack: {
    devServer: {
      contentBase: './dist',
      host: '0.0.0.0',
      hot: true,
      https: {
        key: fs.readFileSync('./server.key'),
        cert: fs.readFileSync('./server.cert')
      }
    },
  },

  pwa: {
    appleMobileWebAppCapable: 'yes',
    manifestOptions: {
      display: 'fullscreen'
    }
  }
};
