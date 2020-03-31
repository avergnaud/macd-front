import React, { useRef, useEffect } from 'react';
import MacdChartProps from '../MacdChartProps';
import Macd from '../Macd';
import * as d3 from 'd3';

export const MacdChart = (props: MacdChartProps) => {

    const d3Container = useRef(null);
    const margin = props.visual.margin;
    const width = props.visual.width + margin.right + margin.left;
    const height = props.visual.height + margin.top + margin.bottom;

    useEffect(() => {

        if (props && d3Container.current) {

            const timeFormat = d3.timeFormat("%Y-%m-%d %I:%M");
            const svg = d3.select(d3Container.current);

            props.data.forEach(function (d) {
                d.timeStamp = d.timeStamp * 1000;
                d.time = new Date(d.timeStamp);
            });

            // set the ranges
            const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
            const xAxisScale = d3.scaleTime().range([margin.left, width - margin.axis]);
            const yScale = d3.scaleLinear().range([height - margin.top, margin.bottom]);

            const y = d3.scaleLinear().range([height - margin.top, margin.bottom]);

            // define the macd line
            const macdLine = d3.line<Macd>()
                .curve(d3.curveCatmullRom)
                .x(function(d) { return xScale(d.time); })
                .y(function(d) { return y(d.macd); });
            
            // define the signal line
            const signalLine = d3.line<Macd>()
                .curve(d3.curveCatmullRom)
                .x(function(d) { return xScale(d.time); })
                .y(function(d) { return y(d.signal); });
            
            // Scale the range of the data x
            const xMin = d3.min(props.data, d => new Date(Math.min(d.timeStamp)));
            const xMax = d3.max(props.data, d => new Date(Math.max(d.timeStamp)));
            if (xMin === undefined || xMax === undefined) {
                return;
            }
            xScale.domain([xMin, xMax]);
            // xAxis
            xAxisScale.domain([xMin, xMax]);
            // y
            const yMin = d3.min(props.data, d => Math.min(d.macd, d.signal));
            const yMax = d3.max(props.data, d => Math.max(d.macd, d.signal));
            if (yMin === undefined || yMax === undefined) {
                return;
            }
            y.domain([yMin, yMax])
            yScale.domain([yMin, yMax]);

            // append
            svg.append("path")
                .data([props.data])
                .attr("class", "line")
                .style("stroke", "blue")
                .attr("d", macdLine)
                .style("fill","none")
                .attr('pointer-events', 'visibleStroke')
                .on("mouseover", function(d) {
                    console.log(d);
                });

            svg.append("path")
                .data([props.data])
                .attr("class", "line")
                .style("stroke", "red")
                .attr("d", signalLine)
                .style("fill","none");

            // Add the X Axis
            if (timeFormat == null) {
                return;
            }
            const xAxis = d3.axisBottom(xAxisScale)
                .ticks(5)
                .tickPadding(5)
                .tickFormat(
                    /* ? */
                    timeFormat as ((domainValue: number | Date | { valueOf(): number; }, index: number) => string)
                );
            const yAxis = d3.axisRight(yScale)
                .tickValues(yScale.domain());

            svg.append("g")
                .call(xAxis)
                .attr('transform', 'translate(0, ' + (height - margin.bottom) + ')');

            // Add the Y Axis
            svg.append('g').call(yAxis)
                .attr('transform', 'translate(' + (width - margin.axis) + ', 0)');
            
        }
    }, [props, margin, width, height/*, d3Container.current*/]);

    return (
        <svg
            width={width}
            height={height}
            ref={d3Container}
        />
    );
}