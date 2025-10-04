const mongoose = require('mongoose');

const connectDB = () => {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/todoapp";
    mongoose.connect(mongoURI)
        .then(() => console.log("MongoDB Connected"))
        .catch(err => console.log(err));
};

module.exports = connectDB;
