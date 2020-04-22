/**
 * displays OHLC graph and MACD lines
 */
class MacdChart {

    /**
     * initial setup
     */
    constructor(opts) {
        /* DOM element for inserting the chart */
        this.element = opts.element;
        /* visual settings */
        this.config = opts.config;
        this.margin = this.config.margin;
        this.width = this.config.innerWidth + this.margin.right + this.margin.left;
        this.ohlcHeight = this.config.innerOhlcHeight + this.margin.top + this.margin.bottom;
        this.macdHeight = this.config.innerMacdHeight + this.margin.top + this.margin.bottom;
        this.timeFormat = d3.timeFormat(this.config.timeFormat);
    }

    /**
     * draws the graph with new data
     */
    draw(newData) {

        this.element.innerHTML = '';
        this.svg = d3.select(this.element).append("svg")
            .attr("width", this.width)
            .attr("height", this.ohlcHeight + this.macdHeight);
        this.ohlcG = this.svg.append("g")
            .attr("transform", "translate(-" + this.margin.yaxis + ",0)");
        this.macdG = this.svg.append("g")
            .attr("transform", "translate(-" + this.margin.yaxis + "," + this.ohlcHeight + ")");
        this.createScales(newData);
        this.addAxes();
        this.drawOhlc(newData);
        this.drawMacd(newData);
    }

    /* setup scales from new data */
    createScales(newData) {
        /* this.x_scale: */
        let xMin = new Date();
        xMin.setDate(xMin.getDate() - 25);
        let xMax = d3.max(newData, d => new Date(Math.max(d.timeStamp)));
        xMax.setDate(xMax.getDate() + 1);
        this.x_scale = d3.scaleTime()
            .domain([xMin, xMax])
            .range([this.margin.left, this.width]);
        /* this.yOhlcScale: */
        let visibleData = newData.filter(item => (
            item.time >= this.x_scale.invert(this.margin.left)
            && item.time <= this.x_scale.invert(this.width)
        ));
        const yOlhcMin = d3.min(visibleData, d => Math.min(d.low));
        const yOhlcMax = d3.max(visibleData, d => Math.max(d.high));
        this.yOhlcScale = d3.scaleLinear()
            .domain([yOlhcMin, yOhlcMax])
            .range([this.ohlcHeight - this.margin.top, this.margin.bottom]);
        /* this.yMacdScale: */
        const yMacdMin = d3.min(visibleData, d => Math.min(d.macd, d.signal));
        const yMacdMax = d3.max(visibleData, d => Math.max(d.macd, d.signal));
        if (yMacdMin === undefined || yMacdMax === undefined) {
            return;
        }
        this.yMacdScale = d3.scaleLinear()
            .domain([yMacdMin, yMacdMax])
            .range([this.macdHeight - this.margin.top, this.margin.bottom]);
    }

    /* setup x and y axes */
    addAxes() {
        /* see later: this.xAxisG.call(this.xAxis) */
        this.xAxis = d3.axisBottom(this.x_scale)
            .ticks(5)
            .tickPadding(5)
            .tickFormat(this.timeFormat);
        this.xAxisG = this.ohlcG.append('g')
            .attr("class", "xaxis")
            .attr('transform', 'translate(0, ' + (this.ohlcHeight - this.margin.bottom) + ')');
        /* see later: this.yOhlcAxisG.call(this.yOhlcAxis) */
        this.yOhlcAxis = d3.axisRight(this.yOhlcScale)
            .tickFormat(d => (d + "€"));
        this.yOhlcAxisG = this.svg.append('g')
            .attr("class", "yaxis")
            .attr('transform', 'translate(' + (this.width - this.margin.yaxis) + ', 0)');
    }

    /* draws the OHLC part of the graph */
    drawOhlc(newData) {
        /* ohlcClip is a clipPath, tooltipDiv is a div */
        this.addOhlcClip();
        this.addTooltipDiv();
        /* draws the lines representing High and Low values of OHLC: */
        this.ohlcG.selectAll("line").data(newData).enter()
            .append("svg:line")
            .attr("class", "ohlc")
            .attr("x1", d => (this.x_scale(d.time)))
            .attr("x2", d => (this.x_scale(d.time)))
            .attr("y1", d => (this.yOhlcScale(d.high)))
            .attr("y2", d => (this.yOhlcScale(d.low)))
            .attr("stroke", "black")
            .attr("clip-path", "url(#ohlc-clip)");
        /* draws the rectangles representing Open and Close values of OHLC: */
        this.ohlcG.selectAll("rect").data(newData).enter()
            .append("svg:rect")
            .attr("width", 10)
            .attr("x", d => this.x_scale(d.time) - 5)
            .attr("y", d => this.yOhlcScale(Math.max(d.open, d.close)))
            .attr("height", d => (this.yOhlcScale(Math.min(d.open, d.close))
                - this.yOhlcScale(Math.max(d.open, d.close))))
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
        /* adds each axis to its g element: */
        this.yOhlcAxisG.call(this.yOhlcAxis);
        this.xAxisG.call(this.xAxis);
        /* manages the horizontal panning without zoom: */
        this.zoom = d3.zoom()
            .on("zoom", () => this.zoomed(newData));
        this.svg.call(this.zoom);
    }

    /* draws the MACD part of the graph 
    */
    drawMacd(newData) {

        this.macdLine = d3.line()
            .curve(d3.curveCatmullRom)
            .x(d => this.x_scale(d.time))
            .y(d => this.yMacdScale(d.macd));

        this.signalLine = d3.line()
            .curve(d3.curveCatmullRom)
            .x(d => this.x_scale(d.time))
            .y(d => this.yMacdScale(d.signal));

        this.macdPath = this.macdG.append("path")
            .data([newData])
            .attr("class", "line")
            .style("stroke", "blue")
            .attr("d", this.macdLine)
            .style("fill", "none")
            .attr('pointer-events', 'visibleStroke')
            .attr("clip-path", "url(#ohlc-clip)");

        this.signalPath = this.macdG.append("path")
            .data([newData])
            .attr("class", "line")
            .style("stroke", "red")
            .attr("d", this.signalLine)
            .style("fill", "none")
            .attr("clip-path", "url(#ohlc-clip)");
    }

    /* this clipPath hides OHLC elements from overflowing */
    addOhlcClip() {
        this.svg.append("clipPath")
            .attr("id", "ohlc-clip")
            .append("rect")
            .attr("width", this.width - 5)
            .attr("height", this.ohlcHeight + this.macdHeight);
    }

    /* Define the div for the tooltip */
    addTooltipDiv() {
        this.div = d3.select(this.element).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    /* handles redraw after horizontal panning (rescaleX, y range...) */
    zoomed(newData) {
        /* xAxis */
        let new_x_scale = d3.event.transform.rescaleX(this.x_scale);
        this.xAxisG.call(this.xAxis.scale(new_x_scale));
        /* yOhlcAxis */
        let visibleData = newData.filter(item => (
            item.time >= new_x_scale.invert(this.margin.left)
            && item.time <= new_x_scale.invert(this.width)
        ));
        const yOlhcMin = d3.min(visibleData, d => Math.min(d.low));
        const yOhlcMax = d3.max(visibleData, d => Math.max(d.high));
        this.yOhlcScale.domain([yOlhcMin, yOhlcMax]);
        this.yOhlcAxisG.call(this.yOhlcAxis.scale(this.yOhlcScale));
        /* OHLC lines */
        this.ohlcG.selectAll("line.ohlc")
            .attr("x1", d => (new_x_scale(d.time)))
            .attr("x2", d => (new_x_scale(d.time)))
            .attr("y1", d => (this.yOhlcScale(d.high)))
            .attr("y2", d => (this.yOhlcScale(d.low)));
        /* OHLC reactangles */
        this.ohlcG.selectAll("rect")
            .attr("x", d => new_x_scale(d.time) - 5)
            .attr("y", d => this.yOhlcScale(Math.max(d.open, d.close)))
            .attr("height", d => (this.yOhlcScale(Math.min(d.open, d.close))
                - this.yOhlcScale(Math.max(d.open, d.close))));
        /* MACD lines */
        const yMacdMin = d3.min(visibleData, d => Math.min(d.macd, d.signal));
        const yMacdMax = d3.max(visibleData, d => Math.max(d.macd, d.signal));
        if (yMacdMin === undefined || yMacdMax === undefined) {
            return;
        }
        this.yMacdScale = d3.scaleLinear()
            .domain([yMacdMin, yMacdMax])
            .range([this.macdHeight - this.margin.top, this.margin.bottom]);
        this.macdLine = d3.line()
            .curve(d3.curveCatmullRom)
            .x(d => new_x_scale(d.time))
            .y(d => this.yMacdScale(d.macd));
        this.signalLine = d3.line()
            .curve(d3.curveCatmullRom)
            .x(d => new_x_scale(d.time))
            .y(d => this.yMacdScale(d.signal));
        this.macdPath
            .attr("d", this.macdLine);
        this.signalPath
            .attr("d", this.signalLine);
    }
}