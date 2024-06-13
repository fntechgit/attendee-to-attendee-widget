const path                   = require('path');
const { merge }              = require('webpack-merge');
const common                 = require('./webpack.common.js');
const nodeExternals          = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin   = require("mini-css-extract-plugin");

module.exports = merge(common, {
    entry: {
        'index': './src/attendee-to-attendee-widget.js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: './[name].css',
        }),
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: 'attendee-to-attendee-widget',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        publicPath: '/dist/',
        globalObject: 'this'
    },
    mode: 'production',
    devtool: 'source-map',
    optimization: {
        minimize: false
    },
    externals: [nodeExternals({
        allowlist: ['react-transition-group']
    })]
});
