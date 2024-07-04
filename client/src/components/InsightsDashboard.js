import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function InsightsDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchEntries();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get('/api/metrics');
      setMetrics(res.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/api/journal-entries');
      setEntries(res.data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const data = {
    labels: metrics.map(m => new Date(m.date).toLocaleDateString()),
    datasets: [{
      label: 'Metric Values',
      data: metrics.map(m => m.value),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Metrics Over Time',
      },
    },
  };

  return (
    <div>
      <h2>Insights Dashboard</h2>
      <Line data={data} options={options} />
      <h3>Recent Journal Entries</h3>
      <ul>
        {entries.slice(0, 5).map((entry) => (
          <li key={entry._id}>
            <p>{new Date(entry.date).toLocaleDateString()}: {entry.content.substring(0, 100)}...</p>
            {entry.analysis && <p><strong>Analysis:</strong> {entry.analysis}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InsightsDashboard;