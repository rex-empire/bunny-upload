"use strict";

var _bunnyUpload = _interopRequireDefault(require("bunny-upload"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var res = (0, _bunnyUpload["default"])({
  key: "4a15bce9-7e5d-4a92-ab57674d36f6-a966-46bc",
  localDir: '/Users/diegoponciano/Desktop/ryan/test-images',
  cdnDir: 'tipsy/transcoded',
  concurrency: 2,
  overwrite: false,
  storageZoneName: 'diego-test'
});