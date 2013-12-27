/*globals require: false*/
(function () {
    'use strict';
    require.config({
        paths: {
            'lib'             : '../lib',
            'angular'         : '../lib/angular.min',
            'primus'          : '../primus/primus'
        },
        shim: {
            'angular'         : { exports: 'angular' }
        }
    });

    require(['game/start'], function (app) {
        app.bootstrap();
    });
}());