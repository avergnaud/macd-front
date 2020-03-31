import React, { useRef, useEffect } from 'react';
import OhlcChartProps from '../OhlcChartProps';
import * as d3 from 'd3';

export const OhlcChart = (props: OhlcChartProps) => {

    const d3Container = useRef(null);

    const margin = props.visual.margin;
    const width = props.visual.width + margin.right + margin.left;
    const height = props.visual.height + margin.top + margin.bottom;

    useEffect(() => {
        if (props && d3Container.current) {

            const timeFormat = d3.timeFormat("%Y-%m-%d %I:%M");
            const chart = d3.select(d3Container.current);

            props.data.forEach(function (d) {
                d.timeStamp = d.timeStamp * 1000;
                d.time = new Date(d.timeStamp);
            });

            /* x data range */
            const xMin = d3.min(props.data, d => new Date(Math.min(d.timeStamp)));
            const xMax = d3.max(props.data, d => new Date(Math.max(d.timeStamp)));
            if (xMin === undefined || xMax === undefined) {
                return;
            }
            const xScale = d3.scaleTime()
                .domain([xMin, xMax])
                .range([margin.left, width - margin.right]);
            const xAxisScale = d3.scaleTime()
                .domain([xMin, xMax])
                .range([margin.left, width - margin.axis]);

            /* y data range */
            const yMin = d3.min(props.data, d => Math.min(d.low));
            const yMax = d3.max(props.data, d => Math.max(d.high));
            if (yMin === undefined || yMax === undefined) {
                return;
            }
            const yScale = d3.scaleLinear()
                .domain([yMin, yMax])
                .range([height - margin.top, margin.bottom]);

            /* set up axes */
            const yAxis = d3.axisRight(yScale)
                .tickValues(yScale.domain())
                .tickFormat(d => (d + "€"));
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

            chart.selectAll("line").data(props.data)
                .enter()
                .append("svg:line")
                    .attr("x1", d => (xScale(d.time) + 5))
                    .attr("x2", d => (xScale(d.time) + 5))
                    .attr("y1", d => (yScale(d.high)))
                    .attr("y2", d => (yScale(d.low)))
                    .attr("stroke", "black");

            chart.selectAll("rect").data(props.data)
                .enter()
                .append("svg:rect")
                    .attr("width", 10)
                    .attr("x", d => xScale(d.time))
                    .attr("y", d => yScale(Math.max(d.open, d.close)))
                    .attr("height", d => (yScale(Math.min(d.open, d.close)) - yScale(Math.max(d.open, d.close))))
                    .attr("fill", d => (d.open > d.close ? "red" : "green"))
                    .attr("stroke", "black");

            chart.append('g').call(yAxis)
                .attr('transform', 'translate(' + (width - margin.axis) + ', 0)');

            chart.append('g').call(xAxis)
                .attr('transform', 'translate(0, ' + (height - margin.bottom) + ')');
        }
    }, [props, margin, width, height/*, d3Container.current*/]);

    return (
        <svg
            className="d3-component"
            width={width}
            height={height}
            ref={d3Container}
        />
    );
}