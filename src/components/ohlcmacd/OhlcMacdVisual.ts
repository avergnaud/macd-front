export default interface OhlcMacdVisual {
  innerWidth: number;
  innerOhlcHeight: number;
  innerMacdHeight: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    xaxis: number;
    yaxis: number;
  };
  timeFormat: string;
}
