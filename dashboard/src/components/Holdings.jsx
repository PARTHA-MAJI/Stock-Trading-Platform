import React, { useState, useEffect } from "react";
import axios from "axios";
import { VerticalChart } from "./VerticalChart";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/allHoldings`).then((res) => {
      setAllHoldings(res.data);
    });
  }, []);

  const totalInvestment = allHoldings.reduce((acc, stock) => {
    const avgCost = stock.avg || stock.price;
    return acc + avgCost * stock.qty;
  }, 0);

  const currentValue = allHoldings.reduce((acc, stock) => {
    return acc + stock.price * stock.qty;
  }, 0);

  const totalPnl = currentValue - totalInvestment;
  const pnlPercentage =
    totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;
  const totalPnlClass = totalPnl >= 0 ? "profit" : "loss";

  const labels = allHoldings.map((subArray) => subArray["name"]);

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.map((stock, index) => {
              const safeAvg = stock.avg || stock.price || 0;
              const safePrice = stock.price || 0;
              const safeQty = stock.qty || 0;

              const currValue = safePrice * safeQty;
              const investValue = safeAvg * safeQty;
              const dayPnl = currValue - investValue;

              const isProfit = dayPnl >= 0.0;
              const profClass = isProfit ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr key={index}>
                  <td>{stock.name}</td>
                  <td>{safeQty}</td>
                  <td>{safeAvg.toFixed(2)}</td>
                  <td>{safePrice.toFixed(2)}</td>
                  <td>{currValue.toFixed(2)}</td>
                  <td className={profClass}>{dayPnl.toFixed(2)}</td>
                  <td className={profClass}>{stock.net || "0%"}</td>
                  <td className={dayClass}>{stock.day || "0%"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>
            {totalInvestment.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            {currentValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={totalPnlClass}>
            {totalPnl.toFixed(2)} ({pnlPercentage.toFixed(2)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>

      <VerticalChart data={data} />
    </>
  );
};

export default Holdings;
