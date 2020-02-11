const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

// noinspection JSUnresolvedVariable
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
        publicPath: "/",
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
        ...(process.env.NODE_ENV === "production" ? {inlineSource: ".js$"} : {}),
    }), new HtmlWebpackInlineSourcePlugin()]
};
