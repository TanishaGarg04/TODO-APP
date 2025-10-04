const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Todo = require('../models/Todo');

router.get('/', async (req, res) => {
    try {
        const { filter } = req.query;
        let query = {};
        
        if (filter === 'active') {
            query.completed = false;
        } else if (filter === 'completed') {
            query.completed = true;
        }
        
        const todos = await Todo.find(query).sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const total = await Todo.countDocuments();
        const completed = await Todo.countDocuments({ completed: true });
        const active = total - completed;
        
        res.json({ total, completed, active });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Todo text is required' });
        }
        
        const todo = new Todo({ text: text.trim() });
        await todo.save();
        
        res.status(201).json(todo);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create todo' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { text, completed } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid todo ID' });
        }
        
        const updateData = {};
        if (text !== undefined) {
            if (!text || text.trim() === '') {
                return res.status(400).json({ error: 'Todo text is required' });
            }
            updateData.text = text.trim();
        }
        if (completed !== undefined) {
            updateData.completed = completed;
        }
        
        const todo = await Todo.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.json(todo);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update todo' });
    }
});

router.delete('/', async (req, res) => {
    try {
        const result = await Todo.deleteMany({});
        res.json({ message: `All todos deleted`, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete all todos' });
    }
});

router.delete('/completed', async (req, res) => {
    try {
        const result = await Todo.deleteMany({ completed: true });
        res.json({ 
            message: `${result.deletedCount} completed todos deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete completed todos' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid todo ID' });
        }
        
        const todo = await Todo.findByIdAndDelete(id);
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});

module.exports = router;