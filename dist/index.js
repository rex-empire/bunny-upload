"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = bunnyUpload;
Object.defineProperty(exports, "BunnyUpload", {
  enumerable: true,
  get: function get() {
    return _bunnyUpload2["default"];
  }
});

require("core-js/stable");

require("regenerator-runtime/runtime");

var _validate = _interopRequireDefault(require("validate.js"));

var _bunnyUploadParamConstraints = _interopRequireDefault(require("./validation/bunny-upload-param-constraints.js"));

var _bunnyUpload2 = _interopRequireDefault(require("./classes/bunny-upload.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function bunnyUpload(_x) {
  return _bunnyUpload.apply(this, arguments);
}

function _bunnyUpload() {
  _bunnyUpload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(options) {
    var bunny;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            //just a funciton wrapper
            (0, _validate["default"])(options, _bunnyUploadParamConstraints["default"]);

            if (options.concurrency === undefined) {
              options.concurrency = 10;
            }

            if (options.overwrite === undefined) {
              options.overwrite = false;
            }

            if (options.overwrite === undefined) {
              options.storageZoneName = 'rex-cdn'; //or better and env variable
            }

            bunny = new _bunnyUpload2["default"](options.key, options.concurrency, options.overwrite, options.storageZoneName);
            _context.next = 7;
            return bunny.s2(options.localDir, options.cdnDir, options.concurrency);

          case 7:
            return _context.abrupt("return", _context.sent);

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _bunnyUpload.apply(this, arguments);
}