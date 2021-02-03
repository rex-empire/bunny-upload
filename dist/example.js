"use strict";

var _index = _interopRequireDefault(require("./index.js"));

var _bunnyUpload = _interopRequireDefault(require("./classes/bunny-upload.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var res = (0, _index["default"])({
  key: "4a15bce9-7e5d-4a92-ab57674d36f6-a966-46bc",
  localDir: '/home/diego/Desktop/ryan/test-images',
  cdnDir: 'test-1',
  concurrency: 2,
  overwrite: true,
  storageZoneName: 'diego-test'
}); // var bu = new BunnyUpload();
// console.log();