const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const TARGET_CATEGORIES = [
  { url: 'https://www.online-yedekparca.com/kombi-yedek-parca', targetName: 'Kombi Kartı' },
  { url: 'https://www.online-yedekparca.com/camasir-makinesi-yedek-parca', targetName: 'Çamaşır Makinesi' },
  { url: 'https://www.online-yedekparca.com/bulasik-makinesi-yedek-parca', targetName: 'Bulaşık Makinesi' },
  { url: 'https://www.online-yedekparca.com/buzdolabi-yedek-parca', targetName: 'Buzdolabı' },
  { url: 'https://www.online-yedekparca.com/klima-yedek-parca', targetName: 'Klima' },
  { url: 'https://www.online-yedekparca.com/sogutma-grubu-yedek-parca', targetName: 'Soğutma Grubu' },
  { url: 'https://www.online-yedekparca.com/firin-ocak-aspirator-yedek-parca', targetName: 'Fırın, Ocak, Aspiratör' },
  { url: 'https://www.online-yedekparca.com/elektrik-supurgesi-yedek-parca', targetName: 'Elektrik Süpürgesi' },
  { url: 'https://www.online-yedekparca.com/kucuk-ev-aletleri-yedek-parca', targetName: 'Küçük Ev Aletleri' },
  { url: 'https://www.online-yedekparca.com/el-aletleri', targetName: 'El Aletleri' },
  { url: 'https://www.online-yedekparca.com/rezistanslar-yedek-parca', targetName: 'Rezistanslar' },
  { url: 'https://www.online-yedekparca.com/sofben-termosifon-yedek-parca', targetName: 'Sofben Termosifon' },
  { url: 'https://www.online-yedekparca.com/sanayi-fan-motoru-cesitleri', targetName: 'Sanayi Fan Motoru Çeşitleri' }
];

const ITEMS_PER_CATEGORY = 15; 
const scrapedProducts = [];

async function scrapeData() {
  console.log("🚀 Veri çekme operasyonu başlatılıyor...\n");

  for (const category of TARGET_CATEGORIES) {
    try {
      const response = await axios.get(category.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      const $ = cheerio.load(response.data);
      let count = 0;

      $('.product-item').each((index, element) => {
        if (count >= ITEMS_PER_CATEGORY) return false;

        const title = $(element).find('.productDescription').text().trim();
        const brand = $(element).find('.productBrand').text().trim() || 'Genel';
        let imageUrl = $(element).find('.imgInner img').attr('data-src') || $(element).find('.imgInner img').attr('src');
        const code = `OEM-${Math.floor(10000 + Math.random() * 90000)}`;

        if (imageUrl && imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }

        if (title && imageUrl) {
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

          scrapedProducts.push({
            slug: slug + '-' + Math.floor(1000 + Math.random() * 9000), 
            title: title,
            code: code,
            category: category.targetName,
            brand: brand,
            image: imageUrl,
            inStock: true,
            // MONGODB HATASINI ÇÖZEN KISIM (Zorunlu alan eklendi)
            description: `${brand} marka, ${category.targetName} cihazları ile tam uyumlu orijinal veya A kalite yedek parça.`
          });
          count++;
        }
      });
    } catch (error) {
      console.error(`   ❌ HATA: ${category.url}`, error.message);
    }
  }

  // VERCEL IMPORT HATALARINI ÇÖZEN KISIM: Eksik olan array'leri dosyanın sonuna otomatik ekliyoruz.
  const fileContent = `export const products = ${JSON.stringify(scrapedProducts, null, 2)};

// Geçici Veriler (Vercel Build Hatalarını Önlemek İçin)
export const services = [
  { slug: "orijinal-yedek-parca", title: "Orijinal Yedek Parça Tedariği", description: "Tüm marka ve modellere uygun orijinal garantili yedek parça satışı." }
];

// SEO Uyumlu Teknik Rehber Makaleleri
export const blogPosts = [
  { slug: "kombi-bakim-rehberi", title: "Kış Gelmeden Kombi Bakımı Nasıl Yapılmalı?", description: "Kış aylarına girmeden önce kombinizi nasıl hazırlamanız gerektiğine dair hayati ipuçları ve değiştirilmesi gereken filtreler." },
  { slug: "camasir-makinesi-su-bosaltmiyor", title: "Çamaşır Makinesi Su Boşaltmıyor Ne Yapmalıyım?", description: "Çamaşır makinenizin suyunu boşaltmamasının en yaygın nedenleri, pompa motoru arızası tespiti ve çözüm yolları." },
  { slug: "bulasik-makinesi-iyi-yikamiyor", title: "Bulaşık Makinesi İyi Yıkamıyor Sorunu ve Çözümü", description: "Bulaşık makineniz bardakları çiziyor veya lekeli bırakıyorsa kontrol etmeniz gereken parçalar ve rezistans sorunları." },
  { slug: "kombi-su-eksiltiyor", title: "Kombi Su Eksiltiyor (Basınç Düşüyor): Nedenleri", description: "Kombi su basıncı sürekli düşüyorsa genleşme tankı, eşanjör veya emniyet ventili arızası nasıl tespit edilir?" },
  { slug: "buzdolabi-sogutmuyor", title: "Buzdolabı Alt veya Üst Bölme Soğutmuyor Arızası", description: "No-frost buzdolaplarında soğutma probleminin ana kaynakları (rezistans, fan, sensör arızaları) ve parça seçimi." },
  { slug: "orijinal-yedek-parca-onemi", title: "Orijinal Yedek Parça Kullanmanın Cihaz Ömrüne Etkisi", description: "Kombi ve beyaz eşya onarımında neden A kalite veya orijinal yedek parça tercih edilmelidir? Merdiven altı parçaların zararları." }
];
`;
  
  fs.writeFileSync('./lib/data.ts', fileContent, 'utf8');
  console.log("🎉 OPERASYON TAMAMLANDI! 'lib/data.ts' başarıyla güncellendi.");
}

scrapeData();