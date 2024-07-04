const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ date: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const habit = new Habit({
    name: req.body.name
  });

  try {
    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (habit == null) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    habit.completed = !habit.completed;
    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;