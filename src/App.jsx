import React from "react";
import CryptoList from "./pages/CryptoValutes";
import CryptoDetails from "./pages/CoinDetails";
import { Routes, Route } from "react-router-dom";
const App = () => {
  return (
    <div className="min-h-screen bg-black">
      <Routes>
        <Route path="/" element={<CryptoList />}></Route>
        <Route
          path="/cryptoDetails/:coinId"
          element={<CryptoDetails></CryptoDetails>}
        ></Route>
      </Routes>
    </div>
  );
};

export default App;
