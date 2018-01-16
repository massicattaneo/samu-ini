const pdfreader = require('pdfreader');
const path = require('path');
const fs = require('fs');

function read(folder = './ordini') {
	const files = [];
	return new Promise(res => {
		const dir = fs.readdirSync(folder);
		dir.forEach(function (file, index) {
			const rows = [];
			const myResult = {
				nomeFile: file,
				foa: []
			};
			if (path.extname(file).toLowerCase() === '.pdf') {
				console.log('PROCESSING FILE: ', file);
				new pdfreader.PdfReader().parseFileItems(`${folder}/${file}`, function (err, item) {
					if (!item) {
						myResult.foa.filter((f, i) => myResult.foa.indexOf(f) === i).forEach(function (foa, index, arr) {
							const item = {};
							Object.assign(item, myResult, { foa, dealerNet: Number(myResult.dealerNet.replace(',', '.')) /  arr.length});
							files.push(item);
						});
						if (index === (dir.length - 1)) {
							res(files);
						}
					}
					else if (item.text) {
						// accumulate text items into rows object, per line
						try {
							readFoa(item, myResult);
							readModello(item, myResult);
							readLane(item, myResult);
							readDate(item, myResult);
							readDealerNet(item, myResult);
						} catch (e) {
							console.log(e)
						}
						rows.push(item.text);
					}
				});
			}
		});
	});
}

function readFoa(item, myResult) {
	const re = new RegExp('FOA-\\d*');
	if (item.text.match(re)) {
		myResult.foa.push(item.text.match(re)[0]);
	}
}

function readModello(item, myResult) {
	const re = new RegExp('Description\\s*:\\s*(.*)\\s*Created');
	if (item.text.match(re)) {
		myResult.modello = item.text.match(re)[1].trim();
	}
}

function readLane(item, myResult) {
	const re = new RegExp('LANE\\s.*');
	if (item.text.match(re)) {
		const temp = item.text.match(re)[0].split(' ');
		myResult.lane = temp.slice(0, temp.indexOf('')).join(' ');
	}
}

function readDate(item, myResult) {
	const re = new RegExp('Date\\s*:\\s*(.*)\\s*Factory');
	if (item.text.match(re)) {
		myResult.data = item.text.match(re)[1].trim();
	}
}

function readDealerNet(item, myResult) {
	const re = new RegExp('Dealer Net\\s*(.*)');
	if (item.text.match(re)) {
		myResult.dealerNet = item.text.match(re)[1].trim();
	}
}

module.exports = read;
