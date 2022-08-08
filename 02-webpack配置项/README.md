# webpack 配置项

## 理解 webpack 打包过程

输入 -> 模块处理 -> 后处理 -> 输出

`输入`：文件系统读取代码文件
`模块处理`：调用 loader 转译 module 内容为 ast,从 ast 中分析 模块依赖关系，根据依赖关系递归调用模块处理的过程，直到所有的模块文件被处理完
`后处理`：所有的模块处理完后，处理模块的合并、注入运行时、产物优化等，最终输出 chunk 集合
`输出`：将 chunk 写到外部文件系统，将 chunk 办成 bundle 的过程

webpack 配置项可以分为这两类
流程类配置项： 作用于 webpack 某个流程 或者若干个流程的配置项
工具类配置项： 打包主流程外 提供工程化 工具的配置项

### 流程类 配置项

- 输入输出
  - entry
  - context
  - output
- 模块处理
  - resolve
  - module
  - externals
- 后处理
  - optimization
  - target
  - mode

### 工具类配置项

- 开发效率

  - watch
  - devtool:配置产物 sourceMap 生成规则
  - dev-server

- 打包性能优化类

  - cache
  - performance

- 日志
  - stats
  - infrastructureLogging

工程类配置在主流程外提供了额外的工程化能力 比如 devtool 用于配置 soucemap 生成规则 devserver 配置开发服务器 watch 实现监听构建 ，每一个工程化配置项专注于解决某一类工程问题
![配置项](../images/webpack%E9%85%8D%E7%BD%AE%E9%A1%B9.webp)
