define([
    'controller/game',
    'controller/chat',
    'controller/board',
    'controller/player',
    'controller/info'
  ],
  function () {
  'use strict';

  var ctrls = Array.prototype.slice.call(arguments);

  var controllerLoader = function (app) {
    var cIndex = 0;
    if (!app.controller || typeof app.controller !== 'function') {
      throw new Error('app needs to have a function called controller');
    }
    for (; cIndex < ctrls.length; cIndex += 1) {
      if (ctrls[cIndex]) {
        app.controller(ctrls[cIndex].ctrlName, ctrls[cIndex]);
      }
    }
  };

  return controllerLoader;
});