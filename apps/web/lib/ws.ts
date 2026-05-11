class WsClient {
    private ws: WebSocket | null = null;
    private url = "ws://localhost:8080";
    private isConnecting = false;
    private currentUserId



    connect() {
        if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting === true) {
            return;
        }
        this.open()



    }




    identity(userId) {
        this.currentUserId = userId;
        sendIdentity()
    }

    sendIdentity() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.currentUserId)
            this.ws?.send(JSON.stringify({ type: "identity", userId: this.currentUserId }))


    }


    open() {
        this.isConnecting = true;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            this.isConnecting = false;
            this.sendIdentity



        }


    }
}


