const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

const IS_DEV = process.env.NODE_ENV === 'development';
const plugins = [
  new htmlWebpackPlugin({
    template: path.join(__dirname, './public/index.html'),
  }),
];

module.exports = {
  entry: './src/index.tsx',
  mode: IS_DEV ? 'development' : 'production',
  // mode: 'development',
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './dist'),
    clean: true,
    chunkFilename: `[name].js`,
  },
  // 模块解析配置
  // 模块别名配置
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.coffee', '.json'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  module: {
    rules: [
      // the 'transform-runtime' plugin tells Babel to
      // require the runtime instead of inlining it.
      {
        test: /^(?!.*\.min\.tsx?$).*\.tsx?$/,
        include: {
          and: [path.join(__dirname, './src/')],
        },
        use: [
          {
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
          {
            loader: 'ts-loader',
            options: {
              // 关闭类型检查，即只进行转译
              // 类型检查交给 fork-ts-checker-webpack-plugin 在别的的线程中做
              // transpileOnly: true,

              // 如果设置了 happyPackMode 为 true
              // 会隐式的设置 transpileOnly: true
              happyPackMode: true,
              // 编译配置 会覆盖 tsconfig
              compilerOptions: {
                module: 'es2015',
                noEmit: false,
              },
            },
          },
        ],
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
  devtool: IS_DEV ? 'source-map' : false,
  // devtool: 'source-map',
};
