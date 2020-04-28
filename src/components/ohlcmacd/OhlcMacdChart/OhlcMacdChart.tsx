import React, { useRef, useEffect, useState } from "react";
import * as d3 from 'd3';
import OhlcMacdChartProps from "../OhlcMacdChartProps";
import { OhlcMacdChartD3 } from './ohlc-macd-chart-d3';
import styles from './OhlcMacdChart.module.css';

export const OhlcMacdChart = (props: OhlcMacdChartProps) => {

    const d3Container = useRef(null);
    const [toolTip, setToolTip] = useState("");

    const onOver = (d:any) => {
        setToolTip(timeFormat(d.time) + ", close: " + d.close + "€");
    }
    const onOut = () => {
        setToolTip("");
    }
    const chart = new OhlcMacdChartD3({
        config: props.visual,
        onOver: onOver,
        onOut: onOut
      });

    const timeFormat = d3.timeFormat(props.visual.timeFormat);

    useEffect(() => {
        
        if (props.data && props.data.length > 0 && d3Container.current) {
            
            chart.setElement(d3Container.current);
            chart.draw(props.data);
        }
    // eslint-disable-next-line
    }, [props.data]);
    
    return <React.Fragment>
            <div className={styles.ToolTip}>{toolTip}</div>
            <div ref={d3Container}></div>
        </React.Fragment>;
}