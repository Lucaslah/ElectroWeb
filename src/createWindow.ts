import {
    BrowserWindow
} from "electron";

export default class createWindow {
    constructor() {}

    public init() {
        const mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        });
    }
}
