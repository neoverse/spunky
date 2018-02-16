const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env) => {
  const isProduction = env && env.prod;
  const config = {
    entry: ['babel-polyfill', './src/index.js'],
    target: 'web',
    mode: isProduction ? 'production' : 'development',
    output: {
      path: __dirname,
      filename: './lib/index.js',
      libraryTarget: 'umd',
      library: 'ReactReduxLifecycle'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        }
      ]
    },
    node: {
      fs: 'empty',
      child_process: 'empty'
    },
    plugins: [
      new CleanWebpackPlugin(['lib']),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development')
        }
      })
    ]
  };

  if (isProduction) {
    config.plugins.push(new UglifyJSPlugin({
      parallel: true,
      sourceMap: true
    }));
  } else {
    config.devtool = 'source-map';
  }

  return config;
};
