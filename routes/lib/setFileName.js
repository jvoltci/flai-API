const setFileName = () => {
	if(extension === ".mp4") {
		contentType = 'video/mp4';
		file = "Ergo";
	}
	else if(extension === ".mp3") {
		contentType = 'audio/mp3';
		file = "Sonorous";
	}
	else if(extension === ".mkv") {
		contentType = 'video/webm';
		file = "Limerence";
	}
	else {
		contentType = 'application/zip';
		file = "Paradox";
	}
}

module.exports.setFileName = setFileName;