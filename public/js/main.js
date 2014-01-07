/*globals require: false*/
(function () {
    'use strict';
    require.config({
        paths: {
            'lib'             : '../lib',
            'angular'         : '../lib/angular.min',
            'primus'          : '../lib/primus',
            'dragster'        : '../lib/dragster'
        },
        shim: {
            'angular'         : { exports: 'angular' },
            'dragster'        : { exports: 'Dragster' }
        }
    });

    require(['game/start'], function (app) {
        app.bootstrap();
    });
}());