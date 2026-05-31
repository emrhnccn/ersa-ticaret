import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft, Clock, Share2, MessageCircle } from 'lucide-react';

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p: { slug: string; }) => p.slug === params.slug);
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

  // Makaleye özel akıllı WhatsApp mesajı
  const whatsappMessage = `Merhaba, Ersa Ticaret sitenizdeki "${post.title}" başlıklı rehberi okudum. Teknik destek ve parça durumu hakkında bilgi almak istiyorum.\n\nRehber Linki: https://ersaticaret.com/rehber/${post.slug}`;
  const whatsappUrl = `https://wa.me/905525843073?text=${encodeURIComponent(whatsappMessage)}`;

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
          
          <div className="prose prose-lg prose-blue max-w-none text-slate-600 mb-12">
            <p>
              Kombi veya beyaz eşya arızalarında doğru yedek parçayı seçmek, cihazın ömrünü uzatmanın en önemli adımıdır. 
              Cihazınızda yaşadığınız bu problem genellikle donanımsal bir parçanın ömrünü tamamlaması veya dış etkenler sebebiyle 
              hasar görmesinden kaynaklanır. Ersa Ticaret olarak, sitemizde bulunan binlerce orijinal ve A kalite OEM parçası ile size en güvenilir hizmeti sunmayı hedefliyoruz.
            </p>
            <p>
              Arızayı tam olarak tespit ettikten sonra cihazınızın marka ve modeline birebir uyumlu parçayı sipariş edebilirsiniz. Parça değişimi sırasında güvenlik önlemlerini almayı ve gerekiyorsa uzman bir servisten destek almayı unutmayın.
            </p>
          </div>

          {/* DİNAMİK WHATSAPP DESTEK ALANI */}
          <div className="mt-8 bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Uzman Desteğine mi İhtiyacınız Var?</p>
              <p className="text-lg font-bold text-slate-800">Teknik destek ve doğru parça seçimi için bize ulaşın.</p>
              <p className="text-sm text-slate-500 mt-1">Cihazınızın fotoğrafını atın, doğru parçayı hemen bulalım.</p>
            </div>
            
            <a 
              href={whatsappUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-emerald-500/30 active:scale-95 whitespace-nowrap shrink-0"
            >
              <MessageCircle size={22} /> WhatsApp'tan Destek Al
            </a>
          </div>
          
        </div>
      </div>

    </div>
  );
}