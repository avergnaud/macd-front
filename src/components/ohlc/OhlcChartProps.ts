import OHLC from './OHLC';
import ChartVisual from '../ChartVisual';

export default interface OhlcChartProps {
    data: OHLC[];
    visual: ChartVisual;
}