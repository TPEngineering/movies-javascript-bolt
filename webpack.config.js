/*  *Sigh* What the fuck is this Webpack bollocks? Apparently it combines all your modules and dependencies into a single .js
    Apparently it's a static module bundler for 'modern Javascript applications'
    This webpage goes through different bits: https://webpack.js.org/concepts/
    People only seem to hate it because it's slow; there appears to be a need for a bundler.
    The alternative to not using Webpack is to use <script> tags in a particular order. 
    It helps avoid circular dependencies. OK FINE!
*/ 

'use strict';

const Webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// This will be where webpack emits the bundles it creates (used in the next section)
const buildDirectory = path.join(__dirname, 'build');

// This is JS's way of exporting an object out of this module... This is used in every JS file.
module.exports = {
  
  // Webpack has a number of different options for 'mode' including 'production', 'development', or 'none' which enable different built-in webpack optimisations. 
  mode: 'development',
  
  // This tells Webpack that app.js is the entry point where it should start building the dependency graph.
  entry: {
    app: './src/app.js'
  },
  
  // This tells Webpack where to emit the bundles it creates and how to name these files.
  output: {
    filename: 'app.js',
    path: buildDirectory,
  },
  
  // No idea wtf these options are for.
  devtool: false,
  
  // When starting webpack in development mode, here is where the live app can be found (access via a browser):
  devServer: {
    static: buildDirectory,
    port: process.env.PORT || 8080
  },
  stats: {
    colors: true,
    reasons: true
  },

  /*  
      Plugins are the "backbone of WebPack."
      This section can be used to perform a wider range of tasks than 'module:' such as bundle optimisation, asset management and injection of environment variables.
      The environment variables are the main thing here, it seems.
  */
  plugins: [
    // This generates an HTML file for your application and automatically injects all your generated bundles into this file.
    new HtmlWebpackPlugin({template: 'src/assets/index.html'}),
    // This allows global constants to be configured at compile time, applied to process.env keys.
    new Webpack.EnvironmentPlugin({
      'NEO4J_URI': 'bolt://localhost:7687',
      'NEO4J_DATABASE': 'neo4j',
      'NEO4J_USER': 'neo4j',
      'NEO4J_PASSWORD': 'moviesmovies',
      'NEO4J_VERSION': ''
    })
  ],

  // Yeah, no fucking clue what this is, either.
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.js', '.jsx']
  },

  /* This 'module:' section allows Webpack to process other types of files and convert them into valid modules that can be consumed by the application and added to the dependency graph.
    The 'test' property identifies which file(s) should be transformed.
    The 'use' property indicates which loader should be used to do the transforming. There's a whole bunch of different loaders available. I count 17 from the documentation.
  */   
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|ico|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ]
  },
};

