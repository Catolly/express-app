const OUTPUT_PATH = __dirname + '/client/build'
const CLIENT_PATH = __dirname + '/client'

module.exports = {
	mode: 'development',
	entry: {
		js: CLIENT_PATH + '/js/app.js',
	},
	devtool: 'inline-source-map',
	module: {
		rules: [
			{ test: /\.(js)$/, use: 'babel-loader'},
		]
	},
	output: {
		path: OUTPUT_PATH,
		filename: '[name].bundle.js'
	}
}