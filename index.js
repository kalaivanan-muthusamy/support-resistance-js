const express = require('express');
const app = express();
const port = 3010;
const kline = require('./data/kline.json');
const { getSupportResistance } = require('./sr');

app.use(express.static('static'));

app.get('/', async (req, res) => {
  const pivotValues = getSupportResistance({
    ohlcData: kline.map((a) => [
      a[0],
      parseFloat(a[1]),
      parseFloat(a[2]),
      parseFloat(a[3]),
      parseFloat(a[4]),
      parseFloat(a[5]),
    ]),
  });

  res.json({
    pivotValues,
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
