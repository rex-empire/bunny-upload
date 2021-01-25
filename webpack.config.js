 var path = require('path');
 var webpack = require('webpack');
 module.exports = {
 	entry: './src/example.js',
 	target: "node",
 	mode: "development",
 	output: {
 		path: path.resolve(__dirname, 'build'),
 		filename: 'app.js'
 	},
 	module: {
 		rules: [
 		{
 			test: /\.(js)$/,
 			exclude: /node_modules/,
 			use: ['babel-loader']
 		}
 		]
 	},
	plugins: [
		new webpack.DefinePlugin({ "global.GENTLY": false })
	],
 	stats: {
 		colors: true
 	}
}
