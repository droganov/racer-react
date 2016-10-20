"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (racerModel) {
  return function (cb) {
    racerModel.bundle(function (err, racerBundle) {
      cb(err, JSON.stringify(racerBundle));
    });
  };
};