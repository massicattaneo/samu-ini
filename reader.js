const pdfreader = require('pdfreader');
const fs = require('fs');
const path = require('path');
var json2csv = require('json2csv');
var fields = ['id', 'contributes'];

function read(fileName, regEx, discounts) {
	const files = [];
	return new Promise(res => {
		var dir = fs.readdirSync('./pdfs');
		dir.forEach(function (name) {
			const rows = [];
			let id, contributes = [];
			new pdfreader.PdfReader().parseFileItems('./pdfs/'+ name, function (err, item) {
				if (!item) {
					files.push({ id, contributes: contributes.filter((f, i) => contributes.indexOf(f) === i).join(',') });
					if (dir.length === files.length) {
						var result = json2csv({ data: files, fields: fields });
						fs.writeFileSync(path.resolve('./output/'+fileName), result);
						res(files);
					}
				}
				else if (item.text) {
					// accumulate text items into rows object, per line
					const re  = new RegExp(regEx);
					if (item.text.match(re)) {
						id =item.text.match(re)[0]
					}
					discounts.forEach(function (dis) {
						const re = new RegExp(dis);
						if (item.text.match(re)) {
							contributes.push(item.text.match(re)[0])
						}
					});
					rows.push(item.text);
				}
			});
			// var end = getEnd(name, ['en', 'es', 'pt', 'zh-hans']);
			// var start = name.indexOf('-') + 1;
			// var dirToHash = name.substr(start, end-start);
			// var hashPath = config.paths.dist.root + '/' + dirToHash + '/hash.json';
			// var hash = JSON.parse(fs.readFileSync(path.resolve(hashPath), 'utf8')).hash;
			// var jsonFile = path.resolve(root + '/common/configs/' + name);
			// var data = fs.readFileSync(jsonFile, 'utf8');
			// fs.writeFileSync(jsonFile, data.replace(/\$\{project\.version\}/g, hash));
		});

	});


}

module.exports = read;
