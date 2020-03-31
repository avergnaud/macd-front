import React, { useState, useEffect } from 'react';
import Macd from '../Macd';
import { MacdChart } from '../MacdChart/MacdChart';
import ChartVisual from '../../ChartVisual';

export const MacdChartContainer = () => {

    const [macdData, setMacdData] = useState<Macd[]>([]);

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

        fetch(`http://localhost:8080/macd/?macdDefinitionId=9394&last=35`)
            .then(res => res.json())
            .then(json => {
                console.log(json)
                setMacdData(json.map((item: any) => ({
                    timeStamp: item.timeEpochTimestamp,
                    macd: item.macdValue,
                    signal: item.signalValue
                })))
            })

    }, []);

    return (
        <MacdChart data={macdData} visual={visual} />
    )

}