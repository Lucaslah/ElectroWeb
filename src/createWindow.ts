import {
    BrowserWindow
} from "electron";
import path from "path";

export default class createWindow extends BrowserWindow {
    private width: number;
    private height: number;
    private preload: string;
    constructor(preload: string, { width, height }: { width: number, height: number }) {
        super({
            width: width,
            height: height,
            webPreferences: {
                preload: path.join(__dirname, preload)
            }
        });
        this.width = width;
        this.height = height;
        this.preload = preload;
    }

    public init(): void {
        console.log("Starting ElectoWeb Dev....");
    }

    public createloadURL(url: string): void {
        this.loadURL(url); // 'file://' + __dirname + '/browser.html'
    }
}
