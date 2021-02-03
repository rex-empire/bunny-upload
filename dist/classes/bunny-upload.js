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
  function BunnyUpload(key) {
    var concurrency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
    var overwrite = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var storageZoneName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'rex-cdn';

    _classCallCheck(this, BunnyUpload);

    this.key = key;
    this.concurrency = concurrency;
    this.overwrite = overwrite;
    this.storageZoneName = storageZoneName;
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
      return _superagent["default"].get("https://la.storage.bunnycdn.com/".concat(storageZoneName, "/").concat(p2, "/").concat(fileName)).set('AccessKey', this.key);
    }
  }, {
    key: "put",
    value: function put(storageZoneName, p2, fileName, buffer) {
      return _superagent["default"].put("https://la.storage.bunnycdn.com/".concat(storageZoneName, "/").concat(p2, "/").concat(fileName)).set('AccessKey', this.key).send(buffer);
    }
  }, {
    key: "upload",
    value: function () {
      var _upload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(localDir, file, cdnPath) {
        var p, paths, fileName, subdirs, subdir, p2, res, buffer;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                p = "".concat(localDir, "/").concat(file);
                paths = file.split('/');
                fileName = paths.slice(-1)[0];
                subdirs = file.split('/').slice(0, paths.length - 1);
                subdir = subdirs.join('/');
                p2 = subdirs.length > 0 ? "".concat(cdnPath, "/").concat(subdir) : "".concat(cdnPath);
                _context.prev = 6;
                _context.next = 9;
                return this.get(this.storageZoneName, p2, fileName);

              case 9:
                res = _context.sent;

                if (!this.overwrite) {
                  _context.next = 26;
                  break;
                }

                console.log("Uploading: ".concat(p));
                buffer = _fs["default"].readFileSync(p);
                _context.prev = 13;
                _context.next = 16;
                return this.put(this.storageZoneName, p2, fileName, buffer);

              case 16:
                res = _context.sent;
                this.purge(res.request.url);
                _context.next = 24;
                break;

              case 20:
                _context.prev = 20;
                _context.t0 = _context["catch"](13);
                console.log('FAILED: ' + p);
                console.log(_context.t0);

              case 24:
                _context.next = 27;
                break;

              case 26:
                console.log("Skipping: ".concat(p));

              case 27:
                _context.next = 44;
                break;

              case 29:
                _context.prev = 29;
                _context.t1 = _context["catch"](6);
                // Not found, upload
                buffer = _fs["default"].readFileSync(p);
                console.log("Uploading: ".concat(p));
                _context.prev = 33;
                _context.next = 36;
                return this.put(this.storageZoneName, p2, fileName, buffer);

              case 36:
                res = _context.sent;
                this.purge(res.request.url);
                _context.next = 44;
                break;

              case 40:
                _context.prev = 40;
                _context.t2 = _context["catch"](33);
                console.log('FAILED: ' + p);
                console.log(_context.t2);

              case 44:
                return _context.abrupt("return", true);

              case 45:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[6, 29], [13, 20], [33, 40]]);
      }));

      function upload(_x, _x2, _x3) {
        return _upload.apply(this, arguments);
      }

      return upload;
    }()
  }, {
    key: "purge",
    value: function () {
      var _purge = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(cdnUrl) {
        var res;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log("Purging file: ".concat(cdnUrl));
                _context2.prev = 1;
                _context2.next = 4;
                return this.purgeFile(cdnUrl);

              case 4:
                res = _context2.sent;
                _context2.next = 11;
                break;

              case 7:
                _context2.prev = 7;
                _context2.t0 = _context2["catch"](1);
                console.log('FAILED: ' + p);
                console.log(_context2.t0);

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1, 7]]);
      }));

      function purge(_x4) {
        return _purge.apply(this, arguments);
      }

      return purge;
    }()
  }, {
    key: "purgeFile",
    value: function purgeFile(cdnUrl) {
      return _superagent["default"].post("https://bunnycdn.com/api/purge").set('AccessKey', this.key).send({
        url: cdnUrl
      });
    }
  }, {
    key: "generatePromises",
    value: /*#__PURE__*/regeneratorRuntime.mark(function generatePromises(toUpload, localDir, cdnPath) {
      var _iterator, _step, file;

      return regeneratorRuntime.wrap(function generatePromises$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _iterator = _createForOfIteratorHelper(toUpload);
              _context3.prev = 1;

              _iterator.s();

            case 3:
              if ((_step = _iterator.n()).done) {
                _context3.next = 9;
                break;
              }

              file = _step.value;
              _context3.next = 7;
              return this.upload(localDir, file, cdnPath);

            case 7:
              _context3.next = 3;
              break;

            case 9:
              _context3.next = 14;
              break;

            case 11:
              _context3.prev = 11;
              _context3.t0 = _context3["catch"](1);

              _iterator.e(_context3.t0);

            case 14:
              _context3.prev = 14;

              _iterator.f();

              return _context3.finish(14);

            case 17:
            case "end":
              return _context3.stop();
          }
        }
      }, generatePromises, this, [[1, 11, 14, 17]]);
    })
  }, {
    key: "s2",
    value: function () {
      var _s = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(localDir, cdnPath, concurrency) {
        var files, toUpload, promiseIterator, pool;
        return regeneratorRuntime.wrap(function _callee3$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.getAll(localDir);

              case 2:
                files = _context4.sent;
                toUpload = files.filter(function (f) {
                  var p = "".concat(localDir, "/").concat(f);
                  return !_fs["default"].lstatSync(p).isDirectory();
                });
                promiseIterator = this.generatePromises(toUpload, localDir, cdnPath);
                pool = new _es6PromisePool["default"](promiseIterator, concurrency);
                return _context4.abrupt("return", pool.start().then(function () {
                  return console.log('Complete');
                }));

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee3, this);
      }));

      function s2(_x5, _x6, _x7) {
        return _s.apply(this, arguments);
      }

      return s2;
    }()
  }]);

  return BunnyUpload;
}();

exports["default"] = BunnyUpload;