import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MetricTracker() {
  const [metrics, setMetrics] = useState([]);
  const [newMetric, setNewMetric] = useState({ name: '', value: '' });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/metrics', newMetric);
      setNewMetric({ name: '', value: '' });
      fetchMetrics();
    } catch (error) {
      console.error('Error adding metric:', error);
    }
  };

  return (
    <div>
      <h2>Metric Tracker</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Metric Name"
          value={newMetric.name}
          onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Metric Value"
          value={newMetric.value}
          onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
        />
        <button type="submit">Add Metric</button>
      </form>
      <ul>
        {metrics.map((metric) => (
          <li key={metric._id}>{metric.name}: {metric.value}</li>
        ))}
      </ul>
    </div>
  );
}

export default MetricTracker;