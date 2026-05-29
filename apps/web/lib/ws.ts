export type QutoPayLoad = Record<string, {
    ask_price: number, bid_price: number, decimal: number
}>;


type QutoListner = (data: QutoPayLoad) => void



class WsClient {
    private ws: WebSocket | null = null;
    private url = "ws://localhost:8080";
    private isConnecting = false;
    private currentUserId;
    private listners = new Set<QutoListner>();



    connect() {
        if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting === true) {
            return;
        }
        this.open()
        // https://blog.logrocket.com/exploring-usesyncexternalstore-react-hook/



    }

    identity(userId) {
        this.currentUserId = userId;
        this.sendIdentity()
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
            this.sendIdentity();

        }
        this.ws.onmessage = (evt) => {
            try {
                const data = JSON.parse(evt.data);
                this.listners.forEach(listner =>
                    listner(data as QutoPayLoad));
            } catch (error) {

            }


        }

        this.ws.onclose = () => {

            this.isConnecting = false;
            setTimeout(() => {

            },)



        }




    }

    subscribe(listner) {
        this.listners.add(listner);
        return (() => {
            this.listners.delete(listner);
        })
    }
}


export const wsClient = new WsClient();