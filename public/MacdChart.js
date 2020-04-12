class MacdChart {

    constructor(opts) {

        this.element = opts.element;
        this.config = opts.config;
    }

    setDataAndDraw(newData) {

        this.margin = this.config.margin;
        this.width = this.config.innerWidth + this.margin.right + this.margin.left;
        this.ohlcHeight = this.config.innerOhlcHeight + this.margin.top + this.margin.bottom;
        this.macdHeight = this.config.innerMacdHeight + this.margin.top + this.margin.bottom;
        this.timeFormat = d3.timeFormat(this.config.timeFormat);

        this.element.innerHTML = '';

        this.svg = d3.select(this.element).append("svg")
            .attr("width", this.width)
            .attr("height", this.ohlcHeight + this.macdHeight);

        this.ohlcG = this.svg.append("g")
            .attr("transform", "translate(-" + this.margin.yaxis + ",0)");

        this.createScales(newData);
        this.addAxes();

        this.drawOhlc(newData);
    }

    addOhlcClip() {
        
        this.svg.append("clipPath")
            .attr("id", "ohlc-clip")
            .append("rect")
            .attr("width", this.width)
            .attr("height", this.ohlcHeight);
    }

    addTooltipDiv() {
        // Define the div for the tooltip
        this.div = d3.select(this.element).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    createScales(newData) {

        let xMin = new Date();
        xMin.setDate(xMin.getDate() - 25);
        let xMax = d3.max(newData, d => new Date(Math.max(d.timeStamp)));
        xMax.setDate(xMax.getDate() + 1);
        this.x_scale = d3.scaleTime()
            .domain([xMin, xMax])
            .range([this.margin.left, this.width]);

        let visibleData = newData.filter(item => (
            item.time >= this.x_scale.invert(this.margin.left)
            && item.time <= this.x_scale.invert(this.width)
        ));
        const yMin = d3.min(visibleData, d => Math.min(d.low));
        const yMax = d3.max(visibleData, d => Math.max(d.high));
        this.y_scale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([this.ohlcHeight - this.margin.top, this.margin.bottom]);
    }

    addAxes() {

        this.xAxis = d3.axisBottom(this.x_scale)
            .ticks(5)
            .tickPadding(5)
            .tickFormat(this.timeFormat);

        this.yAxis = d3.axisRight(this.y_scale)
            .tickFormat(d => (d + "€"));

        this.x_axis = this.ohlcG.append('g')
            .attr("class", "xaxis")
            .attr('transform', 'translate(0, ' + (this.ohlcHeight - this.margin.bottom) + ')');

        this.y_axis = this.svg.append('g')
            .attr("class", "yaxis")
            .attr('transform', 'translate(' + (this.width - this.margin.yaxis) + ', 0)');
    }

    drawOhlc(newData) {

        this.addOhlcClip();
        this.addTooltipDiv();

        this.ohlcG.selectAll("line").data(newData).enter()
            .append("svg:line")
            .attr("x1", d => (this.x_scale(d.time)))
            .attr("x2", d => (this.x_scale(d.time)))
            .attr("y1", d => (this.y_scale(d.high)))
            .attr("y2", d => (this.y_scale(d.low)))
            .attr("stroke", "black")
            .attr("clip-path", "url(#ohlc-clip)");

        this.ohlcG.selectAll("rect").data(newData).enter()
            .append("svg:rect")
            .attr("width", 10)
            .attr("x", d => this.x_scale(d.time) - 5)
            .attr("y", d => this.y_scale(Math.max(d.open, d.close)))
            .attr("height", d => (this.y_scale(Math.min(d.open, d.close))
                - this.y_scale(Math.max(d.open, d.close))))
            .attr("fill", d => (d.open > d.close ? "red" : "green"))
            .attr("stroke", "black")
            .on("mouseover", d => {
                this.div.transition()
                    .duration(200)
                    .style("opacity", .9);
                this.div.html(this.timeFormat(d.time) + "<br/>" + d.close + "€")
                    .style("left", (d3.event.pageX) + 28 + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", d => {
                this.div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .attr("clip-path", "url(#ohlc-clip)");

        this.y_axis.call(this.yAxis);

        this.x_axis.call(this.xAxis);

        this.zoom = d3.zoom()
            .on("zoom", () => this.zoomed(newData));
        this.svg.call(this.zoom);
    }

    zoomed(newData) {

        let new_x_scale = d3.event.transform.rescaleX(this.x_scale);
        this.x_axis.call(this.xAxis.scale(new_x_scale));

        let visibleData = newData.filter(item => (
            item.time >= new_x_scale.invert(this.margin.left)
            && item.time <= new_x_scale.invert(this.width)
        ));
        const yMin = d3.min(visibleData, d => Math.min(d.low));
        const yMax = d3.max(visibleData, d => Math.max(d.high));
        this.y_scale.domain([yMin, yMax]);  
        this.y_axis.call(this.yAxis.scale(this.y_scale));

        this.ohlcG.selectAll("line")
            .attr("x1", d => (new_x_scale(d.time)))
            .attr("x2", d => (new_x_scale(d.time)))
            .attr("y1", d => (this.y_scale(d.high)))
            .attr("y2", d => (this.y_scale(d.low)));

        this.ohlcG.selectAll("rect")
            .attr("x", d => new_x_scale(d.time) - 5)
            .attr("y", d => this.y_scale(Math.max(d.open, d.close)))
            .attr("height", d => (this.y_scale(Math.min(d.open, d.close))
                - this.y_scale(Math.max(d.open, d.close))));
    }
}