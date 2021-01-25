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

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
      console.log(storageZoneName);
      console.log(p2);
      console.log(fileName);
      console.log(buffer);
      console.log(this.key);
      return _superagent["default"].put("https://la.storage.bunnycdn.com/".concat(storageZoneName, "/").concat(p2, "/").concat(fileName)).set('AccessKey', this.key).send(buffer);
    }
  }, {
    key: "upload",
    value: function () {
      var _upload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(localDir, file, cdnPath) {
        var p, _file$split, _file$split2, subdir, fileName, p2, res, buffer;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                p = "".concat(localDir, "/").concat(file);
                _file$split = file.split('/'), _file$split2 = _slicedToArray(_file$split, 2), subdir = _file$split2[0], fileName = _file$split2[1];
                p2 = "".concat(cdnPath, "/").concat(subdir);
                console.log("File:");
                console.log(file);
                console.log("Split:");
                console.log(file.split('/'));
                console.log("Subdir:");
                console.log(subdir);
                console.log("Filename:");
                console.log(fileName);
                _context.prev = 11;
                _context.next = 14;
                return this.get(this.storageZoneName, p2, fileName);

              case 14:
                res = _context.sent;
                console.log("Skipping: ".concat(p));

                if (!(res && this.overwrite)) {
                  _context.next = 28;
                  break;
                }

                buffer = _fs["default"].readFileSync(p);
                _context.prev = 18;
                _context.next = 21;
                return this.put(this.storageZoneName, p2, fileName, buffer);

              case 21:
                res = _context.sent;
                _context.next = 28;
                break;

              case 24:
                _context.prev = 24;
                _context.t0 = _context["catch"](18);
                console.log('FAILED: ' + p);
                console.log(_context.t0);

              case 28:
                _context.next = 43;
                break;

              case 30:
                _context.prev = 30;
                _context.t1 = _context["catch"](11);
                // Not found, upload
                buffer = _fs["default"].readFileSync(p);
                _context.prev = 33;
                _context.next = 36;
                return this.put(this.storageZoneName, p2, fileName, buffer);

              case 36:
                res = _context.sent;
                _context.next = 43;
                break;

              case 39:
                _context.prev = 39;
                _context.t2 = _context["catch"](33);
                console.log('FAILED: ' + p);
                console.log(_context.t2);

              case 43:
                return _context.abrupt("return", true);

              case 44:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[11, 30], [18, 24], [33, 39]]);
      }));

      function upload(_x, _x2, _x3) {
        return _upload.apply(this, arguments);
      }

      return upload;
    }()
  }, {
    key: "generatePromises",
    value: /*#__PURE__*/regeneratorRuntime.mark(function generatePromises(toUpload, localDir, cdnPath) {
      var _iterator, _step, file;

      return regeneratorRuntime.wrap(function generatePromises$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _iterator = _createForOfIteratorHelper(toUpload);
              _context2.prev = 1;

              _iterator.s();

            case 3:
              if ((_step = _iterator.n()).done) {
                _context2.next = 9;
                break;
              }

              file = _step.value;
              _context2.next = 7;
              return this.upload(localDir, file, cdnPath);

            case 7:
              _context2.next = 3;
              break;

            case 9:
              _context2.next = 14;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t0 = _context2["catch"](1);

              _iterator.e(_context2.t0);

            case 14:
              _context2.prev = 14;

              _iterator.f();

              return _context2.finish(14);

            case 17:
            case "end":
              return _context2.stop();
          }
        }
      }, generatePromises, this, [[1, 11, 14, 17]]);
    })
  }, {
    key: "s2",
    value: function () {
      var _s2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(localDir, cdnPath, concurrency) {
        var files, toUpload, promiseIterator, pool;
        return regeneratorRuntime.wrap(function _callee2$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.getAll(localDir);

              case 2:
                files = _context3.sent;
                toUpload = files.filter(function (f) {
                  var p = "".concat(localDir, "/").concat(f);
                  return !_fs["default"].lstatSync(p).isDirectory();
                });
                console.log(toUpload);
                promiseIterator = this.generatePromises(toUpload, localDir, cdnPath);
                pool = new _es6PromisePool["default"](promiseIterator, concurrency);
                return _context3.abrupt("return", pool.start().then(function () {
                  return console.log('Complete');
                }));

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee2, this);
      }));

      function s2(_x4, _x5, _x6) {
        return _s2.apply(this, arguments);
      }

      return s2;
    }()
  }]);

  return BunnyUpload;
}();

exports["default"] = BunnyUpload;