export default interface OhlcMacd {
    timeStamp: number;
    time: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    macd: number;
    signal: number;
}