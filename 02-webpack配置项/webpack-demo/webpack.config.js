const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
module.exports = {
  entry: './src/index.js',

  // mode: 'production',
  mode: 'development',
  output: {
    filename: 'target.js',
    path: path.join(__dirname, './static'),
    clean: true,
  },
  module: {
    rules: [
      // the 'transform-runtime' plugin tells Babel to
      // require the runtime instead of inlining it.
      {
        test: /\.m?js$/,
        include: {
          and: [path.join(__dirname, './src/')],
        },
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false,
                  // 松散模式生成的代码更少
                  loose: true,
                  /**
                   * useBuiltIns
                   *false
                   *“useBuiltIns”: false,
                   *此时不对 polyfill 做操作。如果引入 @babel/polyfill，则无视配置的浏览器兼容，引入所有的 polyfill。
                   *entry
                   *“useBuiltIns”: “entry”,
                   *“corejs”: 2,
                   *根据配置的浏览器兼容，引入浏览器不兼容的 polyfill。需要在入口文件手动添加 import ‘@babel/polyfill’，会自动根据 browserslist 替换成浏览器不兼容的所有 polyfill。
                   *
                   *这里需要指定 core-js 的版本, 如果 “corejs”: 3, 则 import ‘@babel/polyfill’ 需要改成
                   *
                   *import ‘core-js/stable’;
                   *import ‘regenerator-runtime/runtime’;
                   *usage
                   *“useBuiltIns”: “usage”,
                   *“corejs”: 2,
                   *usage 会根据配置的浏览器兼容，以及你代码中用到的 API 来进行 polyfill，实现了按需添
                   *————————————————
                   */
                  useBuiltIns: 'usage',
                  corejs: { version: '3.24.1', proposals: true },
                },
              ],
            ],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: path.join(__dirname, './src/index.html'),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  target: ['web', 'es5'],
  devServer: {
    static: {
      directory: path.join(__dirname, 'static'),
    },
    port: 9000,
    open: true,
    hot: true,
  },
};
