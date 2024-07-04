import React, { useState, useEffect } from 'react';
import axios from 'axios';

function JournalEntry() {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get('/api/journal-entries');
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/journal-entries', { content });
      setContent('');
      fetchEntries();
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  return (
    <div>
      <h2>Journal Entries</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your journal entry here..."
          rows="4"
          cols="50"
        />
        <button type="submit">Save Entry</button>
      </form>
      <ul>
        {entries.map((entry) => (
          <li key={entry._id}>
            <p>{new Date(entry.date).toLocaleString()}: {entry.content}</p>
            {entry.analysis && <p><strong>Analysis:</strong> {entry.analysis}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JournalEntry;