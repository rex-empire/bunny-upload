import "core-js/stable";
import "regenerator-runtime/runtime";
import validate from 'validate.js';
import constraints from './validation/bunny-upload-param-constraints.js';
import BunnyUpload from './classes/bunny-upload.js';

export default async function bunnyUpload(options){
	//just a function wrapper

	validate(options, constraints);

	if(options.concurrency === undefined){
		options.concurrency = 10;
	}

	if(options.overwrite === undefined){
		options.overwrite = false;
	}

	if(options.overwrite === undefined){
		options.storageZoneName = 'rex-cdn';
	}

	if(options.storageZoneUrl === undefined){
		options.storageZoneUrl = 'https://la.storage.bunnycdn.com';
	}

	if(options.purgeUrl === undefined){
		options.purgeUrl = 'https://rexcdn.b-cdn.net';
	}

	if(options.onlyChanged === undefined){
		options.onlyChanged = false; // Uploads only new files to bunny when true
	}

	var bunny = new BunnyUpload(
								options.key,
								options.apiKey,
								options.concurrency, 
								options.overwrite, 
								options.storageZoneName,
								options.storageZoneUrl,
								options.purgeUrl,
								options.onlyChanged
							);

	return await bunny.s2(options.localDir, options.cdnDir, options.concurrency);
}

export {BunnyUpload};
