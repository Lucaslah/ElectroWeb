import { app } from "electron";
import createWindow from "./createWindow";

app.on("window-all-closed", () => {});
app.on("ready", () => {
    const window = new createWindow("../preload.js", {
        width: 800,
        height: 600,
    });
    window.init();
});