const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
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
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
                exclude: /node_modules/,
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                    mangle: true,
                    output: {
                        ascii_only: true,
                        comments: false,
                    },

                },
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                include: path.resolve(__dirname, 'src'),
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            { test: /src[/\\]assets/, loader: 'arraybuffer-loader' },
            { test: /\.afm$/, loader: 'raw-loader' },
        ]
    },
    devServer: {
        static: path.join(__dirname, "dist"),
        compress: false,
        port: 9000,
        hot: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        new webpack.HotModuleReplacementPlugin({
            multiStep: true
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
        new CopyPlugin({
            patterns: [
                { from: "node_modules/easymde/dist/easymde.min.css", to: "easymde.min.css" },
                { from: "node_modules/vanilla-picker/dist/vanilla-picker.csp", to: "vanilla-picker.csp.css" },
            ],
        }),
    ]
};
