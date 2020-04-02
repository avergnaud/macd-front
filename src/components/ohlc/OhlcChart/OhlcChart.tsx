import React, { useRef, useEffect } from 'react';
import OhlcChartProps from '../OhlcChartProps';
import * as d3 from 'd3';
import { ohlcChart } from './ohlc-chart-d3';

export const OhlcChart = (props: OhlcChartProps) => {

    const d3Container = useRef(null);

    const margin = props.visual.margin;
    const width = props.visual.width + margin.right + margin.left;
    const height = props.visual.height + margin.top + margin.bottom;

    const chart = ohlcChart();
    chart.setMargin(margin);
    chart.setWidth(width);
    chart.setHeight(height);

    useEffect(() => {
        
        if (props && d3Container.current) {

            d3.select(d3Container.current)
                .datum(props.data)
                .call(chart);

        }
    }, [props, chart/*, d3Container.current*/]);

    return (
        <svg
            className="d3-component"
            width={width}
            height={height}
            ref={d3Container}
        />
    );
}