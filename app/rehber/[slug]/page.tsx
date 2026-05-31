import { blogPosts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ChevronLeft, MessageCircle, Info } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return { title: 'Yazı Bulunamadı' };
  return {
    title: `${post.title} | Ersa Ticaret Rehber`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/rehber" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-8 transition-colors font-medium">
        <ChevronLeft size={20} className="mr-1" /> Rehbere Dön
      </Link>

      <article className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm">
        <div className="mb-8 border-b border-slate-100 pb-8">
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-lg mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* İçerik Kısmı */}
        <div className="prose prose-slate prose-lg max-w-none whitespace-pre-line mb-12 text-slate-700">
          {post.content}
        </div>

        {/* CTA (Eylem Çağrısı) Bölümü */}
        <div className="bg-blue-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-100">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
              <Info size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Arızalı Parçayı Tespit Ettiniz mi?</h3>
              <p className="text-slate-600 text-sm">Gerekli olan yedek parçayı, bölgenin en büyük tedarikçisi Ersa Ticaret'ten güvenle temin edebilirsiniz.</p>
            </div>
          </div>
          <a 
            href={`https://wa.me/905525843073?text=Merhaba,%20web%20sitenizdeki%20"${post.title}"%20yazınızı%20okudum.%20Parça%20sormak%20istiyorum.`}
            target="_blank"
            className="w-full md:w-auto px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shrink-0 whitespace-nowrap"
          >
            <MessageCircle size={20} /> Yedek Parça Sor
          </a>
        </div>
      </article>
    </div>
  );
}