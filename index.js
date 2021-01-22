const superagent = require('superagent');
var fs = require('fs');
var glob = require('glob');
var path = require("path");
var PromisePool = require('es6-promise-pool')

let storageZoneName = 'rex-cdn';

function get(storageZoneName, p2, fileName) {
    return superagent
        .get(`https://la.storage.bunnycdn.com/${storageZoneName}/${p2}/${fileName}`)
        .set('AccessKey', process.env.BUNNY_KEY);
}

function put(storageZoneName, p2, fileName, buffer) {
    return superagent
        .put(`https://la.storage.bunnycdn.com/${storageZoneName}/${p2}/${fileName}`)
        .send(buffer)
        .set('AccessKey', process.env.BUNNY_KEY);
}

async function upload(localDir, file, cdnPath) {
    let p = `${localDir}/${file}`;
    let [subdir, fileName] = file.split('/');
    let p2 = `${cdnPath}/${subdir}`;
    let res;

    try {
        res = await get(storageZoneName, p2, fileName)
        console.log(`Skipping: ${p}`);
    } catch (e) {
        // Not found, upload
        var buffer = fs.readFileSync(p);
        try {
            res = await put(storageZoneName, p2, fileName, buffer)
            console.log(' ');
            console.log(p);
            console.log(res.body);
        } catch (e) {
            console.log('FAILED: ' + p);
            console.log(e);
        }
    }
    return true;
}

function getAll(cwd) {
    return new Promise((res) => {
        glob( `**/*`, {
            cwd
            // cwd: '/Users/ryan/rex-empire/bunny/trancoded/'
        }, (err, files) => {
            res(files);
        });
    })
}

async function s2(localDir, cdnPath) {
    let files = await getAll(localDir);
    let toUpload = files.filter((f) => {
        let p = `${localDir}/${f}`;
        return !fs.lstatSync(p).isDirectory();
    });

    console.log(toUpload);

    const generatePromises = function * () {
        for (let file of toUpload) {
            yield upload(localDir, file, cdnPath);
        }
    }

    const promiseIterator = generatePromises()
    const pool = new PromisePool(promiseIterator, 20)

    pool.start()
        .then(() => console.log('Complete'))

}
s2('transcoded/tipsy', 'tipsy/transcoded');

//
// const bunnyUpload = require('bunny-upload');
//
// let res = await bunnyUpload({
//     key: process.env.BUNNY_KEY,
//     localDir: 'transcoded/tipsy',
//     cdnDir: 'tipsy/transcoded',
//     concurrency: 10,
//     overwrite: true
// })