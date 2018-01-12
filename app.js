// Send async message to main process
var {ipcRenderer} = require('electron');

var discountsId = 'discounts';
var fileNameId = 'fileName';

// Listen for async-reply message from main process
ipcRenderer.on('read-pdf-reply', (event, arg) => {
	var v = document.getElementById(fileNameId).value;
	alert('file "output/' + v + '.csv" creato con successo!');
});

function init() {
	document.getElementById(discountsId).value = localStorage.getItem(discountsId);
	document.getElementById(fileNameId).value = localStorage.getItem(fileNameId);
}

function save() {
	localStorage.setItem(discountsId, document.getElementById(discountsId).value);
	localStorage.setItem(fileNameId, document.getElementById(fileNameId).value);
}

function run() {
	var value = document.getElementById(discountsId).value.split(',').map(function (i) {
		return i.trim();
	});
	var value2 = document.getElementById(fileNameId).value;
	ipcRenderer.send('read-pdf', [value2 + '.xlsx', value]);
}
