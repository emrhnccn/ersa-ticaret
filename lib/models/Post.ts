import mongoose from 'mongoose';

// İçerik bölümleri için alt şema
const contentSectionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Teknik Rehber' },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  description: { type: String },
  content: { type: [contentSectionSchema], default: [] },
}, { timestamps: true });

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);