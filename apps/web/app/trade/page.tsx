import { useQuotesFeed, useQuotesStore } from "../../lib/quotesStore";
import { useSessionProbe } from "../../lib/session";

export default function Trade() {

    useSessionProbe()
    useQuotesFeed();
    const { quotes, selectedSymbol, setSelectedSymbol } = useQuotesStore();
    const q = quotes[selectedSymbol];
    const [showLeft, setShowLeft] = useState(true);
    const [leftWidth, setLeftWidth] = useState(25);
    const rightWidth = 25;


}