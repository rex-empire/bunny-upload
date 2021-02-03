import bunnyUpload from './index.js';

let res = bunnyUpload({
    key: "4a15bce9-7e5d-4a92-ab57674d36f6-a966-46bc",
    localDir: '/Users/diegoponciano/Desktop/ryan/test-images',
    cdnDir: 'tipsy/transcoded',
    concurrency: 2,
    overwrite: false,
    storageZoneName: 'diego-test'
});



