import bunnyUpload from './index.js';
import BunnyUpload from './classes/bunny-upload.js';

let res = bunnyUpload({
    key: "4a15bce9-7e5d-4a92-ab57674d36f6-a966-46bc",
    localDir: '/home/diego/Desktop/ryan/test-images',
    cdnDir: 'test-1',
    concurrency: 2,
    overwrite: true,
    storageZoneName: 'diego-test',
	onlyChanged: true
});


// var bu = new BunnyUpload();

// console.log();

