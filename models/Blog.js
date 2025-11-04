
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  body:  { type: String, required: true },
  tags:  { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', BlogSchema);
