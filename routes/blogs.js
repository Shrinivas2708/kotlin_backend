// routes/blogs.js
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// GET /api/blogs -> get all blogs (most recent first)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(100); // keep simple
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/blogs -> create a blog
router.post('/', async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body required' });

    const blog = new Blog({ title, body, tags: Array.isArray(tags) ? tags : [] });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/blogs/:id -> delete by id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
