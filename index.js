'use strict';
const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const billReader = require('./billReader');
const orderReader = require('./orderReader');

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new BrowserWindow({
		width: 600,
		height: 400,
		icon: __dirname + '/icons/logo.ico'
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});

// Listen for readPDF message from renderer process
ipcMain.on('read-pdf', async (event, arg) => {
	const fileName = arg[0];
	const discountCodes = arg[1];

	const orders = await orderReader();
	const bills = await billReader(discountCodes);

	const wb = XLSX.utils.book_new();
	(function () {
		/** FATTURE */
		const headers = [Object.keys(bills[0])];
		const array = [].concat(headers).concat(bills.map(file => {
			return Object.keys(file).map(key => file[key])
		}));
		/* generate bills workbook */
		const ws = XLSX.utils.aoa_to_sheet(array, {});
		XLSX.utils.book_append_sheet(wb, ws, "Fatture");
		ws['!cols'] = new Array(9).fill({width: 20});
	})();

	(function () {
		/** ORDINI */
		const headers = [Object.keys(orders[0])];
		const array = [].concat(headers).concat(orders.map(file => {
			return Object.keys(file).map(key => file[key])
		}));
		/* generate orders workbook */
		const ws = XLSX.utils.aoa_to_sheet(array);
		XLSX.utils.book_append_sheet(wb, ws, "Ordini");
		ws['!cols'] = new Array(6).fill({width: 20});
	})();


	/* WRITE EXCEL FILE */
	const buf = XLSX.write(wb, { type: 'buffer', bookType: "xlsx" });
	fs.writeFile(path.resolve('./output/' + fileName), buf, "binary", function (err) {
		if (err) {
			console.log(err);
		} else {
			event.sender.send('read-pdf-reply', JSON.stringify(bills));
		}
	});

});
