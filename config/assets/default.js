'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        'public/lib/toastr/toastr.min.css',
        'public/lib/angular-loading-bar/src/loading-bar.css',
        'public/lib/theme/css/theme.css',
        'public/lib/theme/css/revslider.css',
        'public/lib/theme/css/custom.css'
      ],
      js: [
        'public/lib/angular/angular.min.js',
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-file-upload/angular-file-upload.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/lodash/dist/lodash.min.js',
        'public/lib/angularjs-dropdown-multiselect/src/angularjs-dropdown-multiselect.js',
        'public/lib/underscore/underscore-min.js',
        'public/lib/toastr/toastr.min.js',
        'public/lib/angular-input-masks/angular-input-masks-standalone.min.js',
        'public/lib/angular-locale/angular-locale_pt-br.js',
        'public/lib/moment/moment.js',
        'public/lib/angular-loading-bar/src/loading-bar.js',
        'public/lib/theme/jquery-ui.min.js',
        'public/lib/theme/bootstrap.min.js',
        'public/lib/theme/modules.js',
        'public/lib/theme/theme.js',
        'public/lib/theme/jquery.themepunch.plugins.min.js',
        'public/lib/theme/jquery.themepunch.revolution.min.js',
        'public/lib/theme/jquery.flexslider-min.js',
        'public/lib/theme/jquery.isotope.min.js',
        'public/lib/theme/sorting.js',
        'public/lib/theme/slick.js',
        'public/lib/js-xlsx/dist/xlsx.core.min.js',
        'public/lib/Blob/Blob.js',
        'public/lib/file-saver.js/FileSaver.js',
        'public/lib/angular-sanitize/angular-sanitize.min.js',
        'public/lib/ng-csv/build/ng-csv.min.js'
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gruntConfig: 'gruntfile.js',
    gulpConfig: 'gulpfile.js',
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
};
