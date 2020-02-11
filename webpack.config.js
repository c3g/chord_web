const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const BASE_PATH = process.env.CHORD_URL ? (new URL(process.env.CHORD_URL)).pathname : "/";

module.exports = {
    entry: ["babel-polyfill", path.resolve(__dirname, "./src/index.js")],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            },
            {
                test: /.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    resolve: {
        extensions: ["*", ".js", ".jsx"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        publicPath: BASE_PATH,
        filename: "bundle.js",
        chunkFilename: "[name].bundle.js"
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    plugins: [new HtmlWebpackPlugin({
        title: "CHORD",
        template: path.resolve(__dirname, "./src/template.html"),
        inlineSource: ".js$",
    }), new HtmlWebpackInlineSourcePlugin()]
};
