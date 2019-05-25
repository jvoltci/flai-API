const http = require('http');
const https = require('https');
 
//const { setFileName } = require('./lib/setFileName');
 
const handleLinks = (req, res, db) => {
 
    let fetchedLink = req.params.id;
    if(fetchedLink.length < 10) res.redirect('https://flai.ml');
    db('flai').where('link', '=', fetchedLink)
    .then(data => {
        if(data[0]) {
            url = data[0].url;
            return '';
        }
        else
            return url = '';
    })
    .then(() => {
        if(url) {
        	let cd = '', ct = '';
            if(url[4] !== 's') {
                try {
                    const request = http.get(url, (response) => {
                    	if(response.headers['content-disposition']) {
                    		cd = response.headers['content-disposition'];
                    	}
                    	else {
                            cd = "attachment;filename=flai[Changed Extension].zip";
                        }
                        if(response.headers['content-type']) {
                            ct = response.headers['content-type'];
                        }
                        else {
                            ct = 'application/octet-stream';
                        }
                        res.writeHead(200, {
                            "Content-Disposition": cd,
                            'Content-Type': ct
                        });
                        response.pipe(res);
                    });
                }
                catch(error) {
                    res.redirect('https://flai.ml/#/error');
                }
            }
            else {
                try {
                    const request = https.get(url, (response) => {
                    	if(response.headers['content-disposition']) {
                    		cd = response.headers['content-disposition'];
                    	}
                    	else {
                            cd = "attachment;filename=flai[Changed Extension].zip";
                        }
                        if(response.headers['content-type']) {
                            ct = response.headers['content-type'];
                        }
                        else {
                            ct = 'application/octet-stream';
                        }
                        res.writeHead(200, {
                            "Content-Disposition": cd,
                            'Content-Type': ct
                        });
                        response.pipe(res);
                    });
                }
                catch(error) {
                    res.redirect('https://flai.ml/#/error');
                }
            }
        }
        else {
            password = '';
            res.redirect('https://flai.ml');
        }
    })
    .catch(err => res.send(err))
}
 
module.exports = {
    handleLinks: handleLinks
}