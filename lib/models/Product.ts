import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // Parça kodu benzersiz olmalı
  image: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // URL uzantısı benzersiz olmalı
  description: { type: String, required: true },
  compatibility: [{ type: String }], // Uyumlu modelleri bir dizi (array) olarak tutarız
}, { timestamps: true }); // Ne zaman eklendiğini/güncellendiğini otomatik tutar

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);