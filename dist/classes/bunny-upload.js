"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _superagent = _interopRequireDefault(require("superagent"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _es6PromisePool = _interopRequireDefault(require("es6-promise-pool"));

var _glob = _interopRequireDefault(require("glob"));

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var BunnyUpload = /*#__PURE__*/function () {
  function BunnyUpload(key, apiKey) {
    var concurrency = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
    var overwrite = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var storageZoneName = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'rex-cdn';
    var storageZoneUrl = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'https://la.storage.bunnycdn.com';
    var purgeUrl = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'https://rexcdn.b-cdn.net';

    _classCallCheck(this, BunnyUpload);

    this.key = key;
    this.apiKey = apiKey;
    this.concurrency = concurrency;
    this.overwrite = overwrite;
    this.storageZoneName = storageZoneName;
    this.storageZoneUrl = storageZoneUrl;
    this.purgeUrl = purgeUrl;
  }

  _createClass(BunnyUpload, [{
    key: "getAll",
    value: function getAll(cwd) {
      return new Promise(function (res) {
        (0, _glob["default"])("**/*", {
          cwd: cwd
        }, function (err, files) {
          res(files);
        });
      });
    }
  }, {
    key: "get",
    value: function get(storageZoneName, p2, fileName) {
      return _superagent["default"].get("".concat(this.storageZoneUrl, "/").concat(storageZoneName, "/").concat(p2, "/").concat(fileName)).set('AccessKey', this.key);
    }
  }, {
    key: "put",
    value: function put(storageZoneName, p2, fileName, buffer) {
      return _superagent["default"].put("".concat(this.storageZoneUrl, "/").concat(storageZoneName, "/").concat(p2, "/").concat(fileName)).set('AccessKey', this.key).send(buffer);
    }
  }, {
    key: "performUpload",
    value: function () {
      var _performUpload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(p2, fileName, p) {
        var buffer;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log(_chalk["default"].blue("UPLOADING: ".concat(p)));
                _context.prev = 1;
                buffer = _fs["default"].readFileSync(p);
                _context.next = 5;
                return this.put(this.storageZoneName, p2, fileName, buffer);

              case 5:
                console.log(_chalk["default"].blue("UPLOADED SUCCESSFULLY: ".concat(p)));
                _context.next = 8;
                return this.purge("".concat(this.purgeUrl, "/").concat(p2, "/").concat(fileName));

              case 8:
                _context.next = 14;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](1);
                console.log(_chalk["default"].red('FAILED UPLOADING:' + p));
                console.log(_chalk["default"].red(_context.t0.message));

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 10]]);
      }));

      function performUpload(_x, _x2, _x3) {
        return _performUpload.apply(this, arguments);
      }

      return performUpload;
    }()
  }, {
    key: "upload",
    value: function () {
      var _upload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(localDir, file, cdnPath) {
        var p, paths, fileName, subdirs, subdir, p2, res;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                p = "".concat(localDir, "/").concat(file);
                paths = file.split('/');
                fileName = paths.slice(-1)[0];
                subdirs = file.split('/').slice(0, paths.length - 1);
                subdir = subdirs.join('/');
                p2 = subdirs.length > 0 ? "".concat(cdnPath, "/").concat(subdir) : "".concat(cdnPath);
                _context2.prev = 6;
                _context2.next = 9;
                return this.get(this.storageZoneName, p2, fileName);

              case 9:
                res = _context2.sent;

                if (!this.overwrite) {
                  _context2.next = 15;
                  break;
                }

                _context2.next = 13;
                return this.performUpload(p2, fileName, p);

              case 13:
                _context2.next = 16;
                break;

              case 15:
                console.log(_chalk["default"].red("SKIPPING: ".concat(p)));

              case 16:
                _context2.next = 22;
                break;

              case 18:
                _context2.prev = 18;
                _context2.t0 = _context2["catch"](6);
                _context2.next = 22;
                return this.performUpload(p2, fileName, p);

              case 22:
                return _context2.abrupt("return", true);

              case 23:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[6, 18]]);
      }));

      function upload(_x4, _x5, _x6) {
        return _upload.apply(this, arguments);
      }

      return upload;
    }()
  }, {
    key: "purge",
    value: function () {
      var _purge = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(cdnUrl) {
        var res;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // console.log(p2);
                console.log(_chalk["default"].green("PURGING FILE AT: ".concat(cdnUrl)));
                _context3.prev = 1;
                _context3.next = 4;
                return this.performPurge(cdnUrl);

              case 4:
                res = _context3.sent;
                console.log(_chalk["default"].green("PURGED SUCCESSFULLY: ".concat(cdnUrl)));
                _context3.next = 12;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](1);
                console.log(_chalk["default"].red('FAILED PURGING:' + cdnUrl));
                console.log(_chalk["default"].red(_context3.t0.message));

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[1, 8]]);
      }));

      function purge(_x7) {
        return _purge.apply(this, arguments);
      }

      return purge;
    }()
  }, {
    key: "performPurge",
    value: function performPurge(cdnUrl) {
      return _superagent["default"].post("https://bunnycdn.com/api/purge").set('AccessKey', this.apiKey).query({
        url: cdnUrl
      });
    }
  }, {
    key: "generatePromises",
    value: /*#__PURE__*/regeneratorRuntime.mark(function generatePromises(toUpload, localDir, cdnPath) {
      var _iterator, _step, file;

      return regeneratorRuntime.wrap(function generatePromises$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _iterator = _createForOfIteratorHelper(toUpload);
              _context4.prev = 1;

              _iterator.s();

            case 3:
              if ((_step = _iterator.n()).done) {
                _context4.next = 9;
                break;
              }

              file = _step.value;
              _context4.next = 7;
              return this.upload(localDir, file, cdnPath);

            case 7:
              _context4.next = 3;
              break;

            case 9:
              _context4.next = 14;
              break;

            case 11:
              _context4.prev = 11;
              _context4.t0 = _context4["catch"](1);

              _iterator.e(_context4.t0);

            case 14:
              _context4.prev = 14;

              _iterator.f();

              return _context4.finish(14);

            case 17:
            case "end":
              return _context4.stop();
          }
        }
      }, generatePromises, this, [[1, 11, 14, 17]]);
    })
  }, {
    key: "s2",
    value: function () {
      var _s = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(localDir, cdnPath, concurrency) {
        var files, toUpload, promiseIterator, pool;
        return regeneratorRuntime.wrap(function _callee4$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.getAll(localDir);

              case 2:
                files = _context5.sent;
                toUpload = files.filter(function (f) {
                  var p = "".concat(localDir, "/").concat(f);
                  return !_fs["default"].lstatSync(p).isDirectory();
                });
                promiseIterator = this.generatePromises(toUpload, localDir, cdnPath);
                pool = new _es6PromisePool["default"](promiseIterator, concurrency);
                return _context5.abrupt("return", pool.start().then(function () {
                  return console.log(_chalk["default"].green('FINISHED UPLOADING JOBS'));
                }));

              case 7:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee4, this);
      }));

      function s2(_x8, _x9, _x10) {
        return _s.apply(this, arguments);
      }

      return s2;
    }()
  }]);

  return BunnyUpload;
}();

exports["default"] = BunnyUpload;