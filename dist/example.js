"use strict";

var _index = _interopRequireDefault(require("./index.js"));

var _bunnyUpload = _interopRequireDefault(require("./classes/bunny-upload.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var res = (0, _index["default"])({
  key: "4a15bce9-7e5d-4a92-ab57674d36f6-a966-46bc",
  apiKey: "2c0c2705-5995-47b3-8246-5812aac2b28140a2e394-0629-42e9-9b9a-9d9ea9f21080",
  localDir: '/home/diego/Desktop/ryan/test-images',
  cdnDir: 'test-1',
  concurrency: 2,
  overwrite: true,
  storageZoneName: 'diego-test',
  storageZoneUrl: 'https://la.storage.bunnycdn.com',
  purgeUrl: 'https://poncianodiegotest.b-cdn.net',
  onlyChanged: true
}); //poncianodiegotest.b-cdn.net
// var bu = new BunnyUpload('4a15bce9-7e5d-4a92-ab57674d36f6-a966-46bc', '4a15bce9-7e5d-4a92-ab57674d36f6-a966-46bc', 'test-1');
// console.log();