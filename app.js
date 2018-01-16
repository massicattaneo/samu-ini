// Send async message to main process
var { ipcRenderer } = require('electron');

var discountsId = 'discounts';
var fileNameId = 'fileName';
var orderFolderId = 'orderFolder';
var billFolderId = 'billFolder';

// Listen for async-reply message from main process
ipcRenderer.on('read-pdf-reply', (event, arg) => {
	var v = document.getElementById(fileNameId).value;
	var link = document.createElement("a");
	link.download = `${v}.xlsx`;
	link.target = `_blank`;
	link.href = `output/${v}.xlsx`;
	link.click();
});

function init() {
	document.getElementById(discountsId).value = localStorage.getItem(discountsId);
	document.getElementById(fileNameId).value = localStorage.getItem(fileNameId);
	document.getElementById('orderSaved').innerText = localStorage.getItem(orderFolderId);
	document.getElementById('billSaved').innerText = localStorage.getItem(billFolderId);
}

function save() {
	localStorage.setItem(discountsId, document.getElementById(discountsId).value);
	localStorage.setItem(fileNameId, document.getElementById(fileNameId).value);
	let of = document.getElementById(orderFolderId).files;
	if (of.length) localStorage.setItem(orderFolderId, of[0].path);
	let bf = document.getElementById(billFolderId).files;
	if (bf.length) localStorage.setItem(billFolderId, bf[0].path);
	document.getElementById('orderSaved').innerText = localStorage.getItem(orderFolderId);
	document.getElementById('billSaved').innerText = localStorage.getItem(billFolderId);
}

function run() {
	var value = document.getElementById(discountsId).value.split(',').map(function (i) {
		return i.trim();
	});
	var value2 = document.getElementById(fileNameId).value;
	let orderF = document.getElementById(orderFolderId).files.length ? document.getElementById(orderFolderId).files[0].path : localStorage.getItem(orderFolderId) || undefined;
	let billF = document.getElementById(billFolderId).files.length ? document.getElementById(billFolderId).files[0].path : localStorage.getItem(billFolderId) || undefined;
	ipcRenderer.send('read-pdf', [value2 + '.xlsx', value, orderF, billF ]);
}
