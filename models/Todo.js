const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Todo text is required'],
        trim: true,
        maxlength: [500, 'Todo text cannot exceed 500 characters']
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

todoSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

todoSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.model('Todo', todoSchema);