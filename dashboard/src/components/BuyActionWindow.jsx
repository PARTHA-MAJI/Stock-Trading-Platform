import React, { useState } from "react";
import axios from "axios";

import { watchlist } from "../data/data";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid, closeBuyWindow }) => {
  const selectedStock = watchlist.find((item) => item.name === uid);

  const initialPrice = selectedStock ? selectedStock.price : 0.0;

  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(initialPrice);

  const handleBuyClick = () => {
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/newOrder`, {
        name: uid,
        qty: stockQuantity,
        price: stockPrice,
        mode: "BUY",
      })
      .then(() => {
        closeBuyWindow();
        sessionStorage.setItem("isTradeRefresh", "true");
        window.location.href = window.location.origin + "/holdings";
      })
      .catch((error) => {
        console.error("Order failed:", error);
      });
  };

  const handleCancelClick = () => {
    closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹{(stockQuantity * stockPrice).toFixed(2)}</span>
        <div>
          <button className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </button>
          <button className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
