module.exports = function(env, argv) {
  const path = require('path')
  const webpack = require('webpack')
  const CopyWebpackPlugin = require('copy-webpack-plugin')
  const HtmlWebpackPlugin = require('html-webpack-plugin')
  const plugins = []
  const projectPath = path.resolve(__dirname, './')

  // const isProd = argv.mode === 'production'
  const isMock = process.env.API_MOCK === '1'
  const entry = {}

  const dir = {
    project: projectPath,
    src: path.join(projectPath, 'src'),
    mocks: path.join(projectPath, 'src/__mocks__'),
  }

  plugins.push(
    new webpack.EnvironmentPlugin({
      NODE_ENV: argv.mode || 'development',
      API_MOCK: process.env.API_MOCK,
    })
  )

  plugins.push(
    new HtmlWebpackPlugin({
      title: 'TOP画面',
      filename: 'index.html',
    })
  )

  plugins.push(
    new CopyWebpackPlugin([
      {
        from: `${dir.mocks}/ajax/`,
        to: `${dir.build}/ajax/`,
      },
    ])
  )

  entry.index = [`${dir.src}/index.js`]

  if (process.env.API_MOCK === '1') {
    entry.index.unshift(`src/__mocks__/apiMocker.js`)
  }

  return {
    context: dir.project,
    entry,
    output: {
      filename: '[name].js',
      path: dir.build,
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.(ya?ml)$/i,
          use: [
            {
              loader: 'json-loader',
            },
            {
              loader: 'yaml-loader',
            },
          ],
        },
      ],
    },
    plugins: plugins,
    devServer: {
      contentBase: dir.build,
      port: 8000,
      host: '0.0.0.0',
      inline: true,
    },
  }
}
