import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft, Clock, Share2, MessageCircle, ChevronRight, BookOpen } from 'lucide-react';

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p: { slug: string; }) => p.slug === params.slug);
  if (!post) return { title: 'Yazı Bulunamadı' };
  
  const canonicalUrl = `https://www.ersaticaret.com/rehber/${params.slug}`;

  return {
    title: `${post.title} - Teknik Rehber`,
    description: post.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.title} | Ersa Ticaret`,
      description: post.description,
      url: canonicalUrl,
      type: 'article',
    },
  };
}

export default function RehberDetayPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Organization',
      name: 'Ersa Ticaret Teknik Ekibi',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ersa Ticaret',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.ersaticaret.com/logo.png',
      },
    },
    mainEntityOfPage: `https://www.ersaticaret.com/rehber/${post.slug}`,
  };

  // Diğer rehberler (mevcut hariç)
  const otherPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const whatsappMessage = `Merhaba, Ersa Ticaret sitenizdeki "${post.title}" başlıklı rehberi okudum. Teknik destek ve parça durumu hakkında bilgi almak istiyorum.\n\nRehber Linki: https://www.ersaticaret.com/rehber/${post.slug}`;
  const whatsappUrl = `https://wa.me/905525843073?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      
      {/* ÜST BAR */}
      <div className="bg-slate-900 pt-8 pb-32 relative">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <Link href="/rehber" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Tüm Rehberlere Dön
          </Link>
          
          {/* Breadcrumb */}
          <div className="flex items-center text-sm font-medium text-slate-500 mb-6">
            <Link href="/" className="hover:text-blue-400 transition-colors">Ana Sayfa</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link href="/rehber" className="hover:text-blue-400 transition-colors">Rehber</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-blue-400 line-clamp-1">{post.title}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2"><Clock size={16} /> 3 Dk Okuma</span>
            <span className="flex items-center gap-2"><BookOpen size={16} /> Teknik Rehber</span>
          </div>
        </div>
      </div>

      {/* İÇERİK KISMI */}
      <div className="max-w-4xl mx-auto px-4 relative z-20 -mt-16 w-full">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-900/5 border border-slate-100">
          
          {/* Giriş Açıklaması */}
          <p className="text-xl font-medium text-slate-700 mb-10 leading-relaxed border-l-4 border-blue-500 pl-6 bg-blue-50/50 py-4 rounded-r-xl">
            {post.description}
          </p>
          
          {/* BENZERSİZ İÇERİK — Her makale için farklı */}
          <div className="space-y-10">
            {post.content && post.content.map((section: any, index: number) => (
              <div key={index}>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-black shrink-0">
                    {index + 1}
                  </span>
                  {section.heading}
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed pl-11">
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          {/* BİLGİ NOTU */}
          <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <p className="text-amber-800 text-sm font-medium leading-relaxed">
              <strong>⚠️ Önemli Not:</strong> Tüm elektrikli cihaz tamirlerinde güvenliğiniz için cihazın fişini çekin ve su bağlantılarını kapatın. 
              Emin olmadığınız durumlarda yetkili servis desteği alınız. Ersa Ticaret olarak size her aşamada teknik destek sunabiliriz.
            </p>
          </div>

          {/* WHATSAPP DESTEK ALANI */}
          <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Uzman Desteğine mi İhtiyacınız Var?</p>
              <p className="text-lg font-bold text-white">Teknik destek ve doğru parça seçimi için bize ulaşın.</p>
              <p className="text-sm text-slate-400 mt-1">Cihazınızın fotoğrafını atın, doğru parçayı hemen bulalım.</p>
            </div>
            
            <a 
              href={whatsappUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-emerald-500/30 active:scale-95 whitespace-nowrap shrink-0"
            >
              <MessageCircle size={22} /> WhatsApp&apos;tan Destek Al
            </a>
          </div>
          
        </div>

        {/* DİĞER REHBERLER */}
        {otherPosts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-8">Diğer Rehberler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherPosts.map((op) => (
                <Link 
                  key={op.slug} 
                  href={`/rehber/${op.slug}`}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <h4 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{op.title}</h4>
                  <p className="text-slate-500 text-sm line-clamp-2">{op.description}</p>
                  <span className="inline-flex items-center text-sm font-bold text-blue-600 mt-4 group-hover:gap-2 transition-all">
                    Oku <ChevronRight size={14} className="ml-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}