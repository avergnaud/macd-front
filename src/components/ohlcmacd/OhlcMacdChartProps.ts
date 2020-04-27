import OhlcMacd from './OhlcMacd';
import OhlcMacdVisual from './OhlcMacdVisual';

export default interface OhlcMacdChartProps {
    data: OhlcMacd[];
    visual: OhlcMacdVisual;
}