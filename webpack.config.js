const PnpWebpackPlugin = require('pnp-webpack-plugin');
const path = require('path');

module.exports = {
	mode: 'production',
	devtool: 'source-map',
	entry: {
		index: './src/index.ts'
	},
	target: 'node',
	output: {
		libraryTarget: 'commonjs2',
		path: path.resolve(__dirname, 'build'),
		filename: '[name].js',
	},
	externals: /^@babel\/runtime/,
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
		plugins: [
			PnpWebpackPlugin,
		],
	},
	resolveLoader: {
		plugins: [
			PnpWebpackPlugin.moduleLoader(module),
		],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx|ts|tsx)$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						configFile: path.resolve(__dirname, 'babel.config.json')
					}
				}
			}
		]
	},
	optimization: {
		minimize: false
	}
};