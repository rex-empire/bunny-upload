const superagent = require('superagent');
var fs = require('fs');
var glob = require('glob');
var path = require("path");
var PromisePool = require('es6-promise-pool');

class BunnyUpload {
	constructor(key, concurrency, overwrite = false, storageZoneName = 'rex-cdn') {
		this.key = key;
		this.concurrency = concurrency;
		this.overwrite = overwrite;
	}

	getAll(cwd) {
	    return new Promise((res) => {
	        glob( `**/*`, {
	            cwd
	        }, (err, files) => {
	            res(files);
	        });
	    })
	}

	get(storageZoneName, p2, fileName) {
	    return superagent
	        .get(`https://la.storage.bunnycdn.com/${storageZoneName}/${p2}/${fileName}`)
	        .set('AccessKey', this.key);
	}

 	put(storageZoneName, p2, fileName, buffer) {
	    return superagent
	        .put(`https://la.storage.bunnycdn.com/${storageZoneName}/${p2}/${fileName}`)
	        .send(buffer)
	        .set('AccessKey', this.key);
	}

	async upload(localDir, file, cdnPath) {
	    let p = `${localDir}/${file}`;
	    let [subdir, fileName] = file.split('/');
	    let p2 = `${cdnPath}/${subdir}`;
	    let res;

	    try {
	        res = await this.get(this.storageZoneName, p2, fileName)
	        console.log(`Skipping: ${p}`);
	        if(res && this.overwrite){
	            res = await this.put(this.storageZoneName, p2, fileName, buffer);
	        }
	    } catch (e) {
	        // Not found, upload
	        var buffer = fs.readFileSync(p);
	        try {
	            res = await this.put(this.storageZoneName, p2, fileName, buffer);
	        } catch (e) {
	            console.log('FAILED: ' + p);
	            console.log(e);
	        }
	    }
	    return true;
	}

	async s2(localDir, cdnPath, concurrency) {
	    let files = await this.getAll(localDir);
	    let toUpload = files.filter((f) => {
	        let p = `${localDir}/${f}`;
	        return !fs.lstatSync(p).isDirectory();
	    });

	    console.log(toUpload);

	    const generatePromises = function * () {
	        for (let file of toUpload) {
	            yield this.upload(localDir, file, cdnPath);
	        }
	    }

	    const promiseIterator = generatePromises();
	    const pool = new PromisePool(promiseIterator, concurrency);

	    return pool.start()
	        .then(() => console.log('Complete'));

	}
}

export default async function bunnyUpload(key, localDir, cdnDir, concurrency, overwrite = false, storageZoneName = 'rex-cdn'){
	var bunny = new BunnyUpload(key, concurrency, overwrite);
	return bunny.s2(localDir, cdnPath, concurrency);
}

// s2('transcoded/tipsy', 'tipsy/transcoded');

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

