export default class WsStreamHolder {

    dataListeners: Array<(data: any) => void> = [];

    endListeners: Array<() => void> = [];

    errorListeners: Array<(error: any) => void> = [];

    constructor(public id: string) { }

    onData(handler: (data: any) => void) {
        this.dataListeners.push(handler);
    }

    onEnd(handler: () => void) {
        this.endListeners.push(handler);
    }

    onError(hanlder: (error: any) => void) {
        this.errorListeners.push(hanlder);
    }

    sendData(data: any) {
        for (let i = 0; i < this.dataListeners.length; i++) {
            console.log("wsstream holder ", this.dataListeners[i]);
            this.dataListeners[i](data);
        }
    }

    end() {
        for (let i = 0; i < this.endListeners.length; i++) {
            this.endListeners[i]();
        }
    }

    error(error: any) {
        for (let i = 0; i < this.errorListeners.length; i++) {
            this.errorListeners[i](error);
        }
    }
}