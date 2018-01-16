const pdfreader = require('pdfreader');
const path = require('path');
const fs = require('fs');

function read(discounts, inputPath = './fatture') {
	const files = [];
	return new Promise(res => {
		const folder = path.resolve(inputPath);
		const dir = fs.readdirSync(folder).filter(function (file) {
			return path.extname(file).toLowerCase() === '.pdf';
		});
		dir.forEach(function (file, index) {
			const rows = [];
			const myResult = {
				supporto: [],
				nomeFile: file
			};
			console.log('PROCESSING FILE: ', file);
			new pdfreader.PdfReader().parseFileItems(path.resolve(`${folder}/${file}`), function (err, item) {
				if (!item) {
					myResult.supporto = myResult.supporto.filter((f, i) => myResult.supporto.indexOf(f) === i).join(',');
					files.push(myResult);
					if (index === (dir.length - 1)) {
						res(files);
					}
				}
				else if (item.text) {
					try {
						readFoa(item, myResult);
						readModelleAndMatricola(item, myResult, rows);
						readFattura(item, myResult);
						readLane(item, myResult);
						readImportoFattura(item, myResult);
						readDiscounts(item, myResult, discounts);
					} catch (e) {
						console.log(e)
					}
					rows.push(item.text);
				}
			});
		});
	});
}

function readFoa(item, r) {
	const re = new RegExp('FOA-\\d*');
	if (item.text.match(re)) {
		r.foa = item.text.match(re)[0];
	}
}

function readModelleAndMatricola(item, myResult, rows) {
	const re = new RegExp('\\s.S/N\\s*(.*)');
	if (item.text.match(re)) {
		myResult.matricola = item.text.match(re)[1];
		const prevLine = rows[rows.length - 1];
		const temp = prevLine.match(/\s*(\d.)\s*([^\s]*)\s*(.*)/)[3].trim().split(' ');
		myResult.modello = temp.slice(0, temp.length - 1).join(' ').trim();
	}
}

function readFattura(item, myResult) {
	const re = new RegExp('NUMBER:\\s.(.*)\\s*DATE(.*)');
	if (item.text.match(re)) {
		myResult.codiceFattura = item.text.match(re)[1].trim();
		myResult.dataFattura = item.text.match(re)[2].trim();
	}
}

function readLane(item, myResult) {
	const re = new RegExp('LANE\\s*(.*)\\s*NET');
	if (item.text.match(re)) {
		myResult.lane = `LANE ${item.text.match(re)[1].trim()}`;
	}
}

function readImportoFattura(item, myResult) {
	const re = new RegExp('INVOICE GRAND TOTAL\\s*EUR\\s*(.*)');
	if (item.text.match(re)) {
		myResult.importoFattura = item.text.match(re)[1].trim()
	}
}

function readDiscounts(item, myResult, discounts) {
	discounts.forEach(function (dis) {
		const re = new RegExp(dis);
		if (item.text.match(re)) {
			myResult.supporto.push(item.text.match(re)[0])
		}
	});
}

module.exports = read;
