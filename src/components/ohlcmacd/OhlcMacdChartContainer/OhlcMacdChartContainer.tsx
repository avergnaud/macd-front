import React, { useState, useEffect } from "react";
import OhlcMacd from "../OhlcMacd";
import OhlcMacdVisual from "../OhlcMacdVisual";
import { OhlcMacdChart } from "../OhlcMacdChart/OhlcMacdChart";

interface Macd {
  timeEpochTimestamp: number;
  macdValue: number;
  signalValue: number;
}

interface Ohlc {
  timeEpochTimestamp: number;
  openingPrice: number;
  highPrice: number;
  lowPrice: number;
  closingPrice: number;
}

export const OhlcMacdChartContainer = () => {
    
  const [data, setData] = useState<OhlcMacd[]>([]);

  const visual: OhlcMacdVisual = {
    innerWidth: 435,
    innerOhlcHeight: 167,
    innerMacdHeight: 100,
    margin: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 0,
      xaxis: 50,
      yaxis: 50,
    },
    timeFormat: "%Y-%m-%d",
  };

  useEffect(() => {
    /* component did mount */

    Promise.all([
      
      fetch("https://macd-definition.herokuapp.com/ohlc/?chartEntityId=2"),
      fetch("https://macd-definition.herokuapp.com/macd/?macdDefinitionId=1"),
      /*
     fetch("http://localhost:8080/ohlc/?chartEntityId=9395"),
     fetch("http://localhost:8080/macd/?macdDefinitionId=9394")
     */
    ])
      .then(async ([ohlcData, macdData]) => {
        const ohlcJson = await ohlcData.json();
        const macdJson = await macdData.json();
        return [ohlcJson, macdJson];
      })
      .then((data) => {
        const macdByTimestamp = new Map();
        data[1].forEach((item: Macd) => {
          macdByTimestamp.set(item.timeEpochTimestamp, {
            macdValue: item.macdValue,
            signalValue: item.signalValue,
          });
        });
        let ohlcData = data[0];

        let formattedData = ohlcData.map((item: Ohlc) => {
          let macdObj = macdByTimestamp.get(item.timeEpochTimestamp);
          return {
            timeStamp: item.timeEpochTimestamp * 1000,
            time: new Date(item.timeEpochTimestamp * 1000),
            open: item.openingPrice,
            high: item.highPrice,
            low: item.lowPrice,
            close: item.closingPrice,
            macd: macdObj ? macdObj.macdValue : undefined,
            signal: macdObj ? macdObj.signalValue : undefined,
          };
        });

        setData(formattedData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <React.Fragment>
      <h3>ETHEUR 1 day + MACD</h3>
      <h5>Horizontal scrollable chart</h5>
      <OhlcMacdChart data={data} visual={visual} />
    </React.Fragment>
    );
};
