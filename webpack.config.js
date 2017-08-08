const glob = require('glob');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HashAssetsPlugin = require('hash-assets-webpack-plugin');


// sass hangs if you don't set this
// process.env.UV_THREADBOOL_SIZE = 100

// Create object with:
// Key = output name, Value = sass file
// for every scss file in the directory
// EX: { 'css/<filename>.css' : './src/css/filename.scss', ...}
let css = {}
glob.sync('./src/css/*.scss').forEach(function(file){
  css['css/'+path.basename(file, '.scss')+'.css'] = file
})

module.exports = {
  stats: {children: false}, // reduce noising webpack print output
  entry: Object.assign(css, {
    'js/student.js': [
      './src/js/ng-constants.coffee',
      './src/js/services/srv-user.coffee',
      './src/js/services/srv-api.coffee',
      './src/js/services/srv-datetime.coffee',
      './src/js/services/srv-widget.coffee',
      './src/js/services/srv-selectedwidget.coffee',
      './src/js/services/srv-scores.coffee',
      './src/js/controllers/ctrl-page.coffee',
      './src/js/controllers/ctrl-current-user.coffee',
      './src/js/controllers/ctrl-notification.coffee',
      './src/js/controllers/ctrl-login.coffee',
      './src/js/controllers/ctrl-profile.coffee',
      './src/js/controllers/ctrl-scores.coffee',
      './src/js/controllers/ctrl-settings.coffee',
      './src/js/controllers/ctrl-help.coffee',
      './src/js/controllers/ctrl-player.coffee',
      './src/js/directives/dir-beardable.coffee',
      './src/js/directives/dir-datatable.coffee',
      './src/js/directives/dir-date-validation.coffee',
      './src/js/directives/dir-fancybox.coffee',
      './src/js/directives/dir-ngenter.coffee',
      './src/js/directives/dir-scoredata.coffee',
      './src/js/directives/dir-scoregraph.coffee',
      './src/js/directives/dir-scoretable.coffee',
      './src/js/directives/dir-selecteddisplay.coffee',
      './src/js/directives/dir-sidebarselection.coffee',
    ],
    'js/author.js': [
      './src/js/filters/filter-escape.coffee',
      './src/js/filters/filter-highlight.coffee',
      './src/js/services/srv-api.coffee',
      './src/js/services/srv-beard.coffee',
      './src/js/services/srv-datetime.coffee',
      './src/js/services/srv-scores.coffee',
      './src/js/services/srv-selectedwidget.coffee',
      './src/js/services/srv-user.coffee',
      './src/js/services/srv-widget.coffee',
      './src/js/controllers/ctrl-page.coffee',
      './src/js/controllers/ctrl-current-user.coffee',
      './src/js/controllers/ctrl-notification.coffee',
      './src/js/controllers/ctrl-create.coffee',
      './src/js/controllers/ctrl-lti.coffee',
      './src/js/controllers/ctrl-media-import.coffee',
      './src/js/controllers/ctrl-my-widgets.coffee',
      './src/js/controllers/ctrl-question-import.coffee',
      './src/js/controllers/ctrl-spotlight.coffee',
      './src/js/controllers/ctrl-widget-catalog.coffee',
      './src/js/controllers/ctrl-widget-details.coffee',
      './src/js/controllers/ctrl-selectedwidget.coffee',
      './src/js/controllers/ctrl-widget-settings.coffee',
      './src/js/controllers/ctrl-export-scores.coffee',
      './src/js/controllers/ctrl-collaboration.coffee',
      './src/js/controllers/ctrl-sidebar.coffee',
      './src/js/controllers/ctrl-login.coffee',
      './src/js/directives/dir-beardable.coffee',
      './src/js/directives/dir-datatable.coffee',
      './src/js/directives/dir-date-validation.coffee',
      './src/js/directives/dir-fancybox.coffee',
      './src/js/directives/dir-ngenter.coffee',
      './src/js/directives/dir-scoredata.coffee',
      './src/js/directives/dir-scoregraph.coffee',
      './src/js/directives/dir-scoretable.coffee',
      './src/js/directives/dir-selecteddisplay.coffee',
      './src/js/directives/dir-sidebarselection.coffee',
    ],
    'js/materia.js':[
      './src/js/materia/materia-namespace.coffee',
      './src/js/materia/materia.coms.json.coffee',
      './src/js/materia/materia.creatorcore.coffee',
      './src/js/materia/materia.enginecore.coffee',
      './src/js/materia/materia.flashcheck.coffee',
      './src/js/materia/materia.image.coffee',
      './src/js/materia/materia.mywidgets.statistics.coffee',
      './src/js/materia/materia.mywidgets.tasks.coffee',
      './src/js/materia/materia.page.default.coffee',
      './src/js/materia/materia.score.coffee',
      './src/js/materia/materia.scores.scoregraphics.coffee',
      './src/js/materia/materia.set.throbber.coffee',
      './src/js/materia/materia.storage.manager.coffee',
      './src/js/materia/materia.storage.table.coffee',
      './src/js/materia/materia.store.slideshow.coffee',
      './src/js/materia/materia.user.coffee',
      './src/js/materia/materia.util.coffee',
      './src/js/materia/materia.validate.textfield.coffee',
      './src/js/controllers/ctrl-alert.coffee',
    ],
    'js/admin.js':[
      './src/js/controllers/ctrl-admin-user.coffee',
      './src/js/controllers/ctrl-admin-widget.coffee',
      './src/js/materia/materia.coms.admin.coffee',
      './src/js/services/srv-admin.coffee',
    ],
    'js/materia.coms.json.js': [
      './src/js/materia/materia.coms.json.coffee',
    ],
    'js/materia.namespace.js': [
      './src/js/materia/materia-namespace.coffee',
    ],
    'js/materia.creatorcore.js': [
      './src/js/materia/materia.creatorcore.coffee',
    ],
    'js/materia.enginecore.js': [
      './src/js/materia/materia.enginecore.coffee',
    ],
    'js/materia.score.js': [
      './src/js/materia/materia.score.coffee',
    ],
  }),
  module: {
    rules: [
      {
        test: /\.coffee$/,
        use: [ 'ng-annotate-loader', 'coffee-loader' ]
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader?url=false', // disable the css-loaders' function of locating image urls
            'sass-loader'
          ]
        })
      }
    ]
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name]'
  },
  plugins: [
    new ExtractTextPlugin('[name]'), // pull the css out of webpack
    // Builds a json file with asset hashes for each js file
    new HashAssetsPlugin({
      filename: 'asset_hash.json',
      keyTemplate: '[name]',
      prettyPrint: true,
      path: './dist',

    }),
  ]
};
