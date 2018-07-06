const electron = require('electron')
const url = require('url')
const path = require('path')

const webb = require('express')();
const http = require('http');

const {app, BrowserWindow, Menu, ipcMain} = electron

//SET env
process.env.NODE_ENV = 'production';

let mainWindow
let addWindow

//Listen for app to be ready
app.on('ready', function(){
  // Create new mainWindow
  mainWindow = new BrowserWindow({});
  //Load html into Window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname,'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function(){
    mainWindow = null
    app.quit();
  })

  // build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // inspect Menu
  Menu.setApplicationMenu(mainMenu);
})

function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title:'Add Shoopling List Item'
  });
  //Load html into Window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname,'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }))

  //Garbage collection handle
  addWindow.on('close', function(){
    addWindow = null
  })
}

//Catch item:add
ipcMain.on('item:add',function(e, item){
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
  {
    label:'File',
    submenu: [
      {label: 'Add Item',
        click(){
          createAddWindow();
        }
      },
      {label: 'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q':'Ctrl+Q',
        click(){
            app.quit();
          }
      }
    ]
  }
]

// if mac, add empty object to Menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}


// Add developer tools item if not in prod
// if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I':'Ctrl+I',
        click(item, focuseWindow) {
          focuseWindow.toggleDevTools();
        }
      },
      {role: 'reload'}
    ]
  });
// }

var PORT = 4341;

var httpServer = http.createServer(webb);

httpServer.listen(PORT,function(){
  console.log('HTTP Server is running.');
});

webb.get('/', function(req, res){
  res.status(200).send('Welcome!');
});
