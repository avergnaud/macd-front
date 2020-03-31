import React, { useState, useEffect } from 'react';
import OHLC from '../OHLC';
import ChartVisual from '../../ChartVisual';
import { OhlcChart } from '../OhlcChart/OhlcChart';

export const OhlcChartContainer = () => {

    const [ohlcData, setOhlcData] = useState<OHLC[]>([]);

    const visual:ChartVisual = {
        margin: {
            top: 50,
            right: 73,
            bottom: 50,
            left: 25,
            axis: 55
        },
        width: 635,
        height: 167
    }

    useEffect(() => {
        // code to run on component mount

        fetch(`http://localhost:8080/ohlc/?chartEntityId=9395&last=35`)
            .then(res => res.json())
            .then(json => {
                console.log(json)
                setOhlcData(json.map((item: any) => ({
                    timeStamp: item.timeEpochTimestamp,
                    open: item.openingPrice,
                    high: item.highPrice,
                    low: item.lowPrice,
                    close: item.closingPrice
                })))
            })
    }, []);

    return (
        <OhlcChart data={ohlcData} visual={visual} />
    )
};