import React from 'react';
import './App.css';
import { OhlcMacdChartContainer } from './components/ohlcmacd/OhlcMacdChartContainer/OhlcMacdChartContainer';

function App() {

  return (
    <div className="container">
      <div className="jumbotron">
        <h1>ETHEUR 1 day + MACD</h1>
        <p>Horizontal scrollable chart. Last 100 days</p>
      </div>
      <div className="row">
        <div className="col-12 col-md-9 col-lg-6">
        <OhlcMacdChartContainer />
        </div>
      </div>
    </div>
  );
}

export default App;
