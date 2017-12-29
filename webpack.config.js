import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtendedDefinePlugin from 'extended-define-webpack-plugin';
import S3Plugin from 'webpack-s3-plugin';
import path from 'path';

export default options => {
  const globals = {
    API_BASE: 'https://xodfzwfygj.execute-api.eu-west-1.amazonaws.com/dev'
  };

  if (options.release) {
    globals.API_BASE = 'https://api.monei.net';
  }

  const webpackConfig = {
    context: path.resolve(__dirname, 'src'),
    entry: {
      widget: './index.js'
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '/',
      filename: 'widget2.js',
      library: 'moneiWidget',
      libraryTarget: 'umd'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        hash: false,
        inject: 'head'
      }),
      new webpack.ProvidePlugin({
        h: ['preact', 'h']
      }),
      new ExtendedDefinePlugin(globals),
      new webpack.LoaderOptionsPlugin({
        options: {
          postcss: [
            require('postcss-cssnext')({
              browsers: ['last 2 versions', '> 5%']
            }),
            require('postcss-reporter')()
          ]
        }
      })
    ],
    module: {
      rules: [
        {
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            plugins: [
              [
                'transform-runtime',
                {
                  polyfill: false
                }
              ],
              'transform-class-properties',
              'transform-object-rest-spread',
              ['transform-react-jsx', {pragma: 'h'}]
            ],
            presets: [
              [
                'env',
                {
                  targets: {
                    browsers: ['last 2 versions']
                  },
                  modules: false,
                  loose: true
                }
              ]
            ]
          }
        },
        {
          test: /\.html$/,
          loader: 'html-loader'
        },
        {
          test: /\.scss/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              query: {
                modules: true,
                importLoaders: 1,
                localIdentName: 'wpwl-[path][name]-[local]'
              }
            },
            'postcss-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpg)$/,
          loader: 'url-loader',
          query: {
            limit: 100000
          }
        },
        {
          test: /\.svg(\?.*)?$/,
          loader: 'url-loader',
          query: {
            limit: 100000,
            mimetype: 'image/svg+xml'
          }
        }
      ]
    },
    resolve: {
      modules: ['./src', 'node_modules'],
      extensions: ['.js']
    },
    devServer: {
      port: process.env.PORT || 4000,
      host: 'localhost',
      disableHostCheck: true,
      publicPath: '/',
      contentBase: './src',
      historyApiFallback: true,
      open: true
    }
  };

  if (options.dev) {
    webpackConfig.devtool = 'cheap-module-eval-source-map';
  }

  if (options.prod) {
    webpackConfig.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': 'production'
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        cache: true,
        sourceMap: true
      })
    );
  }

  if (options.deploy) {
    const s3Config = {};
    if (options.deploy) {
      s3Config.s3Options = {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
        region: process.env.S3_REGION
      };
      s3Config.s3UploadOptions = {
        Bucket: process.env.S3_BUCKET_NAME
      };
      s3Config.cloudfrontInvalidateOptions = {
        DistributionId: process.env.CF_DISTRIBUTION_ID,
        Items: ['/*']
      };
    }
    webpackConfig.plugins.push(new S3Plugin(s3Config));
  }

  return webpackConfig;
};
