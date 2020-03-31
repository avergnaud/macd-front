import React from 'react';
import './App.css';
import { OhlcChartContainer } from './components/ohlc/OhlcChartContainer/OhlcChartContainer';
import { MacdChartContainer } from './components/macd/MacdChartContainer/MacdChartContainer';

function App() {

  return (
    <div className="App">
      {/*
      <MyVisComponent />
      <MyD3Component data={[1,2,3]}/>
      */}
      <OhlcChartContainer />
      <MacdChartContainer />
    </div>
  );
}

export default App;
