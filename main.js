const electron = require('electron');
const url = require('url');
const path = require('path');
const { Menu } = require('electron');

const {app, BrowserWindow , ipcMain} = electron;

let mainWindow;
let addWindow;

// Set Env to production 

process.env.NODE_ENV = 'production';

// Listen for the app to be ready

app.on('ready' ,()=>{
    // Create a new window
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false
        }
    });

    //Load the Html File

    mainWindow.loadURL(url.format({
        pathname : path.join(__dirname, 'mainWindow.html'),
        protocol : 'file:',
        slashes : true
    }));
    //Quit App when closed
    mainWindow.on('close', function(){
        app.quit();
    });

    //Build menu from template

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    
    // insert the menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle Create add window
function createAddWindow(){

    addWindow = new BrowserWindow({
        width : 400,
        height : 300,
        title : 'Add Shopping List Item',
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false
        }
    });

    //Load the Html File

    addWindow.loadURL(url.format({
        pathname : path.join(__dirname, 'addWindow.html'),
        protocol : 'file:',
        slashes : true
    }));

    //Garbage Collection Handle
    addWindow.on('close', () =>{
        addWindow : null;
    });

}

//Catch Item:add
ipcMain.on('item:add',fuction = (e, item) => {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    
    {
        label : 'File',
        submenu : [
            {
                label : 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+N' :
                'Ctrl+N',
                click(){
                    createAddWindow();
                }
            },
            {
                label : 'Clear Items',
                accelerator: process.platform == 'darwin' ? 'Command+delete':
                'Ctrl+delete',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                
                label : 'Exit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If mac , add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools option if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label:'Developer Tools',
        submenu:[
            {
                label:'Toggle Dev tools',
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
                click(item , focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role : 'reload'
            }
            ]
    });
}