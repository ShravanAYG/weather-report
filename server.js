const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();

const PORT = process.env.PORT || 3000;
const CSV_FILE = './out20250616081734_st2025051501_ed2025061601_regionNum105_16_247_704.csv';

function getLatestData(res) {
  const rows = [];

  fs.createReadStream(CSV_FILE)
    .pipe(csv(['date', 'unconditional_average_rain', 'conditional_average_rain', 'accumulated_rain', 'satellite_flag']))
    .on('data', (row) => {
      if (row.date && !row.date.startsWith('#')) {
        rows.push(row);
      }
    })
    .on('end', () => {
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No data available' });
      }

      const latest = rows[rows.length - 1];
      res.json({
        timestamp: latest.date,
        unconditional_average_rain: parseFloat(latest.unconditional_average_rain),
        conditional_average_rain: parseFloat(latest.conditional_average_rain),
        accumulated_rain: parseFloat(latest.accumulated_rain),
        satellite_flag: latest.satellite_flag,
      });
    })
    .on('error', (err) => {
      console.error('CSV Read Error:', err);
      res.status(500).json({ error: 'Failed to read CSV' });
    });
}

// 👇 Respond to both "/" and "/latest"
app.get('/', (req, res) => {
  getLatestData(res);
});

app.get('/latest', (req, res) => {
  getLatestData(res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

