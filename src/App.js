import React, { useState, useMemo, useCallback } from "react";
import { FiInfo } from "react-icons/fi";

function App() {
  const indices = {
    "Volatility 10 Index": { minLot: 0.5, lotStep: 0.1, pointsPerPip: 100, baseUSD: 0.5, basePoints: 1000 },
    "Volatility 25 Index": { minLot: 0.5, lotStep: 0.1, pointsPerPip: 100, baseUSD: 0.5, basePoints: 1000 },
    "Volatility 50 Index": { minLot: 4.0, lotStep: 0.1, pointsPerPip: 100, baseUSD: 1, basePoints: 2000 },
    "Volatility 75 Index": { minLot: 0.001, lotStep: 0.001, pointsPerPip: 100, baseUSD: 0.05, basePoints: 1000 },
    "Volatility 100 Index": { minLot: 0.5, lotStep: 0.1, pointsPerPip: 100, baseUSD: 0.5, basePoints: 1000 },
    "Volatility 10 (1s) Index": { minLot: 0.5, lotStep: 0.1, pointsPerPip: 100, baseUSD: 0.5, basePoints: 1000 },
    "Volatility 25 (1s) Index": { minLot: 0.005, lotStep: 0.005, pointsPerPip: 100, baseUSD: 0.5, basePoints: 1000 },
    "Volatility 50 (1s) Index": { minLot: 0.005, lotStep: 0.005, pointsPerPip: 100, baseUSD: 0.5, basePoints: 1000 },
    "Volatility 75 (1s) Index": { minLot: 0.05, lotStep: 0.05, pointsPerPip: 100, baseUSD: 0.9, basePoints: 1790 },
    "Volatility 100 (1s) Index": { minLot: 0.2, lotStep: 0.1, pointsPerPip: 100, baseUSD: 0.5, basePoints: 1000 },
    "Volatility 150 (1s) Index": { minLot: 0.01, lotStep: 0.01, pointsPerPip: 100, baseUSD: 0.5, basePoints: 1000 },
    "Volatility 200 (1s) Index": { minLot: 0.02, lotStep: 0.02, pointsPerPip: 100, baseUSD: 0.5, basePoints: 1000 },
    "Volatility 300 (1s) Index": { minLot: 1.0, lotStep: 0.1, pointsPerPip: 100, baseUSD: 1.0, basePoints: 1000 },
  };

  const [selectedIndex, setSelectedIndex] = useState("Volatility 75 (1s) Index");
  const [minLot, setMinLot] = useState(indices[selectedIndex].minLot);
  const [lotStep, setLotStep] = useState(indices[selectedIndex].lotStep);
  const [maxLot, setMaxLot] = useState(parseFloat((indices[selectedIndex].minLot * 20).toFixed(3)));
  const [sl, setSL] = useState(""); // Stop Loss pips
  const [tp, setTP] = useState(""); // Take Profit pips

  const params = indices[selectedIndex];

  // When index changes, update minLot, lotStep, and maxLot automatically
  const handleIndexChange = (e) => {
    const index = e.target.value;
    setSelectedIndex(index);

    const indexParams = indices[index];
    setMinLot(indexParams.minLot);
    setLotStep(indexParams.lotStep);
    setMaxLot(parseFloat((indexParams.minLot * 20).toFixed(3))); // maxLot = 20× minLot
  };

  // USD calculation per index
  const calculateUSD = useCallback(
    (pips, lot) => {
      if (isNaN(pips) || isNaN(lot)) return 0;
      const points = pips * params.pointsPerPip;
      const valuePerPoint = params.baseUSD / params.basePoints;
      return points * valuePerPoint * (lot / params.minLot);
    },
    [params.baseUSD, params.basePoints, params.pointsPerPip, params.minLot]
  );

  // Generate lot sizes based on minLot and lotStep
  const lotSizes = useMemo(() => {
    const sizes = [];
    for (let l = parseFloat(minLot); l <= parseFloat(maxLot) + 0.001; l += parseFloat(lotStep)) {
      sizes.push(parseFloat(l.toFixed(3)));
    }
    return sizes;
  }, [minLot, maxLot, lotStep]);

  const bestTPProfit = useMemo(() => {
    if (!tp) return null;
    return Math.max(...lotSizes.map((lot) => calculateUSD(parseFloat(tp), lot)));
  }, [tp, lotSizes, calculateUSD]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Synthetic Indices Calculator
        </h2>

        {/* Index selector */}
        <div className="mb-6 relative">
          <label className="block text-gray-700 mb-2">Select Synthetic Index:</label>
          <select
            value={selectedIndex}
            onChange={handleIndexChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Object.keys(indices).map((index) => (
              <option key={index} value={index}>
                {index} (Min Lot: {indices[index].minLot}, Step: {indices[index].lotStep})
              </option>
            ))}
          </select>
          {/* Info tooltip */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="group relative inline-block">
              <FiInfo className="text-gray-500 cursor-pointer" size={20} />
              <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 bg-gray-800 text-white text-sm p-2 rounded-lg z-10">
                Min Lot: {params.minLot} <br />
                Lot Step: {params.lotStep} <br />
                Base USD: {params.baseUSD} <br />
                Points per pip: {params.pointsPerPip} <br />
                Base Points: {params.basePoints}
              </div>
            </div>
          </div>
        </div>

        {/* Lot inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-1">Min Lot:</label>
            <input
              type="number"
              value={minLot}
              onChange={(e) => setMinLot(e.target.value)}
              step="0.001"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Max Lot:</label>
            <input
              type="number"
              value={maxLot}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Lot Step:</label>
            <input
              type="number"
              value={lotStep}
              onChange={(e) => setLotStep(e.target.value)}
              step="0.001"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* SL & TP inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-1">Stop Loss (SL) pips:</label>
            <input
              type="number"
              value={sl}
              onChange={(e) => setSL(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Enter SL pips"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Take Profit (TP) pips:</label>
            <input
              type="number"
              value={tp}
              onChange={(e) => setTP(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter TP pips"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Lot Size</th>
                {sl && <th className="border border-gray-300 px-4 py-2">SL Loss (USD)</th>}
                {tp && <th className="border border-gray-300 px-4 py-2">TP Profit (USD)</th>}
              </tr>
            </thead>
            <tbody>
              {lotSizes.map((lot) => {
                const slLoss = sl ? -calculateUSD(parseFloat(sl), lot) : null;
                const tpProfit = tp ? calculateUSD(parseFloat(tp), lot) : null;
                const highlightTP = tpProfit === bestTPProfit;
                return (
                  <tr key={lot} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">{lot}</td>
                    {sl && <td className="border border-gray-300 px-4 py-2 text-red-600">${slLoss.toFixed(2)}</td>}
                    {tp && (
                      <td
                        className={`border border-gray-300 px-4 py-2 ${
                          highlightTP ? "bg-yellow-100 font-bold" : ""
                        }`}
                      >
                        ${tpProfit.toFixed(2)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
