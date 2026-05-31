import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);