/**
 * Get support and resistance for the give ohlc data
 */
function getSupportResistance({ ohlcData = [], pviotPointPeriod = 10, lookbackPeriod = 300, channelWidth = 10 }) {
  const OPEN_PRICE_INDEX = 1;
  const HIGH_PRICE_INDEX = 2;
  const LOW_PRICE_INDEX = 3;
  const CLOSE_PRICE_INDEX = 4;

  // Basic Setup
  const klineData = ohlcData.slice(ohlcData.length - lookbackPeriod, ohlcData.length);
  if (klineData.length < lookbackPeriod) {
    return { error: "Not enough data to find support and resistance" };
  }

  // 1. Calculate the PH & PL Values
  const startingIndex = pviotPointPeriod;
  const PHValues = [];
  const PLValues = [];
  for (let i = startingIndex; i < klineData.length; i++) {
    const ohlcDataForPivoteCheck = klineData.slice(i - pviotPointPeriod, i + pviotPointPeriod + 1);
    const high = ohlcDataForPivoteCheck.map((ohlc) => parseFloat(ohlc[HIGH_PRICE_INDEX]));
    const low = ohlcDataForPivoteCheck.map((ohlc) => parseFloat(ohlc[LOW_PRICE_INDEX]));
    const PH = pivotHigh(high, pviotPointPeriod, (baseIndex = i));
    const PL = pivotLow(low, pviotPointPeriod, (baseIndex = i));
    if (PH) PHValues.push(PH);
    if (PL) PLValues.push(PL);
  }

  // 2. Calculate Support Lines
  let highestPivotPoint = Math.max(...klineData.map((d) => d[HIGH_PRICE_INDEX]));
  let lowestPivotPoint = Math.min(...klineData.map((d) => d[LOW_PRICE_INDEX]));
  let channelSize = (highestPivotPoint - lowestPivotPoint) * (channelWidth / 100);
  console.log({
    highestPivotPoint,
    lowestPivotPoint,
    channelSize,
  });
  let validatedPivotPointIndexes = [];
  let SRLevels = [];
  for (let i = lookbackPeriod - 1; i >= 0; i--) {
    const PH = PHValues.find((ph) => ph.phIndex === i);
    const PL = PLValues.find((pl) => pl.plIndex === i);
    if (PH || PL) {
      if (!validatedPivotPointIndexes.includes(i)) {
        const pivotPointPrice = PH ? klineData[i][HIGH_PRICE_INDEX] : klineData[i][LOW_PRICE_INDEX];
        channelUpperLevel = pivotPointPrice + channelSize;
        channelLowerLevel = pivotPointPrice - channelSize;

        let totalPivotPointInChannel = 0;
        for (let j = lookbackPeriod - 1; j >= 0; j--) {
          const PH = PHValues.find((ph) => ph.phIndex === j);
          const PL = PLValues.find((pl) => pl.plIndex === j);
          if (PH || PL) {
            let change = false;
            if (!validatedPivotPointIndexes.includes(j)) {
              if (
                PH &&
                klineData[j][HIGH_PRICE_INDEX] <= channelUpperLevel &&
                klineData[j][HIGH_PRICE_INDEX] >= channelLowerLevel
              ) {
                totalPivotPointInChannel += 1;
                change = true;
              }

              if (
                PL &&
                klineData[j][LOW_PRICE_INDEX] <= channelUpperLevel &&
                klineData[j][LOW_PRICE_INDEX] >= channelLowerLevel
              ) {
                totalPivotPointInChannel += 1;
                change = true;
              }
            }

            if (change) {
              validatedPivotPointIndexes.push(j);
            }
          }
        }

        if (totalPivotPointInChannel >= 1) {
          if (PH) {
            SRLevels.push(klineData[i][HIGH_PRICE_INDEX]);
          }
          if (PL) {
            SRLevels.push(klineData[i][LOW_PRICE_INDEX]);
          }
        }
      }
    }
  }

  SRLevels = SRLevels.sort((a, b) => a - b);

  return {
    SRLevels,
    PHValues,
    PLValues,
  };
}

/**
 * Get PL (Pivot Low) value for the given series data
 */
function pivotLow(series, period, baseIndex) {
  let pl = series[0];
  let plIndex = 0;
  if (series.length < 2 * period + 1) return null;
  for (let i = 0; i < series.length; i++) {
    const cur = series[i];
    if (cur > -1) {
    } else {
      break;
    }

    if (cur < pl) {
      pl = cur;
      plIndex = i;
    }
  }
  const isPivotLow = plIndex === period;
  if (!isPivotLow) return null;
  return {
    plIndex: baseIndex,
    pl,
  };
}

/**
 * Get PH (Pivot High) value for the given series data
 */
function pivotHigh(series, period, baseIndex) {
  let ph = 0;
  let phIndex = 0;
  if (series.length < 2 * period + 1) return null;
  for (let i = 0; i < series.length; i++) {
    const cur = series[i];
    if (cur > -1) {
    } else {
      break;
    }

    if (cur > ph) {
      ph = cur;
      phIndex = i;
    }
  }

  const isPivotHigh = phIndex === period;

  if (!isPivotHigh) return null;

  return {
    phIndex: baseIndex,
    ph,
  };
}

module.exports = {
  getSupportResistance,
};
