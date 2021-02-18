import superagent from 'superagent';
import fs from 'fs-extra';
import path from 'path';
import PromisePool from 'es6-promise-pool';
import glob from 'glob';
import chalk from 'chalk';
import mkdirp from 'mkdirp';

export default class BunnyUpload {
	constructor(key, apiKey, concurrency = 10, overwrite = false,
		storageZoneName = 'rex-cdn', storageZoneUrl = 'https://la.storage.bunnycdn.com',
		purgeUrl = 'https://rexcdn.b-cdn.net',
		onlyChanged = false) {
		this.key = key;
		this.apiKey = apiKey;
		this.concurrency = concurrency;
		this.overwrite = overwrite;
		this.storageZoneName = storageZoneName;
		this.storageZoneUrl = storageZoneUrl;
		this.purgeUrl = purgeUrl;
		this.onlyChanged = onlyChanged;

		this.purgeFiles = [];
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
			.get(`${this.storageZoneUrl}/${storageZoneName}/${p2}/${fileName}`)
			.set('AccessKey', this.key);
	}

	put(storageZoneName, p2, fileName, buffer) {
		return superagent
			.put(`${this.storageZoneUrl}/${storageZoneName}/${p2}/${fileName}`)
			.set('AccessKey', this.key)
			.send(buffer);
	}

	async performUpload(p2, fileName, p, hasBackupFile) {
		console.log(chalk.blue(`UPLOADING: ${p}`));
		try {
			let buffer = fs.readFileSync(p);

			// Check if current file matches backup file
			if (hasBackupFile) {
				let localDirBackupBuffer = fs.readFileSync(`.bunny-upload/backup/${p}`);
				let notChanged = buffer.equals(localDirBackupBuffer); // Checks if the /dist file has the same contents as the backup
				if (notChanged != false) {
					return;
				} else {
					console.log(`FILE CHANGE: ${fileName}`);
				}
			} else {
				console.log(`Uploading: ${p}`);
			}

			await this.put(this.storageZoneName, p2, fileName, buffer);
			console.log(chalk.blue(`UPLOADED SUCCESSFULLY: ${p}`));
			this.purgeFiles.push(`${this.purgeUrl}/${p2}/${fileName}`);
		} catch (e) {
			console.log(chalk.red('FAILED UPLOADING:' + p));
			console.log(chalk.red(e.message));
		}
	}

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
				await this.performUpload(p2, fileName, p, hasBackupFile);
			} else {
				// Not necessary on overwrite
				res = await this.get(this.storageZoneName, p2, fileName);
				console.log(chalk.red(`SKIPPING: ${p}`));
			}
		} catch (e) {
			// Not found, upload
			await this.performUpload(p2, fileName, p, hasBackupFile);
		}
		return true;
	}

	async purge(cdnUrl) {
		// console.log(p2);
		console.log(chalk.green(`PURGING FILE AT: ${cdnUrl}`));
		try {
			var res = await this.performPurge(cdnUrl);
			console.log(chalk.green(`PURGED SUCCESSFULLY: ${cdnUrl}`));
		} catch (e) {
			console.log(chalk.red('FAILED PURGING:' + cdnUrl));
			console.log(chalk.red(e.message));
		}
	}

	performPurge(cdnUrl) {
		//TODO: actually build this functionality out (cdn endpoint in by param)
		return superagent
			.post("https://bunnycdn.com/api/purge")
			.set('AccessKey', this.apiKey)
			.query({ url: cdnUrl });
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
			fs.emptyDirSync(`.bunny-upload/backup/${localDir}`); // Delete the backup files
			fs.copySync(localDir, `.bunny-upload/backup/${localDir}`, { overwrite: true }); // Create the backup
		} catch (err) {
			// If this ever fails it probably doesn't need fixing
			return err;
		}
		return true;
	}

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async executePurgeRequests() {
		console.log(chalk.yellow(`Waiting 10 seconds before purging uploads...`));
		await this.sleep(5000);
		console.log(chalk.yellow(`Waiting 5 seconds before purging uploads...`));
		await this.sleep(5000);
		console.log(chalk.blue(`Executing Purge Requests`));
		const purgeFiles = this.purgeFiles;
		for (let fileName of purgeFiles) {
			await this.purge(fileName);
		}
	}

	async s2(localDir, cdnPath, concurrency) {
		const toUpload = await this.getAllFiles(localDir);

		let localDirBackupFiles = false;
		if (this.onlyChanged === true) {
			localDirBackupFiles = await this.getAllFiles(`.bunny-upload/backup/${localDir}`);
		}

		const promiseIterator = this.generatePromises(toUpload, localDirBackupFiles, localDir, cdnPath);

		const pool = new PromisePool(promiseIterator, concurrency);

		return pool.start()
			.then(async () => {
				console.log(chalk.green('FINISHED UPLOADING JOBS'));

				await this.executePurgeRequests();

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