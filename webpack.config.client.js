/**
 * Created by lerayne on 07.01.17.
 */

const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const cssName = 'styles.css';
const jsName = 'client.js';

module.exports = function (env) {

    const PROD = env.mode === 'production'
    const DEV = env.mode === 'development'
    const HOT = env.hot !== undefined

    let publicPath = '/public/'
    if (HOT) { publicPath = '//localhost:8050/public/assets/'}

    const plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                BROWSER: JSON.stringify(true),
                HOT: JSON.stringify(HOT),
                NODE_ENV: JSON.stringify(env.mode || 'development')
            }
        }),

        new ExtractTextPlugin(cssName),

        new webpack.LoaderOptionsPlugin({
            debug: DEV,
            minimize: PROD
        }),

        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb|ru/)
    ]

    const babelOptions = {
        babelrc: false,
        presets: [
            [ "env", { modules: false } ],
            "react",
            "stage-0"
        ],
        plugins:[]
    }

    if (HOT) {
        babelOptions.plugins.push('react-hot-loader/babel')
    }

    if (PROD) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({
            mangle: true,
            comments: false
        }))

        plugins.push(new BundleAnalyzer({
            analyzerMode:'static',
            reportFilename: 'webpack-analysis.html',
            openAnalyzer: false
        }))

        babelOptions.presets.push('react-optimize')
    }

    return {
        entry: './src/client.jsx',

        resolve: {
            extensions: ['.js', '.jsx']
        },

        plugins,

        output: {
            path: `${__dirname}/public/`,
            filename: jsName,
            publicPath
        },

        module: {
            rules: [
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: {
                            loader: 'css-loader',
                            options: {
                                localIdentName: '[name]-[local]--[hash:base64:5]'
                            }
                        }
                    })
                },
                {
                    test: /\.gif$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'image/gif'
                        }
                    }
                },
                {
                    test: /\.(jpeg|jpg)$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'image/jpeg'
                        }
                    }
                },
                {
                    test: /\.png$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'image/png'
                        }
                    }
                },
                {
                    test: /\.svg$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'image/svg+xml'
                        }
                    }
                },
                {
                    test: /\.(woff|woff2|ttf|eot)$/,
                    use: {
                        loader: 'url-loader',
                        options: {limit: 1}
                    }
                },
                {
                    test: /\.(js|jsx)$/,
                    use: {loader:'babel-loader', options: babelOptions},
                    exclude: [/node_modules/, /public/]
                }
            ]
        },

        devtool: DEV ? 'inline-source-map' : false,

        devServer: {
            headers: {'Access-Control-Allow-Origin': '*'}
        }
    }
}