import "core-js/stable";
import "regenerator-runtime/runtime";
import validate from 'validate.js';
import constraints from './validation/bunny-upload-param-constraints.js';
import BunnyUpload from './classes/bunny-upload.js';

export default async function bunnyUpload(options){

	//just a funciton wrapper
	validate(options, constraints);

	if(options.concurrency === undefined){
		options.concurrency = 10;
	}

	if(options.overwrite === undefined){
		options.overwrite = false;
	}

	if(options.overwrite === undefined){
		options.storageZoneName = 'rex-cdn'; //or better and env variable
	}

	if(options.onlyChanged === undefined){
		options.onlyChanged = false; // Uploads only new files to bunny when true
	}

	var bunny = new BunnyUpload(options.key, options.concurrency, options.overwrite, options.storageZoneName, options.onlyChanged);
	return await bunny.s2(options.localDir, options.cdnDir, options.concurrency);
}

export {BunnyUpload};
