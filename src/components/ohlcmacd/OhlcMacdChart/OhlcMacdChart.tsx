import React, { useRef, useEffect } from "react";
import OhlcMacdChartProps from "../OhlcMacdChartProps";
import { OhlcMacdChartD3 } from './ohlc-macd-chart-d3';

export const OhlcMacdChart = (props: OhlcMacdChartProps) => {

    const d3Container = useRef(null);

    const chart = new OhlcMacdChartD3({
        element: d3Container.current,
        config: props.visual
      });

    useEffect(() => {
        
        if (props && props.data && props.data.length > 0 && d3Container.current) {
            
            chart.setElement(d3Container.current);
            chart.draw(props.data);
        }
    }, [props, chart/*, d3Container.current*/]);
    
    return <div ref={d3Container}></div>;
}