const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const IS_DEV = process.env.NODE_ENV === 'development';
const plugins = [
  new htmlWebpackPlugin({
    template: path.join(__dirname, './public/index.html'),
  }),
];

console.log(IS_DEV);

module.exports = {
  entry: './src/index.jsx',
  mode: IS_DEV ? 'development' : 'production',
  // mode: 'development',
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './dist'),
    clean: true,
    chunkFilename: `[name].js`,
  },
  module: {
    rules: [
      // the 'transform-runtime' plugin tells Babel to
      // require the runtime instead of inlining it.
      {
        test: /^(?!.*\.min\.jsx?$).*\.jsx?$/,
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
                },
              ],
              '@babel/preset-react',
            ],
          },
        },
      },
    ],
  },
  plugins: plugins,
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 9000,
    open: true,
  },
  performance: {
    hints: false,
  },
};
