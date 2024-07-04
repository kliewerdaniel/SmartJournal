import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get('/api/habits');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/habits', { name: newHabit });
      setNewHabit('');
      fetchHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const toggleHabit = async (id) => {
    try {
      await axios.patch(`/api/habits/${id}`);
      fetchHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  return (
    <div>
      <h2>Habit Tracker</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="New Habit"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
        />
        <button type="submit">Add Habit</button>
      </form>
      <ul>
        {habits.map((habit) => (
          <li key={habit._id}>
            <input
              type="checkbox"
              checked={habit.completed}
              onChange={() => toggleHabit(habit._id)}
            />
            {habit.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HabitTracker;