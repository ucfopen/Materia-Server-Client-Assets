const glob = require('glob');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HashAssetsPlugin = require('hash-assets-webpack-plugin');

const jsPath = path.join(__dirname, 'src', 'js')
const cssPath = path.join(__dirname, 'src', 'css')
const outPath = path.join(__dirname, 'dist')

// sass hangs if you don't set this
// process.env.UV_THREADBOOL_SIZE = 100

// Create object with:
// Key = output name, Value = sass file
// for every scss file in the directory
// EX: { 'css/<filename>.css' : './src/css/filename.scss', ...}
let css = {}
glob.sync(path.join(cssPath, '*.scss')).forEach(function(file){
  css['css/'+path.basename(file, '.scss')+'.css'] = file
})

module.exports = {
  stats: {children: false}, // reduce noising webpack print output
  entry: Object.assign(css, {
    'js/student.js': [
      jsPath+'/ng-constants.coffee',
      jsPath+'/services/srv-user.coffee',
      jsPath+'/services/srv-api.coffee',
      jsPath+'/services/srv-datetime.coffee',
      jsPath+'/services/srv-widget.coffee',
      jsPath+'/services/srv-selectedwidget.coffee',
      jsPath+'/services/srv-scores.coffee',
      jsPath+'/controllers/ctrl-page.coffee',
      jsPath+'/controllers/ctrl-current-user.coffee',
      jsPath+'/controllers/ctrl-notification.coffee',
      jsPath+'/controllers/ctrl-login.coffee',
      jsPath+'/controllers/ctrl-profile.coffee',
      jsPath+'/controllers/ctrl-scores.coffee',
      jsPath+'/controllers/ctrl-settings.coffee',
      jsPath+'/controllers/ctrl-help.coffee',
      jsPath+'/controllers/ctrl-player.coffee',
      jsPath+'/directives/dir-beardable.coffee',
      jsPath+'/directives/dir-datatable.coffee',
      jsPath+'/directives/dir-date-validation.coffee',
      jsPath+'/directives/dir-fancybox.coffee',
      jsPath+'/directives/dir-ngenter.coffee',
      jsPath+'/directives/dir-scoredata.coffee',
      jsPath+'/directives/dir-scoregraph.coffee',
      jsPath+'/directives/dir-scoretable.coffee',
      jsPath+'/directives/dir-selecteddisplay.coffee',
      jsPath+'/directives/dir-sidebarselection.coffee',
    ],
    'js/author.js': [
      jsPath+'/filters/filter-escape.coffee',
      jsPath+'/filters/filter-highlight.coffee',
      jsPath+'/services/srv-api.coffee',
      jsPath+'/services/srv-beard.coffee',
      jsPath+'/services/srv-datetime.coffee',
      jsPath+'/services/srv-scores.coffee',
      jsPath+'/services/srv-selectedwidget.coffee',
      jsPath+'/services/srv-user.coffee',
      jsPath+'/services/srv-widget.coffee',
      jsPath+'/controllers/ctrl-page.coffee',
      jsPath+'/controllers/ctrl-current-user.coffee',
      jsPath+'/controllers/ctrl-notification.coffee',
      jsPath+'/controllers/ctrl-create.coffee',
      jsPath+'/controllers/ctrl-lti.coffee',
      jsPath+'/controllers/ctrl-media-import.coffee',
      jsPath+'/controllers/ctrl-my-widgets.coffee',
      jsPath+'/controllers/ctrl-question-import.coffee',
      jsPath+'/controllers/ctrl-spotlight.coffee',
      jsPath+'/controllers/ctrl-widget-catalog.coffee',
      jsPath+'/controllers/ctrl-widget-details.coffee',
      jsPath+'/controllers/ctrl-selectedwidget.coffee',
      jsPath+'/controllers/ctrl-widget-settings.coffee',
      jsPath+'/controllers/ctrl-export-scores.coffee',
      jsPath+'/controllers/ctrl-collaboration.coffee',
      jsPath+'/controllers/ctrl-sidebar.coffee',
      jsPath+'/controllers/ctrl-login.coffee',
      jsPath+'/directives/dir-beardable.coffee',
      jsPath+'/directives/dir-datatable.coffee',
      jsPath+'/directives/dir-date-validation.coffee',
      jsPath+'/directives/dir-fancybox.coffee',
      jsPath+'/directives/dir-ngenter.coffee',
      jsPath+'/directives/dir-scoredata.coffee',
      jsPath+'/directives/dir-scoregraph.coffee',
      jsPath+'/directives/dir-scoretable.coffee',
      jsPath+'/directives/dir-selecteddisplay.coffee',
      jsPath+'/directives/dir-sidebarselection.coffee',
    ],
    'js/materia.js':[
      jsPath+'/materia/materia-namespace.coffee',
      jsPath+'/materia/materia.coms.json.coffee',
      jsPath+'/materia/materia.creatorcore.coffee',
      jsPath+'/materia/materia.enginecore.coffee',
      jsPath+'/materia/materia.flashcheck.coffee',
      jsPath+'/materia/materia.image.coffee',
      jsPath+'/materia/materia.mywidgets.statistics.coffee',
      jsPath+'/materia/materia.mywidgets.tasks.coffee',
      jsPath+'/materia/materia.page.default.coffee',
      jsPath+'/materia/materia.score.coffee',
      jsPath+'/materia/materia.scores.scoregraphics.coffee',
      jsPath+'/materia/materia.set.throbber.coffee',
      jsPath+'/materia/materia.storage.manager.coffee',
      jsPath+'/materia/materia.storage.table.coffee',
      jsPath+'/materia/materia.store.slideshow.coffee',
      jsPath+'/materia/materia.user.coffee',
      jsPath+'/materia/materia.util.coffee',
      jsPath+'/materia/materia.validate.textfield.coffee',
      jsPath+'/controllers/ctrl-alert.coffee',
    ],
    'js/materia.coms.json.js': [
      jsPath+'/materia/materia.coms.json.coffee',
    ],
    'js/materia.namespace.js': [
      jsPath+'/materia/materia-namespace.coffee',
    ],
    'js/materia.creatorcore.js': [
      jsPath+'/materia/materia.creatorcore.coffee',
    ],
    'js/materia.enginecore.js': [
      jsPath+'/materia/materia.enginecore.coffee',
    ],
    'js/materia.score.js': [
      jsPath+'/materia/materia.score.coffee',
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
    path: outPath,
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
