import React, { useEffect, useRef, useState } from 'react';
import {  createChart,  LineStyle } from 'lightweight-charts';
import io from 'socket.io-client';

const socket = io('http://localhost:4001');

const StockChart = ({symbol,timeinterval}) => {
  const chartContainerRef = useRef(null);
  const tooltipRef = useRef(null)
  const [toottipdata, setTooltipdata] = useState({

  })

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#222" },
        textColor: "#DDD"
      },
      grid: {
        vertLines: { color: "#444" },
        horzLines: { color: '#444' }
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      crosshair: {
        vertLine: {
          color: "#C3BCDB44",
          width: 5,
          labelBackgroundColor: "#9B7DFF",
          style: LineStyle.Solid
        },
        horzLine: {
          color: "#C3BCDB44",
          width: 5,
          style: LineStyle.Solid,
          labelBackgroundColor: "#9B7DFF"
        }
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },

      localization: {
        locale: 'en',
        priceFormatter: (price) => {
          const myPrice = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: 'USD',
            maximumFractionDigits: 2,
          }).format(price);
          return myPrice
        }
      },
    });

    chart.priceScale('right').applyOptions({
      borderColor: "#71649C"
    })
    chart.timeScale().applyOptions({
      borderColor: "#71649C",
      rightOffset: 20,
      barSpacing: 15,
      // minBarSpacing: 5,
      fixLeftEdge: true,
    })

    const candlestickSeries = chart && chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5358",
      borderVisible: true,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5358"
    });



    const apiKey = 'ROIVMLNBINC1FPF9';

    async function fetchData() {
      const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${timeinterval}&apikey=${apiKey}`)
      const data = await response.json();
      if(data.length===1){
        window.alert('reached the maximum call limits')
        window.location.reload()
      }
      return data[`Time Series (${timeinterval})`];
    }

    async function updateChart() {
      const data = await fetchData();

      const chartData = Object.keys(data).map((timestamp) => {
        const ohlc = data[timestamp];
        return {
          time: new Date(timestamp).getTime(),
          open: parseFloat(ohlc['1. open']),
          high: parseFloat(ohlc['2. high']),
          low: parseFloat(ohlc['3. low']),
          close: parseFloat(ohlc['4. close']),
        };
      });
      chartData.sort((a, b) => a.time - b.time);
            chartData.forEach(dataPoint => {
        dataPoint.time = dataPoint.time/1000;
      });
      candlestickSeries.setData(chartData)
      const recdata = [chartData[chartData.length-1],chartData[chartData.length-2]]
      socket.emit('updatedata',recdata)

      const toolTipWidth = 80;
      const toolTipHeight = 50;
      const toolTipMargin = 15;

      chart.subscribeCrosshairMove(param => {
        if (

          !param.time ||
          param.point.x < 0 ||
          param.point.x > chartContainerRef.current.clientWidth ||
          param.point.y < 0 ||
          param.point.y > chartContainerRef.current.clientHeight
        ) {
          tooltipRef.current.style.display = 'none';
        } else {
          tooltipRef.current.style.display = 'block';
          const data = param.seriesData.get(candlestickSeries);
          setTooltipdata(data)
          const price = data.value !== undefined ? data.value : data.close;
          const coordinate = candlestickSeries.priceToCoordinate(price);
          let shiftedCoordinate = param.point.x - 50;
          if (coordinate === null) {
            return;
          }
          shiftedCoordinate = Math.max(
            0,
            Math.min(chartContainerRef.current.clientWidth - toolTipWidth, shiftedCoordinate)
          );
          const coordinateY =
            coordinate - toolTipHeight - toolTipMargin > 0
              ? coordinate - toolTipHeight - toolTipMargin
              : Math.max(
                0,
                Math.min(
                  chartContainerRef.current.clientHeight - toolTipHeight - toolTipMargin,
                  coordinate + toolTipMargin
                )
              );
          tooltipRef.current.style.left = shiftedCoordinate + 'px';
          tooltipRef.current.style.top = coordinateY + 'px';
        }
      });
    }

    updateChart();



    const HandleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth
      })
    }

    window.addEventListener("resize", HandleResize)
      
    
   socket.on('liveData', (data) => {
        candlestickSeries.update(data)
    });

    return () => {
        chart.remove();
      // socket.disconnect();
      window.removeEventListener("resize", HandleResize)
    };
  }, [symbol,timeinterval]);

  return (
    <>
      <div ref={chartContainerRef} style={{ position: 'relative',display:'flex',justifyContent:'center',border:'1px solid white',width:"70%" }}>
        <div ref={tooltipRef} style={{
          position: 'absolute',
          width: '150px',
          height: '200px',
          zIndex: 1000,
          backgroundColor: "white",
          borderRadius: "10px",
          border: "2px solid purple",
          textColor: "black",
          padding: '8px',
          margin: '0',
          display: 'none'
        }}>
          <h3>{symbol}</h3>
          <p>High -- {toottipdata.high}</p>
          <p>Low -- {toottipdata.low}</p>
          <p>Open -- {toottipdata.open}</p>
          <p>Close -- {toottipdata.close}</p>
        </div>
        

      </div>
      
      
    </>
  )
};

export default StockChart;
