const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const IS_DEV = process.env.NODE_ENV === 'development';
const plugins = [
  new htmlWebpackPlugin({
    template: path.join(__dirname, './public/index.html'),
  }),
];

const crateCompileTSRule = (use) => {
  const baseRule = {
    test: /^(?!.*\.min\.tsx?$).*\.tsx?$/,
    include: {
      and: [path.join(__dirname, './src/')],
    },
  };
  let useConfg;
  if (use === 'babel-loader') {
    // 使用babel 编译ts 需要添加 @babel/preset-typescript ，同事babel 不具备ts 类型检查功能
    useConfg = [
      {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                modules: false,
                loose: true,
                // useBuiltIns: 'usage',
              },
            ],
            // { runtime: 'automatic' } 自动引入react 运行时
            ['@babel/preset-react', { runtime: 'automatic' }],
            '@babel/preset-typescript',
          ],
        },
      },
    ];
  } else if (use === 'ts-loader') {
    useConfg = [
      // 开启并行构建
      'thread-loader',
      {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                modules: false,
                loose: true,
                // useBuiltIns: 'usage',
              },
            ],
            '@babel/preset-react',
            // ['@babel/preset-react', { runtime: 'automatic' }],
          ],
        },
      },
      {
        loader: 'ts-loader',

        options: {
          // 关闭类型检查，即只进行转译
          // 类型检查交给 fork-ts-checker-webpack-plugin 在别的的线程中做
          // transpileOnly: true,

          // 如果我们要使用happypack or thread-loader 并行构建 happyPackMode要设置为 true
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
    ];
  }

  return {
    rules: [{ ...baseRule, use: useConfg }],
    plugins: [
      // fork 一个进程进行检查
      // 参数 async 为 false，同步的将错误信息反馈给 webpack，如果报错了，webpack 就会编译失败
      // async 默认为 true，异步的将错误信息反馈给 webpack，如果报错了，不影响 webpack 的编译
      // async: false,
      // eslint: false,
      new ForkTsCheckerWebpackPlugin({
        async: true,
      }),
    ],
  };
};

module.exports = ({ use = 'ts-loader' }) => {
  const { rules: tsRules, plugins: tsPlugins } = crateCompileTSRule(use);
  return {
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
      rules: [...tsRules],
    },
    plugins: [...plugins, ...tsPlugins],
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
};
