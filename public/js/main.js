/*globals require: false*/
(function () {
    'use strict';
    require.config({
        paths: {
            'lib'             : '../lib',
            'primus'          : '../primus/primus'
        }
    });

    require(['game/start'], function (app) {
        console.log('In main.');
        app.bootstrap();
    });
}());