import * as d3 from 'd3';

export const ohlcChart = () => {

    /* defaults */
    let margin = {
        top: 50,
        right: 73,
        bottom: 50,
        left: 25,
        axis: 55
    };
    let width = 635 + margin.right + margin.left;
    let height = 167 + margin.top + margin.bottom;

    /* constants */
    const timeFormat = d3.timeFormat("%Y-%m-%d %I:%M");
    const xScale = d3.scaleTime();
    const yScale = d3.scaleLinear();
    const xAxisScale = d3.scaleTime();
    const xAxis = d3.axisBottom(xAxisScale)
        .ticks(5)
        .tickPadding(5)
        .tickFormat(timeFormat);

    function chart(selection) {

        selection.each(function (data) {

            const lineSelection = d3.select(this).selectAll("line").data(data);
            const chartSelection = d3.select(this).selectAll("rect").data(data);

            const timeFormat = d3.timeFormat("%Y-%m-%d %I:%M");
            data.forEach(function (d) {
                d.timeStamp = d.timeStamp * 1000;
                d.time = new Date(d.timeStamp);
            });

            /* x data range */
            const xMin = d3.min(data, d => new Date(Math.min(d.timeStamp)));
            const xMax = d3.max(data, d => new Date(Math.max(d.timeStamp)));
            if (xMin === undefined || xMax === undefined) {
                return;
            }
            xScale.domain([xMin, xMax])
                .range([margin.left, width - margin.right]);
            xAxisScale.domain([xMin, xMax])
                .range([margin.left, width - margin.axis]);

            /* y data range */
            const yMin = d3.min(data, d => Math.min(d.low));
            const yMax = d3.max(data, d => Math.max(d.high));
            if (yMin === undefined || yMax === undefined) {
                return;
            }
            yScale.domain([yMin, yMax])
                .range([height - margin.top, margin.bottom]);

            /* set up axes */
            const yAxis = d3.axisRight(yScale)
                .tickValues(yScale.domain())
                .tickFormat(d => (d + "€"));
            if (timeFormat == null) {
                return;
            }

            lineSelection.enter()
                .append("svg:line")
                .attr("x1", d => (xScale(d.time) + 5))
                .attr("x2", d => (xScale(d.time) + 5))
                .attr("y1", d => (yScale(d.high)))
                .attr("y2", d => (yScale(d.low)))
                .attr("stroke", "black");

            chartSelection.enter()
                .append("svg:rect")
                .attr("width", 10)
                .attr("x", d => xScale(d.time))
                .attr("y", d => yScale(Math.max(d.open, d.close)))
                .attr("height", d => (yScale(Math.min(d.open, d.close)) - yScale(Math.max(d.open, d.close))))
                .attr("fill", d => (d.open > d.close ? "red" : "green"))
                .attr("stroke", "black");

            d3.select(this).append('g').call(yAxis)
                .attr('transform', 'translate(' + (width - margin.axis) + ', 0)');

            d3.select(this).append('g').call(xAxis)
                .attr('transform', 'translate(0, ' + (height - margin.bottom) + ')');
        });
    }

    // setters
    chart.setMargin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
    };

    chart.setWidth = function (_) {
        if (!arguments.length) return width;
        width = _;
    };

    chart.setHeight = function (_) {
        if (!arguments.length) return height;
        height = _;
    };

    return chart;
}
