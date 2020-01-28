module.exports = function(env = {}, argv) {
  const path = require('path')
  const webpack = require('webpack')
  const CopyWebpackPlugin = require('copy-webpack-plugin')
  const HtmlWebpackPlugin = require('html-webpack-plugin')
  const plugins = []
  const projectPath = path.resolve(__dirname, './')

  const isMock = env.API_MOCK === 1
  const entry = {}

  const dir = {
    project: projectPath,
    src: path.join(projectPath, 'src'),
    // build: path.join(projectPath, 'docs'),
    mocks: path.join(projectPath, 'src/__mocks__'),
  }

  plugins.push(
    new webpack.EnvironmentPlugin({
      NODE_ENV: argv.mode || 'development',
    })
  )

  plugins.push(
    new HtmlWebpackPlugin({
      template: `${dir.mocks}/index.ejs`,
      title: 'TOP画面',
      filename: 'index.html',
    })
  )

  plugins.push(
    new CopyWebpackPlugin([
      {
        from: `${dir.mocks}/api/`,
        to: `api`,
      },
    ])
  )

  entry.index = [`${dir.src}/index.js`]

  if (isMock) {
    entry.index.unshift(`${dir.mocks}/apiMocker.js`)
  }

  return {
    context: dir.project,
    entry,
    output: {
      filename: '[name].js',
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
      port: 8080,
      host: '0.0.0.0',
      inline: true,
    },
  }
}
