const htmlInject = require('html-webpack-inject-attributes-plugin')
const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)
const IS_PROD = ['production'].includes(process.env.NODE_ENV)
const xmglTestApi = process.env.VUE_APP_XMGL_API
const { name } = require('./package')
const { defineConfig } = require('@vue/cli-service')
const { codeInspectorPlugin } = require('code-inspector-plugin')

function proxyHandle(proxyReq) {
  const origin = xmglTestApi
  proxyReq.setHeader('origin', origin)
  proxyReq.setHeader('referer', origin)
}

function onProxyReq(proxyReq, req, res, options) {
  proxyHandle(proxyReq)
}

function onProxyReqWs(proxyReq, req, socket, options) {
  proxyHandle(proxyReq)
}

module.exports = defineConfig({
  // publicPath: './',
  outputDir: 'dist',
  publicPath: IS_PROD ? '/bimtwins/infra-construction-web/' : '/',
  productionSourceMap: false,
  transpileDependencies: [],
  devServer: {
    port: '8080',
    open: false,
    client: {
      overlay: false
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
      '/bimtwins/api': {
        target: xmglTestApi,
        secure: true,
        changeOrigin: true,
        ws: true,
        cookieDomainRewrite: {
          '*': xmglTestApi
        },
        cookiePathRewrite: {
          '*': '/'
        },
        onProxyReq,
        onProxyReqWs
      }
    }
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd', // 把微应用打包成 umd 库格式
      chunkLoadingGlobal: `webpackJsonp_${name}`
    },
    plugins: [
      codeInspectorPlugin({
        bundler: 'webpack'
        // Add any additional options you need here
      })
    ]
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "~@/styles/variables.scss";'
      }
    },
    sourceMap: true,
    extract: false // 是否将组件中的 CSS 提取至一个独立的 CSS 文件中 (而不是动态注入到 JavaScript 中的 inline 代码)。
  },
  chainWebpack(config) {
    // ---------------------------- 为入口js增加"entry"标识, 乾坤下识别微应用入口js begin ----------------------------
    config.plugin('html').tap((args) => {
      args[0].attributes = {
        entry: function (tag) {
          if (tag.tagName === 'script' && tag.attributes.src && tag.attributes.src.includes('app')) {
            return true
          } else {
            return false
          }
        }
      }
      return args
    })
    // 必要, 在htmlWebpackPlugin之后执行, 插入自定义的attributes
    config.plugin('html-inject').after('html').use(htmlInject, [])
    // ---------------------------- end ----------------------------

    config.resolve.alias.set('@', resolve('src'))
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap((options) => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config.when(!IS_PROD, (conf) => conf.devtool('eval-source-map'))

    config.when(IS_PROD, (conf) => {
      conf.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'),
            minChunks: 3,
            priority: 5,
            reuseExistingChunk: true
          },
          node_vendors: {
            name: 'chunk-libs',
            chunks: 'initial',
            test: /[\\/]node_modules[\\/]/,
            priority: 10
          },
          elementUI: {
            name: 'chunk-elementUI',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/
          }
        }
      })

      conf.optimization.runtimeChunk('single')
    })
  }
})
