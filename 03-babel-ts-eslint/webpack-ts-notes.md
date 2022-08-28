## webpack 编译 ts 解决方案

### webpack 传递动态参数的方式

- shell 命令设置环境变量方式
  在 window cmd shell 工具中和 Linux 的 shell 工具中设置环境的变量的命令是不同的

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

在 webpack 配置文件中通过 process.env 获取我们需要的环境变量，用于配置 webpack

```js
const IS_DEV = process.env.NODE_ENV === 'development';
module.exports = {
  ...
  mode: IS_DEV ? development : 'production'
  ...
}
```

- webpack --env <value...> 命令传参方式
  运行 `webpack` 命令可以通过 --env <value...> 方式添加自定义的参数

```bash
webpack serve --env NODE_ENV=production
```

我们将 webpack 配置导出为一个函数，这个函数会接收 `webpack --env` 配置的参数

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

#### babel + @babel/preset-typescript 方案

使用 babel 编译 ts 方案，babel-loader 会根据我们的配置（`babelrc` 或 options 配置），去编译 ts,这种方案不会使用 tsc，所以也不具备 ts 类型检查的功能。

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

#### ts-loader + babel 方案

- 使用 ts-loader， webpack 编译时 会先调用 tsc 根据 tsconfig 配置 去编译我们的 ts。默认情况下 ts-loader 会进行代码`转译`和类型`检查`，如果文件过多构建的速度就会变慢。
- 为了增加编译速度 我们使用 thread-loader 开启并行构建 参考 https://www.npmjs.com/package/thread-loader
- 我们不使用 tsc 默认的类型检查 ，在同一进程下 文件过多影响构建速度 ，我们使用 fork-ts-checker-webpack-plugin fork 一个进程程做类型检查

webpack.confg.js 配置

```js
module.exports = {
  // 模块解析配置
  // 模块别名配置
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.coffee', '.json'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
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

#### react + ts 项目中配置 tsconfig

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    // 声明文件目录，默认时node_modules/@types
    "typeRoots": ["./src/types", "./node_modules/@types"],
    "paths": {
      "*": ["src/*"] // 路径映射，相对于baseUrl
    },
    "jsx": "react-jsx",
    "strict": true,
    "allowJs": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "module": "esnext",
    "target": "esnext",
    "skipLibCheck": true,
    "noImplicitAny": false,
    "noUnusedLocals": true,
    "noImplicitReturns": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "strictNullChecks": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "strictPropertyInitialization": true,
    "lib": ["dom", "es2015", "es2016", "es2017", "esnext"],
    // 不输出文件,即编译后不会生成任何js文件
    "noEmit": true,
    "useUnknownInCatchVariables": false
  },
  "include": ["src"],
  "exclude": ["./node_modules"]
}
```

#### 两种编译 ts 方案的不同

babel 和 tsc 的编译流程大同小异 ，都是把源码转换成 AST，会进行 AST 的 transform， 最后都会用 generator 吧 AST 生成目标代码和 sourcemap
但是他们之间也有一些不同

- Babel 不会进行类型检查和生成.d.ts 的类型文件
- tsc 支持 es 标准特性和部分 proposal（草案）特性，而 babel 通过 @babel/preset-env 支持所有的标准特性， 同时可以通过引入@babel/proposal-xx 来支持一些非标准特性，所以在支持 es 语言特性上 babel 更强一点
- tsc 没有做 polyfill 处理，需要全量引入 core-js 来做 polyfill,babel 的@babel/preset-env 会根据 targets 配置，来按需引入 core-js 模块来按需 polyfill
- babel 不支持一些 ts namespace 合并，有些 tsc 特性不支持
- babel 编译出的代码体积更小，没有做类型检查，编译速度也更快

**参考文章**

[Webpack 转译 Typescript 现有方案](https://juejin.cn/post/6844904052094926855)
[编译 ts 用 tsc 还是 Babel](https://juejin.cn/post/7084882650233569317)
