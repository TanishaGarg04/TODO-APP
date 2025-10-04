# Todo App - Full Stack

A beautiful and responsive todo application built with Node.js, Express, MongoDB, and Mongoose.

## Features

- ✅ Add, edit, delete todos
- ✅ Mark todos as complete/incomplete
- ✅ Filter todos (All, Active, Completed)
- ✅ Clear all completed todos
- ✅ Responsive design for mobile and desktop
- ✅ Real-time statistics
- ✅ Touch-friendly mobile interactions
- ✅ Persistent data storage with MongoDB

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone or download the project**
   ```bash
   cd todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the connection string in `config.js` if needed
   - Default connection: `mongodb://localhost:27017/todoapp`

4. **Start the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Or production mode
   npm start
   ```

5. **Open your browser**
   - Visit `http://localhost:3000`
   - The app will be available and ready to use!

## API Endpoints

- `GET /api/todos` - Get all todos (with optional filter)
- `GET /api/todos/stats` - Get todo statistics
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `DELETE /api/todos/completed` - Delete all completed todos

## Project Structure

```
todo-app/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
├── models/                # Database models
│   └── Todo.js           # Todo schema
├── routes/               # API routes
│   └── todos.js          # Todo routes
├── config/               # Configuration
│   └── database.js       # Database connection
├── config.js             # App configuration
├── server.js             # Main server file
└── package.json          # Dependencies
```

## Usage

1. **Adding Todos**: Type in the input field and press Enter or click the + button
2. **Completing Todos**: Click the circle next to any todo
3. **Editing Todos**: Click the edit button (pencil icon)
4. **Deleting Todos**: Click the delete button (trash icon)
5. **Filtering**: Use the All/Active/Completed buttons
6. **Clear Completed**: Click "Clear Completed" to remove all completed todos

## Mobile Features

- Touch-friendly interface
- Swipe gestures for actions
- Responsive design
- Optimized for mobile browsers

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

## Production

To run in production mode:
```bash
npm start
```

The app will be available at `http://localhost:3000` (or your configured PORT).

## Database

The app uses MongoDB to store todos. Each todo document includes:
- `text`: Todo content
- `completed`: Boolean status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Error Handling

The app includes comprehensive error handling for:
- Network connectivity issues
- Database connection problems
- Invalid data input
- API request failures

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - feel free to use this project for learning or commercial purposes.
"# TODO-APP" 
