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
 		console.log(storageZoneName);
 		console.log(p2);
 		console.log(fileName);
 		console.log(buffer);
 		console.log(this.key);
	    return superagent
	        .put(`https://la.storage.bunnycdn.com/${storageZoneName}/${p2}/${fileName}`)
	        .set('AccessKey', this.key)
	        .send(buffer);
	}

	async upload(localDir, file, cdnPath) {
	    let p = `${localDir}/${file}`;
	    let [subdir, fileName] = file.split('/');
	    let p2 = `${cdnPath}/${subdir}`;
	    let res;

	    console.log("File:");
	    console.log(file);
	    console.log("Split:");
	    console.log(file.split('/'));
	    console.log("Subdir:");
	    console.log(subdir);
	    console.log("Filename:");
	    console.log(fileName);

	    try {
	        res = await this.get(this.storageZoneName, p2, fileName)
	        console.log(`Skipping: ${p}`);
	        if(res && this.overwrite){
				var buffer = fs.readFileSync(p);
				try {
					res = await this.put(this.storageZoneName, p2, fileName, buffer);
				} catch (e) {
					console.log('FAILED: ' + p);
					console.log(e);
				}
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

	    console.log(toUpload);

	    const promiseIterator = this.generatePromises(toUpload, localDir, cdnPath);

	    const pool = new PromisePool(promiseIterator, concurrency);

	    return pool.start()
	        .then(() => console.log('Complete'));

	}
}