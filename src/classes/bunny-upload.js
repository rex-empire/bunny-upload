import superagent from 'superagent';
import fs from 'fs';
import path from 'path';
import PromisePool from 'es6-promise-pool';
import glob from 'glob';

export default class BunnyUpload {
	constructor(key, concurrency = 10, overwrite = false, storageZoneName = 'rex-cdn') {
		this.key = key;
		this.concurrency = concurrency;
		this.overwrite = overwrite;
		this.storageZoneName = storageZoneName;
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
	        .set('AccessKey', this.key)
	        .send(buffer);
	}

	async upload(localDir, file, cdnPath) {
	    let p = `${localDir}/${file}`;
	    let paths = file.split('/');
	    let fileName = paths.slice(-1)[0];
	    let subdirs = file.split('/').slice(0, paths.length - 1);
	    let subdir = subdirs.join('/');
	    let p2 = subdirs.length > 0 ? `${cdnPath}/${subdir}` : `${cdnPath}`;
	    let res;

	    try {
	        res = await this.get(this.storageZoneName, p2, fileName)
	        if(this.overwrite){
	        	console.log(`Uploading: ${p}`);
				var buffer = fs.readFileSync(p);
				try {
					res = await this.put(this.storageZoneName, p2, fileName, buffer);
					this.purge(res.request.url);
				} catch (e) {
					console.log('FAILED: ' + p);
					console.log(e);
				}
	        }else{
	        	console.log(`Skipping: ${p}`);
	        }
	    } catch (e) {
	        // Not found, upload
	        var buffer = fs.readFileSync(p);
	        console.log(`Uploading: ${p}`);
	        try {
	            res = await this.put(this.storageZoneName, p2, fileName, buffer);
				this.purge(res.request.url);
	        } catch (e) {
	            console.log('FAILED: ' + p);
	            console.log(e);
	        }
	    }
	    return true;
	}

	async purge(cdnUrl){
		console.log(`Purging file: ${cdnUrl}`);
		let res;
		try {
		    res = await this.purgeFile(cdnUrl);
        } catch (e) {
            console.log('FAILED: ' + p);
            console.log(e);
        }
	}

	purgeFile(cdnUrl){
		return superagent
		        .post("https://bunnycdn.com/api/purge")
		        .set('AccessKey', this.key)
		        .send({url: cdnUrl});
	}

	* generatePromises(toUpload, localDir, cdnPath){

		for (let file of toUpload) {
			yield this.upload(localDir, file, cdnPath);
		}

	}

	async s2(localDir, cdnPath, concurrency) {
	    let files = await this.getAll(localDir);
	    let toUpload = files.filter((f) => {
	        let p = `${localDir}/${f}`;
	        return !fs.lstatSync(p).isDirectory();
	    });

	    const promiseIterator = this.generatePromises(toUpload, localDir, cdnPath);

	    const pool = new PromisePool(promiseIterator, concurrency);

	    return pool.start()
	        .then(() => console.log('Complete'));

	}
}