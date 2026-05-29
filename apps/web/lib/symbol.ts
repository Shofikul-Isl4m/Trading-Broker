export function wsToAppSymbol(symbol: string): string {
    if (symbol.endsWith("_USDC_PERP")) {
        return symbol.replace("_USDC_PERP", "USDC").replaceAll("_", "")
    }

    return symbol.replaceAll("_", "");


}