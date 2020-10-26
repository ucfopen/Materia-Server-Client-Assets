const glob = require('glob');
const path = require('path');
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const jsPath = path.join(__dirname, 'src', 'js')
const cssPath = path.join(__dirname, 'src', 'css')
const outPath = path.join(__dirname, 'dist')

const entry = {}
// Webpack Entry Point Registration Overview
// Create object with:
// Key = output name, Value = source sass file
// for every scss file in the cssPath directory
// EX: { 'css/<filename>.css' : './src/css/filename.scss', ...}

// SASS/CSS webpack entry point registration
glob.sync(path.join(cssPath, '*.scss')).forEach(file => {
	entry['css/'+path.basename(file, '.scss')] = file
})

// JS webpack entry point registration
// locates all `js/*.js` files
glob.sync(path.join(jsPath, '*.js')).map(file => {
	entry['js/'+path.basename(file)] = file
})

module.exports = {
	stats: {
		assetsSort: '!size',
		entrypoints: false,
		builtAt: false,
		children: false,
		modules: false
	},
	entry,
	module: {
		rules: [
			{
				test: /\.js$/,
				enforce: 'pre',
				use: [
					// Strips out code used for dev and testing.
					// Look for `develblock:start` comments.
					'webpack-strip-block'
				]
			},
			{
				test: /\.js$/,
				use: [
					'babel-loader' // configuration in .babelrc
				]
			},
			// SASS files
			{
				test: /\.scss$/,
						use: [
							MiniCssExtractPlugin.loader,
							{
								loader: 'css-loader',
								options: {
									url: false, // don't process css urls
								}
							},
							{
								loader: 'postcss-loader',
								options: {
									ident: 'postcss',
									plugins: [require('autoprefixer')]
								}
							},
							{
								loader: 'sass-loader'
							}
						]
			}
		]
	},
	output: {
		path: outPath,
		filename: '[name]'
	},
	plugins: [
		new CleanWebpackPlugin(), // clear the dist folder before build
		new MiniCssExtractPlugin({filename: '[name].css'}),
		new IgnoreEmitPlugin(/^(?!.*\.).*$/) // omit all files with no '.' in their name, webpack wasn't designed to have css entrypoints :/
	],
	resolve: {
			alias: {
					// allow the code to require from node_modules
					'node_modules': path.join(__dirname, 'node_modules')
			}
	}
}
