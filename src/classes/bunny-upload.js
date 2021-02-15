import superagent from 'superagent';
import fs from 'fs';
import path from 'path';
import PromisePool from 'es6-promise-pool';
import glob from 'glob';
import chalk from 'chalk';

export default class BunnyUpload {
	constructor(key, apiKey, concurrency = 10, overwrite = false, 
		storageZoneName = 'rex-cdn', storageZoneUrl = 'https://la.storage.bunnycdn.com', 
		purgeUrl = 'https://rexcdn.b-cdn.net') {
		this.key = key;
		this.apiKey = apiKey;
		this.concurrency = concurrency;
		this.overwrite = overwrite;
		this.storageZoneName = storageZoneName;
		this.storageZoneUrl = storageZoneUrl;
		this.purgeUrl = purgeUrl;
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
	        .get(`${this.storageZoneUrl}/${storageZoneName}/${p2}/${fileName}`)
	        .set('AccessKey', this.key);
	}

 	put(storageZoneName, p2, fileName, buffer) {
	    return superagent
	        .put(`${this.storageZoneUrl}/${storageZoneName}/${p2}/${fileName}`)
	        .set('AccessKey', this.key)
	        .send(buffer);
	}

	async performUpload(p2, fileName, p){
		console.log(chalk.blue(`UPLOADING: ${p}`));
		try {
			var buffer = fs.readFileSync(p);
			await this.put(this.storageZoneName, p2, fileName, buffer);
			console.log(chalk.blue(`UPLOADED SUCCESSFULLY: ${p}`));
			await this.purge(`${this.purgeUrl}/${p2}/${fileName}`);
		} catch (e) {
			console.log(chalk.red('FAILED UPLOADING:'+ p));
			console.log(chalk.red(e.message));
		}
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
				await this.performUpload(p2, fileName, p);
	        }else{
	        	console.log(chalk.red(`SKIPPING: ${p}`));
	        }
	    } catch (e) {
	        // Not found, upload
			await this.performUpload(p2, fileName, p);
	    }
	    return true;
	}

	async purge(cdnUrl){
		// console.log(p2);
		console.log(chalk.green(`PURGING FILE AT: ${cdnUrl}`));
		try {
		    var res = await this.performPurge(cdnUrl);
		    console.log(chalk.green(`PURGED SUCCESSFULLY: ${cdnUrl}`));
        } catch (e) {
            console.log(chalk.red('FAILED PURGING:'+ cdnUrl));
            console.log(chalk.red(e.message));
        }
	}

	performPurge(cdnUrl){
		//TODO: actually build this functionality out (cdn endpoint in by param)
		return superagent
		        .post("https://bunnycdn.com/api/purge")
		        .set('AccessKey', this.apiKey)
		        .query({url: cdnUrl});
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
	        .then(() => console.log(chalk.green('FINISHED UPLOADING JOBS')));

	}
}