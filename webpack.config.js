const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    mode: "development",
    resolve: {
        alias: {
            fs: "pdfkit/js/virtual-fs.js",
        },
        fallback: {
            zlib: require.resolve("browserify-zlib"),
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer/"),
        }
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            { test: /src[/\\]assets/, loader: 'arraybuffer-loader'},
            { test: /\.afm$/, loader: 'raw-loader'},
        ]
    },
    devServer: {
        static: path.join(__dirname, "dist"),
        compress: true,
        port: 9000,
        hot: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        new webpack.HotModuleReplacementPlugin(
            {
                multiStep: true
            }
        ),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]
};
