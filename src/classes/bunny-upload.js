import superagent from 'superagent';
import fs from 'fs-extra';
import path from 'path';
import PromisePool from 'es6-promise-pool';
import glob from 'glob';
import mkdirp from 'mkdirp';

export default class BunnyUpload {
	constructor(key, concurrency = 10, overwrite = false, storageZoneName = 'rex-cdn', onlyChanged = false) {
		this.key = key;
		this.concurrency = concurrency;
		this.overwrite = overwrite;
		this.storageZoneName = storageZoneName;
		this.onlyChanged = onlyChanged;
	}

	getAll(cwd) {
		return new Promise((res) => {
			glob(`**/*`, {
				cwd
			}, (err, files) => {
				res(files);
			});
		})
	}
	async getAllFiles(cwd) {
		let files = await this.getAll(cwd);
		let toUpload = files.filter((f) => {
			let p = `${cwd}/${f}`;
			return !fs.lstatSync(p).isDirectory();
		});
		return toUpload;
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

	async readFileAndPut(p, p2, fileName, hasBackupFile) {
		let buffer = fs.readFileSync(p);
		if(hasBackupFile){
			let localDirBackupBuffer = fs.readFileSync(`.bunny-upload/${p}`);
			let notChanged = buffer.equals(localDirBackupBuffer); // Checks if the /dist file has the same contents as the backup
			if(notChanged != false){
				return;
			} else {
				console.log(`FILE CHANGE: ${fileName}`);
			}
		} else {
			console.log(`Uploading: ${p}`);
		}
		
		try {
			let res = await this.put(this.storageZoneName, p2, fileName, buffer);
			this.purge(res.request.url);
		} catch (e) {
			console.log('FAILED: ' + p);
			console.log(e);
		}
	}

	// hasBackupFile = true only if this.onlyChanged = true && file exists
	async upload(localDir, hasBackupFile, file, cdnPath) {
		let p = `${localDir}/${file}`;
		let paths = file.split('/');
		let fileName = paths.slice(-1)[0];
		let subdirs = file.split('/').slice(0, paths.length - 1);
		let subdir = subdirs.join('/');
		let p2 = subdirs.length > 0 ? `${cdnPath}/${subdir}` : `${cdnPath}`;
		let res;

		try {
			if (this.overwrite) {
				await this.readFileAndPut(p, p2, fileName, hasBackupFile);
			} else {
				// Moved this to avoid unnecessary API calls on overwrite = true
				res = await this.get(this.storageZoneName, p2, fileName);

				console.log(`Skipping: ${p}`);
			}
		} catch (e) {
			// Not found, upload
			await this.readFileAndPut(p, p2, fileName, hasBackupFile);
		}
		return true;
	}

	async purge(cdnUrl) {
		console.log(`Purging file: ${cdnUrl}`);
		let res;
		try {
			res = await this.purgeFile(cdnUrl);
		} catch (e) {
			console.log('FAILED: ' + p);
			console.log(e);
		}
	}

	purgeFile(cdnUrl) {

		//TODO: actually build this functionality out (cdn endpoint in by param)
		// https://la.storage.bunnycdn.com/rex-cdn
		// https://rexcdn.b-cdn.net
		cdnUrl = cdnUrl.replace(/la.storage.bunnycdn.com\/rex-cdn/gi, 'rexcdn.b-cdn.net')
		console.log(`Purging: ${cdnUrl}`);

		return superagent
			.post("https://bunnycdn.com/api/purge")
			.set('AccessKey', this.key)
			.send({ url: cdnUrl });
	}

	* generatePromises(toUpload, localDirBackupFiles, localDir, cdnPath) {
		for (let file of toUpload) {
			let hasBackupFile = false;
			if (localDirBackupFiles != false) {
				hasBackupFile = localDirBackupFiles.indexOf(file) != -1;
			}
			yield this.upload(localDir, hasBackupFile, file, cdnPath);
		}
	}

	storeLocalDirBackup(localDir) {
		try {
			const made = mkdirp.sync('.bunny-upload'); // Ensure the folder exists
			fs.emptyDirSync('.bunny-upload/dist'); // Delete the backup files
			fs.copySync(localDir, '.bunny-upload/dist', { overwrite: true }); // Create the backup
		} catch (err) {
			// If this ever fails it probably doesn't need fixing
			return err;
		}
		return true;
	}

	async s2(localDir, cdnPath, concurrency) {
		const toUpload = await this.getAllFiles(localDir);

		let localDirBackupFiles = false;
		if (this.onlyChanged === true) {
			localDirBackupFiles = await this.getAllFiles('.bunny-upload/dist');
		}

		const promiseIterator = this.generatePromises(toUpload, localDirBackupFiles, localDir, cdnPath);

		const pool = new PromisePool(promiseIterator, concurrency);

		return pool.start()
			.then(() => {
				console.log('Complete');

				// Create the .bunny-upload folder & move /dist into it
				if (this.onlyChanged === true) {
					const backupStatus = this.storeLocalDirBackup(localDir);
					if (backupStatus != true) {
						console.warn('The local dir backup ran into an issue:');
						console.error(backupStatus);
					}
				}
			});

	}
}