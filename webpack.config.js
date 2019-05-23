const glob = require('glob')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const jsPath = path.join(__dirname, 'src', 'js')
const cssPath = path.join(__dirname, 'src', 'css')
const outPath = path.join(__dirname, 'dist')

module.exports = {
  stats: { children: false, modules: false },
  entry: {
    // webpack requires workarounds have entries be non-js files
    // so we'll just accept that webpack will create one here
    // and we'll clean it up after with clean-webpack-plugin
    '.placeholder-delete-css': glob.sync(cssPath+"/*.scss"),

    // materia.js present on every page on the server except inside widget iframe & error pages
    // contains common libs used by other scripts
    // contains everything needed by all pages that don't require a login
    'materia':[
      // polyfills
      "core-js/es6/array",
      "core-js/fn/array/includes",
      "core-js/es6/symbol",
      "core-js/es6/promise",
      "core-js/fn/object/assign",
      "core-js/fn/string/includes",
      "core-js/web/dom-collections",
      "whatwg-fetch",
      // end polyfills
      jsPath+'/materia-namespace.js',
      jsPath+'/materia/materia.coms.json.js',
      jsPath+'/materia/materia.flashcheck.js',
      jsPath+'/materia/materia.image.js',
      jsPath+'/materia/materia.page.default.js',
      jsPath+'/materia/materia.set.throbber.js',
      jsPath+'/materia/materia.store.slideshow.js',
      jsPath+'/materia/materia.user.js',
      jsPath+'/materia/materia.util.js',
      jsPath+'/materia/materia.validate.textfield.js',
      jsPath+'/materia-constants.js',
      jsPath+'/controllers/ctrl-alert.js',
      jsPath+'/controllers/ctrl-current-user.js',
      jsPath+'/controllers/ctrl-help.js',
      jsPath+'/controllers/ctrl-login.js',
      jsPath+'/controllers/ctrl-notification.js',
      jsPath+'/controllers/ctrl-spotlight.js',
      jsPath+'/controllers/ctrl-widget-catalog.js',
      jsPath+'/controllers/ctrl-widget-details.js',
      jsPath+'/services/srv-datetime.js',
      jsPath+'/services/srv-please.js',
      jsPath+'/services/srv-selectedwidget.js',
      jsPath+'/services/srv-user.js',
      jsPath+'/services/srv-widget.js',
      'ngmodal/dist/ng-modal.min.js'
    ],
    // student.js - all the stuff needed to be a student. play, view scores, profile
    'student': [
      jsPath+'/controllers/ctrl-player.js',
      jsPath+'/controllers/ctrl-profile.js',
      jsPath+'/controllers/ctrl-scores.js',
      jsPath+'/controllers/ctrl-settings.js',
      jsPath+'/directives/dir-beardable.js',
      jsPath+'/directives/dir-datatable.js',
      jsPath+'/directives/dir-date-validation.js',
      jsPath+'/directives/dir-fullscreen.js',
      jsPath+'/directives/dir-ngenter.js',
      jsPath+'/directives/dir-scoregraph.js',
      jsPath+'/directives/dir-scoretable.js',
      jsPath+'/materia/materia.scores.scoregraphics.js',
      jsPath+'/services/srv-api.js',
      jsPath+'/services/srv-scores.js',
    ],
    // author.js - all scripts for creating content: my widgets, widget authoring, lti picker
    'author': [
      jsPath+'/controllers/ctrl-collaboration.js',
      jsPath+'/controllers/ctrl-create.js',
      jsPath+'/controllers/ctrl-export-scores.js',
      jsPath+'/controllers/ctrl-lti.js',
      jsPath+'/controllers/ctrl-media-import.js',
      jsPath+'/controllers/ctrl-my-widgets.js',
      jsPath+'/controllers/ctrl-question-import.js',
      jsPath+'/controllers/ctrl-selectedwidget.js',
      jsPath+'/controllers/ctrl-widget-settings.js',
      jsPath+'/directives/dir-beardable.js',
      jsPath+'/directives/dir-datatable.js',
      jsPath+'/directives/dir-date-validation.js',
      jsPath+'/directives/dir-filedropper.js',
      jsPath+'/directives/dir-fileonchange.js',
      jsPath+'/directives/dir-ngenter.js',
      jsPath+'/directives/dir-scoredata.js',
      jsPath+'/directives/dir-scoregraph.js',
      jsPath+'/directives/dir-scoretable.js',
      jsPath+'/filters/filter-escape.js',
      jsPath+'/filters/filter-highlight.js',
      jsPath+'/filters/filter-multiword.js',
      jsPath+'/materia/materia.mywidgets.statistics.js',
      jsPath+'/services/srv-api.js',
      jsPath+'/services/srv-beard.js',
      jsPath+'/services/srv-scores.js',
    ],
    // only used on admin interface pages
    'admin':[
      jsPath+'/controllers/ctrl-admin-user.js',
      jsPath+'/controllers/ctrl-admin-widget.js',
      jsPath+'/services/srv-admin.js',
    ],
    'materia.creatorcore': [
      jsPath+'/materia-namespace.js',
      jsPath+'/materia/materia.creatorcore.js',
    ],
    'materia.enginecore': [
      jsPath+'/materia-namespace.js',
      jsPath+'/materia/materia.enginecore.js',
      jsPath+'/materia/materia.score.js',
      jsPath+'/materia/materia.storage.manager.js',
      jsPath+'/materia/materia.storage.table.js',
    ],
    'materia.scorecore': [
      jsPath+'/materia-namespace.js',
      jsPath+'/materia/materia.scorecore.js',
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['webpack-strip-block']
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  debug: true,
                  targets: {
                    browsers: [
                      ">0.25%",
                      "not ie 10",
                      "not op_mini all"
                    ]
                  },
                }
              ]
            ],
            plugins: [
              require('babel-plugin-angularjs-annotate'),]
          }
        }
      },
      // SASS files
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'css/[name].css'
            },
          },
          'extract-loader',
          'css-loader?url=false', // disable the css-loaders' function of locating image urls
          'sass-loader'
        ]
      }
    ]
  },
  output: {
    path: outPath,
    filename: 'js/[name].js'
  },
  plugins:[
    new CleanWebpackPlugin({
      // enable this to delete the placeholder webpack generates for css
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: ['js/.placeholder-delete-css.js']
    }),
  ],
  resolve: {
      alias: {
          // allow the code to require from node_modules
          'node_modules': path.join(__dirname, 'node_modules')
      }
  }
};
