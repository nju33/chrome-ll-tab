import path from 'path';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';

export default {
  quiet: true,
  resolve: {
    root: [
      path.resolve('src')
    ],
    extensions: ['', '.webpack.js', '.web.js', '.react.js','.js']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel",
      },
    ]
  },
  plugins: [
    new ProgressBarPlugin()
  ]
};
