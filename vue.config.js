module.exports = {
  publicPath: '',
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '三角消'
      return args
    })
  },
  outputDir: 'docs'
}