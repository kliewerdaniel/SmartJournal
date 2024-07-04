# Smart Journal App Setup Guide


This guide will walk you through setting up a full-stack Smart Journal application using the MERN stack (MongoDB, Express, React, Node.js) with React Router v6.


## Backend Setup


1. Create a new directory for your project:
```bash
mkdir smart-journal
cd smart-journal
```


2. Initialize a new Node.js project:
```bash
npm init -y
```


3. Install necessary dependencies:
```bash
npm install express mongoose dotenv cors axios
npm install --save-dev nodemon concurrently
```


4. Create a `.gitignore` file:
```bash
echo "node_modules
.env" > .gitignore
```


5. Create a `server.js` file:
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
 .then(() => console.log('Connected to MongoDB'))
 .catch(err => console.error('Could not connect to MongoDB:', err));


const journalEntriesRouter = require('./routes/journalEntries');
const metricsRouter = require('./routes/metrics');
const habitsRouter = require('./routes/habits');


app.use('/api/journal-entries', journalEntriesRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/habits', habitsRouter);


if (process.env.NODE_ENV === 'production') {
 app.use(express.static('client/build'));
 app.get('*', (req, res) => {
   res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
 });
}


app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});
```


6. Create a `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/smart-journal
```


7. Create the necessary directories:
```bash
mkdir -p models routes api
```


8. Create the models:


`models/JournalEntry.js`:
```javascript
const mongoose = require('mongoose');


const journalEntrySchema = new mongoose.Schema({
 content: { type: String, required: true },
 date: { type: Date, default: Date.now },
 analysis: { type: String }
});


module.exports = mongoose.model('JournalEntry', journalEntrySchema);
```


`models/Metric.js`:
```javascript
const mongoose = require('mongoose');


const metricSchema = new mongoose.Schema({
 name: { type: String, required: true },
 value: { type: Number, required: true },
 date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Metric', metricSchema);
```


`models/Habit.js`:
```javascript
const mongoose = require('mongoose');


const habitSchema = new mongoose.Schema({
 name: { type: String, required: true },
 completed: { type: Boolean, default: false },
 date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Habit', habitSchema);
```


9. Create the routes:


`routes/journalEntries.js`:
```javascript
const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const { analyzeText } = require('../api/ollama');


router.get('/', async (req, res) => {
 try {
   const entries = await JournalEntry.find().sort({ date: -1 });
   res.json(entries);
 } catch (err) {
   res.status(500).json({ message: err.message });
 }
});


router.post('/', async (req, res) => {
 const entry = new JournalEntry({
   content: req.body.content
 });


 try {
   const analysis = await analyzeText(req.body.content);
   entry.analysis = analysis;
   const newEntry = await entry.save();
   res.status(201).json(newEntry);
 } catch (err) {
   res.status(400).json({ message: err.message });
 }
});


module.exports = router;
```


`routes/metrics.js`:
```javascript
const express = require('express');
const router = express.Router();
const Metric = require('../models/Metric');


router.get('/', async (req, res) => {
 try {
   const metrics = await Metric.find().sort({ date: -1 });
   res.json(metrics);
 } catch (err) {
   res.status(500).json({ message: err.message });
 }
});


router.post('/', async (req, res) => {
 const metric = new Metric({
   name: req.body.name,
   value: req.body.value
 });


 try {
   const newMetric = await metric.save();
   res.status(201).json(newMetric);
 } catch (err) {
   res.status(400).json({ message: err.message });
 }
});


module.exports = router;
```


`routes/habits.js`:
```javascript
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
```


10. Create the Ollama API file:


`api/ollama.js`:
```javascript
const axios = require('axios');


const analyzeText = async (text) => {
 try {
   const response = await axios.post('http://localhost:11434/api/generate', {
     model: 'llama2',
     prompt: `Analyze the following journal entry and provide insights: ${text}`
   });
   return response.data.response;
 } catch (error) {
   console.error('Error calling Ollama API:', error);
   return null;
 }
};


module.exports = { analyzeText };
```


## Frontend Setup


1. Create a new React app:
```bash
npx create-react-app client
cd client
```


2. Install necessary dependencies:
```bash
npm install axios react-router-dom@6 chart.js react-chartjs-2
```


3. Replace the contents of `src/App.js`:


```javascript
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import JournalEntry from './components/JournalEntry';
import MetricTracker from './components/MetricTracker';
import HabitTracker from './components/HabitTracker';
import InsightsDashboard from './components/InsightsDashboard';
import './App.css';


function App() {
 return (
   <Router>
     <div className="App">
       <nav>
         <ul>
           <li><Link to="/">Journal</Link></li>
           <li><Link to="/metrics">Metrics</Link></li>
           <li><Link to="/habits">Habits</Link></li>
           <li><Link to="/insights">Insights</Link></li>
         </ul>
       </nav>


       <Routes>
         <Route path="/" element={<JournalEntry />} />
         <Route path="/metrics" element={<MetricTracker />} />
         <Route path="/habits" element={<HabitTracker />} />
         <Route path="/insights" element={<InsightsDashboard />} />
       </Routes>
     </div>
   </Router>
 );
}


export default App;
```


4. Create the components:


`src/components/JournalEntry.js`:
```javascript
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
```


`src/components/MetricTracker.js`:
```javascript
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
```


`src/components/HabitTracker.js`:
```javascript
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
```


`src/components/InsightsDashboard.js`:
```javascript
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
```


5. Update `src/App.css` for basic styling:


```css
.App {
 font-family: Arial, sans-serif;
 max-width: 800px;
 margin: 0 auto;
 padding: 20px;
}


nav ul {
 list-style-type: none;
 padding: 0;
 display: flex;
 justify-content: space-around;
 background-color: #f0f0f0;
 padding: 10px 0;
}


nav ul li a {
 text-decoration: none;
 color: #333;
 font-weight: bold;
}


h2 {
 color: #2c3e50;
}


form {
 margin-bottom: 20px;
}


input[type="text"],
input[type="number"],
textarea {
 width: 100%;
 padding: 10px;
 margin-bottom: 10px;
}


button {
 background-color: #3498db;
 color: white;
 border: none;
 padding: 10px 20px;
 cursor: pointer;
}


button:hover {
 background-color: #2980b9;
}


ul {
 list-style-type: none;
 padding: 0;
}


li {
 background-color: #f9f9f9;
 margin-bottom: 10px;
 padding: 10px;
 border-radius: 5px;
}
```


6. Update `package.json` in the root directory to include scripts for running both backend and frontend:


```json
{
 "name": "smart-journal",
 "version": "1.0.0",
 "description": "",
 "main": "server.js",
 "scripts": {
   "start": "node server.js",
   "server": "nodemon server.js",
   "client": "npm start --prefix client",
   "dev": "concurrently \"npm run server\" \"npm run client\""
 },
 "keywords": [],
 "author": "",
 "license": "ISC",
 "dependencies": {
   "axios": "^0.21.1",
   "cors": "^2.8.5",
   "dotenv": "^10.0.0",
   "express": "^4.17.1",
   "mongoose": "^6.0.12"
 },
 "devDependencies": {
   "concurrently": "^6.3.0",
   "nodemon": "^2.0.14"
 }
}
```


7. Add a proxy to the client's `package.json`:


```json
{
 "name": "client",
 "version": "0.1.0",
 "private": true,
 "dependencies": {
   "@testing-library/jest-dom": "^5.11.4",
   "@testing-library/react": "^11.1.0",
   "@testing-library/user-event": "^12.1.10",
   "axios": "^0.21.1",
   "chart.js": "^3.5.1",
   "react": "^17.0.2",
   "react-chartjs-2": "^3.0.4",
   "react-dom": "^17.0.2",
   "react-router-dom": "^6.0.0",
   "react-scripts": "4.0.3",
   "web-vitals": "^1.0.1"
 },
 "scripts": {
   "start": "react-scripts start",
   "build": "react-scripts build",
   "test": "react-scripts test",
   "eject": "react-scripts eject"
 },
 "eslintConfig": {
   "extends": [
     "react-app",
     "react-app/jest"
   ]
 },
 "browserslist": {
   "production": [
     ">0.2%",
     "not dead",
     "not op_mini all"
   ],
   "development": [
     "last 1 chrome version",
     "last 1 firefox version",
     "last 1 safari version"
   ]
 },
 "proxy": "http://localhost:5000"
}
```


## Running the Application


1. Make sure MongoDB is running on your local machine.


2. In the root directory of your project, run:
  ```
  npm run dev
  ```


This command will start both the backend server and the React development server concurrently.


3. Open your browser and navigate to `http://localhost:3000`. You should see the Smart Journal application running.


## Additional Notes


- Make sure you have Ollama set up and running on your local machine for the text analysis feature to work.
- This setup provides a basic structure for the Smart Journal app. You may want to add more features, improve the UI, or add authentication as you develop the application further.
- Remember to handle errors and edge cases in a production environment, and consider adding unit and integration tests for your components and API endpoints.


That's it! You now have a fully functional Smart Journal application using the MERN stack with React Router v6. Happy coding!



