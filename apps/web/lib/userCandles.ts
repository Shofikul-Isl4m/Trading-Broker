import { useEffect } from "react";
import { wsToAppSymbol } from "./symbol";
import { wsClient } from "./ws";
import { create } from "zustand"
import { unsubscribe } from "diagnostics_channel";


export type TimeFrame = "1m" | "5m" | "15m" | "1h" | "1d";
type candles = {
    t: number,
    o: number,
    h: number,
    l: number,
    c: number
}


function floorTime(ts: number, ms: number) {
    return Math.floor(ts / ms) * ms;
}

type CandlesState = {
    timeFrame: TimeFrame,
    setTimeFrame: (tf: TimeFrame) => void;
    candlesBySymbol: Record<string, Record<TimeFrame, candles[]>>,
    maxBars: number
}

export const useCandlesStore = create<CandlesState>((set) => ({
    timeFrame: "1m",
    setTimeFrame: (tf) => set({ timeFrame: tf }),
    candlesBySymbol: {},
    maxBars: 180

}))
let wsStarted = false;

export function useCandlesFeed() {
    useEffect(() => {
        if (!wsStarted) {
            wsClient.connect();
            wsStarted = true;
        }

        const unsubscribe = wsClient.subscribe((data) => {
            const now = Date.now();
            console.log("Received Websocket data:", data);
            const buckets: Record<TimeFrame, number> = {
                "1m": floorTime(now, 60_000),
                "5m": floorTime(now, 300_000),
                "15m": floorTime(now, 900_000),
                "1h": floorTime(now, 3_600_000),
                "1d": floorTime(now, 86_400_000),
            }
            useCandlesStore.setState((state) => {
                const next = {
                    ...state.candlesBySymbol
                } as CandlesState["candlesBySymbol"];
                const maxBars = state.maxBars;
                for (const [rawSymbol, v] of Object.entries(data)) {
                    const symbol = wsToAppSymbol(rawSymbol);
                    const mid = (v.ask_price + v.bid_price) / 2 / Math.pow(10, v.decimal)

                    if (!next[symbol]) {
                        next[symbol] = {
                            "1m": [],
                            "5m": [],
                            "15m": [],
                            "1h": [],
                            "1d": []
                        }
                    }

                    Object.keys(buckets).forEach((tf) => {
                        const bucket = buckets[tf as TimeFrame]
                        const arr = next[symbol][tf as TimeFrame];
                        const last = arr[arr.length - 1];
                        if (!last || last.t != bucket) {
                            arr.push({ t: bucket, o: mid, h: mid, l: mid, c: mid })
                            if (arr.length > maxBars) arr.splice(0, arr.length - maxBars);
                        } else {
                            last.c = mid;
                            if (last.h < mid) last.h = mid;
                            if (last.l > mid) last.l = mid
                        }

                    })
                }

                return { candlesBySymbol: next };
            })



        })

        return () => {
            unsubscribe()
        }
    }, [])




}