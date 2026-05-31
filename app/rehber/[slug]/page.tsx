import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return { title: 'Yazı Bulunamadı | Ersa Ticaret' };
  
  return {
    title: `${post.title} | Ersa Ticaret Rehber`,
    description: post.description,
  };
}

export default function RehberDetayPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      
      {/* ÜST BAR */}
      <div className="bg-slate-900 pt-8 pb-32 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <Link href="/rehber" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Tüm Rehberlere Dön
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2"><Clock size={16} /> 3 Dk Okuma</span>
            <button className="flex items-center gap-2 hover:text-white transition-colors"><Share2 size={16} /> Paylaş</button>
          </div>
        </div>
      </div>

      {/* İÇERİK KISMI */}
      <div className="max-w-4xl mx-auto px-4 relative z-20 -mt-16 w-full">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-900/5 border border-slate-100">
          
          <p className="text-xl font-medium text-slate-700 mb-10 leading-relaxed">
            {post.description}
          </p>
          
          <div className="prose prose-lg prose-blue max-w-none text-slate-600">
            <p>
              Kombi veya beyaz eşya arızalarında doğru yedek parçayı seçmek, cihazın ömrünü uzatmanın en önemli adımıdır. 
              Ersa Ticaret olarak, sitemizde bulunan binlerce orijinal ve A kalite OEM parçası ile size en güvenilir hizmeti 
              sunmayı hedefliyoruz.
            </p>
            <br />
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Uzman Desteğine mi İhtiyacınız Var?</h3>
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <p className="text-slate-700 mb-0">
                Bu rehberin detaylı teknik dökümanları ustalarımız tarafından hazırlanmaktadır. Hangi parçayı alacağınızdan 
                emin değilseniz, hemen sağ alt köşedeki <strong>WhatsApp</strong> ikonuna tıklayarak arızalı cihazınızın 
                fotoğrafını bize gönderebilir ve anında teknik destek alabilirsiniz.
              </p>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}