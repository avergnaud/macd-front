import React from 'react';
import './App.css';
import { OhlcMacdChartContainer } from './components/ohlcmacd/OhlcMacdChartContainer/OhlcMacdChartContainer';

function App() {

  return (
    <div className="App">
      {/*
      <MyVisComponent />
      <MyD3Component data={[1,2,3]}/>
      <OhlcChartContainer />
      <MacdChartContainer />
      */}
      <OhlcMacdChartContainer />
    </div>
  );
}

export default App;
