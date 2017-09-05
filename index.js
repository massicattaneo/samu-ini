'use strict';
const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron;
const reader = require('./reader');

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
		height: 400
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
ipcMain.on('read-pdf', (event, arg) => {
	reader(...arg).then(function (data) {
		event.sender.send('read-pdf-reply', JSON.stringify(data));
	})
});
