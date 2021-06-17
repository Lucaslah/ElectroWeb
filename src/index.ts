import { app } from "electron";
import createWindow from "./createWindow";

app.on("window-all-closed", () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on("ready", () => {
    const window = new createWindow("../preload.js", {
        width: 800,
        height: 600,
    });
    window.init();
    window.createloadURL('file://' + __dirname + '../browser.html');
});