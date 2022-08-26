## webpack 编译 ts 解决方案

### webpack 传递动态参数的方式

- shell 命令设置环境变量方式
  在 window cmd shell 工具中和 Linux 的 shell 工具中设置环境的变量的命令不同的

```bash
# windows
set NODE_ENV=production
echo echo %NODE_ENV% # production

# linux
export NODE_ENV=production
echo $NODE_ENV # productions
```

我们可以使用 cross-env 这个 npm 他可以抹平我们在不同环境设置环境变量的差异

```bash
cross-env NODE_ENV=production webpack
```

我们 webpack 配置文件中通过 process.env 获取我们需要的环境变量，用于配置 webpack

```js
const IS_DEV = process.env.NODE_ENV === 'development';
module.exports = {
  ...
  mode: IS_DEV ? development : 'production'
  ...
}
```

- webpack --env <value...> 方式
  运行 `webpack` 命令可以通过 --env <value...> 方式添加自定义的参数

```bash
webpack serve --env NODE_ENV=production
```

我们将 webpack 配置导出为一个函数，这个函数会接受我们通过 `webpack --env` 配置的参数

```js
module.exports = (env) => {
  const {NODE_NEV = 'development'} = env;

  return {
    ...
    mode: NODE_NEV
    ...
  }

}
```

### webpack 编译 ts 方案

#### babel + @babel/preset-typescript

使用 babel 编译 ts 方案，babel-loader 会根据我们的配置（`babelrc` 或 options 配置），去编译 ts,这种方案不会使用 tsc，所以这种方案也不具备 ts 类型检查。
webpack.config.js 配置

```js
module.exports = {
  module: {
    rules: [
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

                    /**
                     * targets这里不明确指定，由业务项目自行决定。
                     * 一般只需要指定目标浏览器，可以在项目的`static/package.json`中配置
                     * 参考：https://github.com/browserslist/browserslist
                     * 推荐通过 browserslist browserslist可以同时作用css 样式文件
                     */
                    // targets: [],
                    // 按需polyfill , 为了不污染作用域链 ，配合使用'@babel/plugin-transform-runtime
                    // useBuiltIns: 'usage',
                  },
                ],
                // { runtime: 'automatic' } 自动引入react 运行时
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
            },
          },
        ],
      },
    ],
  },
};
```

#### ts-loader + babel

- 使用 ts-loader， webpack 编译时 会先调用 tsc 根据 tsconfig 配置 去编译我们的 ts。默认情况下 ts-loader 会进行代码`转译`和类型`检查`，如果文件过多构建的速度就会变慢。
- 为了增加编译速度 我们使用 thread-loader 开启并行构建 参考 https://www.npmjs.com/package/thread-loader
- 我们不使用 tsc 默认的类型检查 ，在同一进程下 文件过多影响构建速度 ，我们使用 fork-ts-checker-webpack-plugin fork 一个线程做类型检查

webpack.confg.js 配置

```js
module.exports = {
  module: {
    rules: [
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

                    /**
                     * targets这里不明确指定，由业务项目自行决定。
                     * 一般只需要指定目标浏览器，可以在项目的`static/package.json`中配置
                     * 参考：https://github.com/browserslist/browserslist
                     * 推荐通过 browserslist browserslist可以同时作用css 样式文件
                     */
                    // targets: [],
                    // 按需polyfill , 为了不污染作用域链 ，配合使用'@babel/plugin-transform-runtime
                    // useBuiltIns: 'usage',
                  },
                ],
                // { runtime: 'automatic' } 自动引入react 运行时
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // 不使用tsc 默认的类型检查
    // fork 一个进程进行ts类型检查
    // 参数 async 为 false，同步的将错误信息反馈给 webpack，如果报错了，webpack 就会编译失败
    // async 默认为 true，异步的将错误信息反馈给 webpack，如果报错了，不影响 webpack 的编译
    // async: false,
    // eslint: false,
    new ForkTsCheckerWebpackPlugin({
      async: true,
    }),
  ],
};
```

#### 两种编译 ts 方案的不同

#### 如何在我们项目中配置 babel
