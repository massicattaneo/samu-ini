const pdfreader = require('pdfreader');
const fs = require('fs');
const path = require('path');
var json2csv = require('json2csv');
var NodeXls = require('node-xls');
var order = ['file', 'id', 'contributes'];
var fieldMap = {file: 'NOME DEL FILE', id:'NUMERO DI SERIE', contributes: 'CONTRIBUTI'};
var tool = new NodeXls();

function read(fileName, regEx, discounts) {
	const files = [];
	return new Promise(res => {
		var dir = fs.readdirSync('./pdfs');
		dir.forEach(function (file, index) {
			const rows = [];
			let id, contributes = [];
			if (path.extname(file).toLowerCase() === '.pdf') {
				console.log('PROCESSING FILE: ', file);
				new pdfreader.PdfReader().parseFileItems('./pdfs/' + file, function (err, item) {
					if (!item) {
						files.push({
							id,
							file,
							contributes: contributes.filter((f, i) => contributes.indexOf(f) === i).join(',')
						});
						if (index === (dir.length - 1)) {
							var result = tool.json2xls(files, { order, fieldMap });
							fs.writeFileSync(path.resolve('./output/' + fileName), result, 'binary');
							console.log('READED: ', files.length, 'PDF FILES');
							res(files);
						}
					}
					else if (item.text) {
						// accumulate text items into rows object, per line
						const re = new RegExp(regEx);
						if (item.text.match(re)) {
							id = item.text.match(re)[0]
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
			}
		});

	});


}

module.exports = read;
