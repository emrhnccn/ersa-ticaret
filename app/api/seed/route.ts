import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { Post } from '@/lib/models/Post';
import { products, blogPosts } from '@/lib/data';

export async function GET() {
  try {
    // 1. Veritabanına bağlan
    await connectDB();

    // 2. Çift kayıt olmasın diye veritabanını temizle
    await Product.deleteMany({});
    await Post.deleteMany({});

    // 3. lib/data.ts içindeki verileri MongoDB'ye yaz
    await Product.insertMany(products);
    await Post.insertMany(blogPosts);

    return NextResponse.json({ 
      durum: 'BAŞARILI', 
      mesaj: 'Tüm ürünler ve rehber yazıları MongoDB ye eklendi!' 
    });
  } catch (error) {
    console.error("MongoDB Hatası:", error);
    return NextResponse.json({ durum: 'HATA', mesaj: 'Bağlantı veya yazma hatası oluştu.' }, { status: 500 });
  }
}