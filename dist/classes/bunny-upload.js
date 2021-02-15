"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _superagent = _interopRequireDefault(require("superagent"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

var _es6PromisePool = _interopRequireDefault(require("es6-promise-pool"));

var _glob = _interopRequireDefault(require("glob"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

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
    var onlyChanged = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    _classCallCheck(this, BunnyUpload);

    this.key = key;
    this.concurrency = concurrency;
    this.overwrite = overwrite;
    this.storageZoneName = storageZoneName;
    this.onlyChanged = onlyChanged;
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
    key: "getAllFiles",
    value: function () {
      var _getAllFiles = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(cwd) {
        var files, toUpload;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.getAll(cwd);

              case 2:
                files = _context.sent;
                toUpload = files.filter(function (f) {
                  var p = "".concat(cwd, "/").concat(f);
                  return !_fsExtra["default"].lstatSync(p).isDirectory();
                });
                return _context.abrupt("return", toUpload);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getAllFiles(_x) {
        return _getAllFiles.apply(this, arguments);
      }

      return getAllFiles;
    }()
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
    key: "readFileAndPut",
    value: function () {
      var _readFileAndPut = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(p, p2, fileName, hasBackupFile) {
        var buffer, localDirBackupBuffer, notChanged, res;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                buffer = _fsExtra["default"].readFileSync(p);

                if (!hasBackupFile) {
                  _context2.next = 11;
                  break;
                }

                localDirBackupBuffer = _fsExtra["default"].readFileSync(".bunny-upload/".concat(p));
                notChanged = buffer.equals(localDirBackupBuffer); // Checks if the /dist file has the same contents as the backup

                if (!(notChanged != false)) {
                  _context2.next = 8;
                  break;
                }

                return _context2.abrupt("return");

              case 8:
                console.log("FILE CHANGE: ".concat(fileName));

              case 9:
                _context2.next = 12;
                break;

              case 11:
                console.log("Uploading: ".concat(p));

              case 12:
                _context2.prev = 12;
                _context2.next = 15;
                return this.put(this.storageZoneName, p2, fileName, buffer);

              case 15:
                res = _context2.sent;
                this.purge(res.request.url);
                _context2.next = 23;
                break;

              case 19:
                _context2.prev = 19;
                _context2.t0 = _context2["catch"](12);
                console.log('FAILED: ' + p);
                console.log(_context2.t0);

              case 23:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[12, 19]]);
      }));

      function readFileAndPut(_x2, _x3, _x4, _x5) {
        return _readFileAndPut.apply(this, arguments);
      }

      return readFileAndPut;
    }() // hasBackupFile = true only if this.onlyChanged = true && file exists

  }, {
    key: "upload",
    value: function () {
      var _upload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(localDir, hasBackupFile, file, cdnPath) {
        var p, paths, fileName, subdirs, subdir, p2, res;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                p = "".concat(localDir, "/").concat(file);
                paths = file.split('/');
                fileName = paths.slice(-1)[0];
                subdirs = file.split('/').slice(0, paths.length - 1);
                subdir = subdirs.join('/');
                p2 = subdirs.length > 0 ? "".concat(cdnPath, "/").concat(subdir) : "".concat(cdnPath);
                _context3.prev = 6;

                if (!this.overwrite) {
                  _context3.next = 12;
                  break;
                }

                _context3.next = 10;
                return this.readFileAndPut(p, p2, fileName, hasBackupFile);

              case 10:
                _context3.next = 16;
                break;

              case 12:
                _context3.next = 14;
                return this.get(this.storageZoneName, p2, fileName);

              case 14:
                res = _context3.sent;
                console.log("Skipping: ".concat(p));

              case 16:
                _context3.next = 22;
                break;

              case 18:
                _context3.prev = 18;
                _context3.t0 = _context3["catch"](6);
                _context3.next = 22;
                return this.readFileAndPut(p, p2, fileName, hasBackupFile);

              case 22:
                return _context3.abrupt("return", true);

              case 23:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[6, 18]]);
      }));

      function upload(_x6, _x7, _x8, _x9) {
        return _upload.apply(this, arguments);
      }

      return upload;
    }()
  }, {
    key: "purge",
    value: function () {
      var _purge = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(cdnUrl) {
        var res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                console.log("Purging file: ".concat(cdnUrl));
                _context4.prev = 1;
                _context4.next = 4;
                return this.purgeFile(cdnUrl);

              case 4:
                res = _context4.sent;
                _context4.next = 11;
                break;

              case 7:
                _context4.prev = 7;
                _context4.t0 = _context4["catch"](1);
                console.log('FAILED: ' + p);
                console.log(_context4.t0);

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[1, 7]]);
      }));

      function purge(_x10) {
        return _purge.apply(this, arguments);
      }

      return purge;
    }()
  }, {
    key: "purgeFile",
    value: function purgeFile(cdnUrl) {
      //TODO: actually build this functionality out (cdn endpoint in by param)
      // https://la.storage.bunnycdn.com/rex-cdn
      // https://rexcdn.b-cdn.net
      cdnUrl = cdnUrl.replace(/la.storage.bunnycdn.com\/rex-cdn/gi, 'rexcdn.b-cdn.net');
      console.log("Purging: ".concat(cdnUrl));
      return _superagent["default"].post("https://bunnycdn.com/api/purge").set('AccessKey', this.key).send({
        url: cdnUrl
      });
    }
  }, {
    key: "generatePromises",
    value: /*#__PURE__*/regeneratorRuntime.mark(function generatePromises(toUpload, localDirBackupFiles, localDir, cdnPath) {
      var _iterator, _step, file, hasBackupFile;

      return regeneratorRuntime.wrap(function generatePromises$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _iterator = _createForOfIteratorHelper(toUpload);
              _context5.prev = 1;

              _iterator.s();

            case 3:
              if ((_step = _iterator.n()).done) {
                _context5.next = 11;
                break;
              }

              file = _step.value;
              hasBackupFile = false;

              if (localDirBackupFiles != false) {
                hasBackupFile = localDirBackupFiles.indexOf(file) != -1;
              }

              _context5.next = 9;
              return this.upload(localDir, hasBackupFile, file, cdnPath);

            case 9:
              _context5.next = 3;
              break;

            case 11:
              _context5.next = 16;
              break;

            case 13:
              _context5.prev = 13;
              _context5.t0 = _context5["catch"](1);

              _iterator.e(_context5.t0);

            case 16:
              _context5.prev = 16;

              _iterator.f();

              return _context5.finish(16);

            case 19:
            case "end":
              return _context5.stop();
          }
        }
      }, generatePromises, this, [[1, 13, 16, 19]]);
    })
  }, {
    key: "storeLocalDirBackup",
    value: function storeLocalDirBackup(localDir) {
      try {
        var made = _mkdirp["default"].sync('.bunny-upload'); // Ensure the folder exists


        _fsExtra["default"].emptyDirSync('.bunny-upload/dist'); // Delete the backup files


        _fsExtra["default"].copySync(localDir, '.bunny-upload/dist', {
          overwrite: true
        }); // Create the backup

      } catch (err) {
        // If this ever fails it probably doesn't need fixing
        return err;
      }

      return true;
    }
  }, {
    key: "s2",
    value: function () {
      var _s = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(localDir, cdnPath, concurrency) {
        var _this = this;

        var toUpload, localDirBackupFiles, promiseIterator, pool;
        return regeneratorRuntime.wrap(function _callee5$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.getAllFiles(localDir);

              case 2:
                toUpload = _context6.sent;
                localDirBackupFiles = false;

                if (!(this.onlyChanged === true)) {
                  _context6.next = 8;
                  break;
                }

                _context6.next = 7;
                return this.getAllFiles('.bunny-upload/dist');

              case 7:
                localDirBackupFiles = _context6.sent;

              case 8:
                promiseIterator = this.generatePromises(toUpload, localDirBackupFiles, localDir, cdnPath);
                pool = new _es6PromisePool["default"](promiseIterator, concurrency);
                return _context6.abrupt("return", pool.start().then(function () {
                  console.log('Complete'); // Create the .bunny-upload folder & move /dist into it

                  if (_this.onlyChanged === true) {
                    var backupStatus = _this.storeLocalDirBackup(localDir);

                    if (backupStatus != true) {
                      console.warn('The local dir backup ran into an issue:');
                      console.error(backupStatus);
                    }
                  }
                }));

              case 11:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee5, this);
      }));

      function s2(_x11, _x12, _x13) {
        return _s.apply(this, arguments);
      }

      return s2;
    }()
  }]);

  return BunnyUpload;
}();

exports["default"] = BunnyUpload;