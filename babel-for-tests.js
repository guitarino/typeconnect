let config = require('./babel.config.json');

require("@babel/register")({
	...config,
	babelrc: false,
	extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
});