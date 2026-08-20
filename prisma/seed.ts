import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { products as rawProducts } from '../lib/data';

const prisma = new PrismaClient();

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o'
  };
  return text
    .split('')
    .map(c => trMap[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🌱 ERSA Ticaret B2B + B2C veritabanı tohumlama (seeding) başlatılıyor...');

  // 1. Temizlik
  console.log('🧹 Eski veriler temizleniyor...');
  await prisma.auditLog.deleteMany();
  await prisma.currentAccountTransaction.deleteMany();
  await prisma.currentAccount.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.priceRule.deleteMany();
  await prisma.supplierProduct.deleteMany();
  await prisma.productDocument.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.companyMember.deleteMany();
  await prisma.company.deleteMany();
  await prisma.customerGroup.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.user.deleteMany();

  // 2. Müşteri Grupları (Customer Groups)
  console.log('👥 Müşteri grupları oluşturuluyor...');
  const groupDefault = await prisma.customerGroup.create({
    data: {
      name: 'Standart B2C Müşteriler',
      code: 'B2C',
      description: 'Bireysel perakende müşteriler (Liste Fiyatı)',
      isDefault: true,
    }
  });

  const groupA = await prisma.customerGroup.create({
    data: {
      name: 'A Grubu Bayiler (%15 İndirim)',
      code: 'GROUP_A',
      description: 'Yüksek hacimli yetkili servis ve bölge bayileri',
    }
  });

  const groupB = await prisma.customerGroup.create({
    data: {
      name: 'B Grubu Bayiler (%10 İndirim)',
      code: 'GROUP_B',
      description: 'Düzenli alım yapan teknik servisler ve montajcılar',
    }
  });

  const groupVIP = await prisma.customerGroup.create({
    data: {
      name: 'VIP Toptancılar (%20 İndirim)',
      code: 'GROUP_VIP',
      description: 'Toptan parça dağıtıcıları ve zincir servisler',
    }
  });

  // 3. Döviz Kurları (Exchange Rates)
  console.log('💱 Döviz kurları kaydediliyor...');
  await prisma.exchangeRate.createMany({
    data: [
      { base: 'EUR', quote: 'TRY', rate: 38.50, source: 'tcmb', fetchedAt: new Date() },
      { base: 'USD', quote: 'TRY', rate: 36.20, source: 'tcmb', fetchedAt: new Date() },
      { base: 'TRY', quote: 'TRY', rate: 1.00, source: 'fixed', fetchedAt: new Date() },
    ]
  });

  // 4. Kullanıcılar & Şirketler (Users & B2B Companies)
  console.log('🏢 Kullanıcılar ve B2B şirket hesapları oluşturuluyor...');
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('Ersa123!', 10);

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ersaticaret.com',
      passwordHash: adminPassword,
      name: 'Ersa Yönetici',
      phone: '05525843073',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
    }
  });

  // Bayi 1: Çınar Isı Ltd. Şti. (A Grubu)
  const company1 = await prisma.company.create({
    data: {
      legalName: 'Çınar Isı ve Soğutma Sistemleri Ltd. Şti.',
      taxNo: '2450893412',
      taxOffice: 'Gebze VD',
      phone: '02626410000',
      email: 'muhasebe@cinarisi.com',
      status: 'APPROVED',
      paymentTerm: 'CURRENT_ACCOUNT_30D',
      customerGroupId: groupA.id,
    }
  });

  const userBayi1 = await prisma.user.create({
    data: {
      email: 'bayi1@cinarisi.com',
      passwordHash: userPassword,
      name: 'Ahmet Çınar (Çınar Isı)',
      phone: '05321112233',
      role: 'B2B_CUSTOMER',
      status: 'ACTIVE',
      emailVerified: new Date(),
      memberships: {
        create: {
          companyId: company1.id,
          memberRole: 'OWNER'
        }
      }
    }
  });

  // Şirket 1 Cari Hesabı (150.000 TL Limit, 35.000 TL Kullanılan Borç)
  const cari1 = await prisma.currentAccount.create({
    data: {
      companyId: company1.id,
      creditLimit: 150000,
    }
  });

  await prisma.currentAccountTransaction.create({
    data: {
      accountId: cari1.id,
      type: 'DEBIT',
      amount: 35000,
      balanceAfter: 35000,
      note: 'Devir Bakiye (Geçmiş Dönem Siparişleri)',
    }
  });

  // Bayi 2: Marmara Teknik Servis A.Ş. (B Grubu)
  const company2 = await prisma.company.create({
    data: {
      legalName: 'Marmara Teknik Servis ve Dağıtım A.Ş.',
      taxNo: '6120498721',
      taxOffice: 'Darıca VD',
      phone: '02626550000',
      email: 'siparis@marmarateknik.com',
      status: 'APPROVED',
      paymentTerm: 'PREPAID',
      customerGroupId: groupB.id,
    }
  });

  const userBayi2 = await prisma.user.create({
    data: {
      email: 'bayi2@marmarateknik.com',
      passwordHash: userPassword,
      name: 'Mehmet Demir (Marmara Teknik)',
      phone: '05442223344',
      role: 'DEALER',
      status: 'ACTIVE',
      emailVerified: new Date(),
      memberships: {
        create: {
          companyId: company2.id,
          memberRole: 'OWNER'
        }
      }
    }
  });

  const cari2 = await prisma.currentAccount.create({
    data: {
      companyId: company2.id,
      creditLimit: 80000,
    }
  });

  // B2C Bireysel Müşteri
  const userB2C = await prisma.user.create({
    data: {
      email: 'musteri@gmail.com',
      passwordHash: userPassword,
      name: 'Ali Yılmaz',
      phone: '05553334455',
      role: 'B2C_CUSTOMER',
      status: 'ACTIVE',
      emailVerified: new Date(),
    }
  });

  // 5. Tedarikçi (Supplier)
  console.log('🏭 Tedarikçiler tanımlanıyor...');
  const supplierMain = await prisma.supplier.create({
    data: {
      code: 'ONLINE_PARCA',
      name: 'Online Yedek Parça Dağıtım Ltd.',
    }
  });

  // 6. Kategoriler ve Markalar
  console.log('📂 Kategoriler ve Markalar işleniyor...');
  const uniqueCategoryNames = Array.from(new Set(rawProducts.map(p => p.category))).filter(Boolean);
  const uniqueBrandNames = Array.from(new Set(rawProducts.map(p => p.brand))).filter(Boolean);

  const categoryMap = new Map<string, string>();
  for (const catName of uniqueCategoryNames) {
    const slug = slugify(catName);
    const cat = await prisma.category.create({
      data: {
        name: catName,
        slug,
        vatRate: 20,
        seoTitle: `${catName} Yedek Parçaları | Ersa Ticaret`,
        seoDescription: `En uygun fiyatlı ve garantili ${catName} yedek parçaları. Hızlı kargo ve toptan satış avantajı.`,
      }
    });
    categoryMap.set(catName, cat.id);
  }

  const brandMap = new Map<string, string>();
  for (const brandName of uniqueBrandNames) {
    const slug = slugify(brandName);
    const brand = await prisma.brand.create({
      data: {
        name: brandName,
        slug: slug || `marka-${Math.floor(Math.random() * 10000)}`,
      }
    });
    brandMap.set(brandName, brand.id);
  }

  // 7. Ürünler (Products)
  console.log(`📦 ${rawProducts.length} adet ürün veritabanına aktarılıyor...`);

  // Fiyat üretme yardımcı fonksiyonu (teknik ürün kategorilerine uygun gerçekçi fiyatlar)
  const getRealisticPrice = (category: string, title: string) => {
    const t = title.toLowerCase();
    if (t.includes('anakart') || t.includes('kart') || t.includes('elektronik')) {
      return { priceTRY: 2450, priceEUR: 65, currency: 'TRY' };
    }
    if (t.includes('fan motor') || t.includes('motor')) {
      return { priceTRY: 1350, priceEUR: 35, currency: 'TRY' };
    }
    if (t.includes('vana') || t.includes('musluk') || t.includes('salter') || t.includes('şalter')) {
      return { priceTRY: 420, priceEUR: 11, currency: 'TRY' };
    }
    if (t.includes('pompa')) {
      return { priceTRY: 1850, priceEUR: 48, currency: 'TRY' };
    }
    return { priceTRY: 650, priceEUR: 17, currency: 'TRY' };
  };

  let count = 0;
  const createdProductIds: string[] = [];

  for (const p of rawProducts) {
    const catId = categoryMap.get(p.category) || null;
    const brandId = (p.brand && brandMap.get(p.brand)) || null;
    const priceInfo = getRealisticPrice(p.category, p.title);
    const sku = p.code ? p.code.replace(/\s+/g, '') : `SKU-${Math.floor(10000 + Math.random() * 90000)}`;

    const product = await prisma.product.create({
      data: {
        name: p.title,
        slug: p.slug || `${slugify(p.title)}-${Math.floor(1000 + Math.random() * 9000)}`,
        sku: sku,
        barcode: `868000${Math.floor(1000000 + Math.random() * 9000000)}`,
        description: p.description || `${p.title} - Yüksek kaliteli orijinal ve muadil yedek parça.`,
        specsJson: JSON.stringify({
          'Marka': p.brand || 'Genel',
          'Kategori': p.category,
          'Uyumlu Kod': p.code,
          'Garanti': '1 Yıl Birebir Değişim',
          'Kargo Süresi': 'Aynı Gün Stoktan Teslim',
        }),
        status: 'ACTIVE',
        unit: 'ADET',
        vatRate: 20,
        currency: count % 4 === 0 ? 'EUR' : 'TRY', // Bazı ürünler EUR bazlı dövizli
        costPrice: count % 4 === 0 ? priceInfo.priceEUR * 0.7 : priceInfo.priceTRY * 0.7,
        salePrice: count % 4 === 0 ? priceInfo.priceEUR : priceInfo.priceTRY,
        stockQty: Math.floor(15 + Math.random() * 85),
        minOrderQty: 1,
        brandId,
        categoryId: catId,
        supplierId: supplierMain.id,
        seoTitle: `${p.title} Fiyatı ve Özellikleri | Ersa Ticaret`,
        seoDescription: `${p.code} kodlu ${p.title}. Darıca Ersa Ticaret güvencesiyle toptan ve perakende sipariş verin.`,
        images: {
          create: [
            { url: p.image, alt: p.title, sortOrder: 0 }
          ]
        },
        supplierLinks: {
          create: [
            {
              supplierId: supplierMain.id,
              externalSku: sku,
              rawPayload: JSON.stringify({ originalTitle: p.title, originalUrl: p.image }),
              lastSyncedAt: new Date(),
            }
          ]
        }
      }
    });

    createdProductIds.push(product.id);
    count++;
  }

  // 8. B2B Fiyatlandırma Kuralları (Price Rules)
  console.log('🏷️ B2B Fiyat kuralları (Pricing Engine kuralları) oluşturuluyor...');
  
  // Kural 1: A Grubu Genel %15 İndirim
  await prisma.priceRule.create({
    data: {
      name: 'A Grubu Bayi %15 Genel İndirim',
      priority: 5,
      type: 'GROUP_PERCENT',
      customerGroupId: groupA.id,
      discountPercent: 15,
      active: true,
    }
  });

  // Kural 2: B Grubu Genel %10 İndirim
  await prisma.priceRule.create({
    data: {
      name: 'B Grubu Bayi %10 Genel İndirim',
      priority: 5,
      type: 'GROUP_PERCENT',
      customerGroupId: groupB.id,
      discountPercent: 10,
      active: true,
    }
  });

  // Kural 3: VIP Grubu Genel %20 İndirim
  await prisma.priceRule.create({
    data: {
      name: 'VIP Grubu %20 Genel İndirim',
      priority: 5,
      type: 'GROUP_PERCENT',
      customerGroupId: groupVIP.id,
      discountPercent: 20,
      active: true,
    }
  });

  // Kural 4: A Grubu Kombi Kartlarında Ekstra %20 İndirim (Kategori Bazlı)
  const kombiCatId = categoryMap.get('Kombi Kartı');
  if (kombiCatId) {
    await prisma.priceRule.create({
      data: {
        name: 'A Grubu Kombi Kartı %20 İndirim',
        priority: 4,
        type: 'GROUP_CATEGORY',
        customerGroupId: groupA.id,
        categoryId: kombiCatId,
        discountPercent: 20,
        active: true,
      }
    });
  }

  // Kural 5: Çınar Isı Firmasına Özel İlk Üründe Sabit Net Fiyat (Müşteri + Ürün Önceliği: 1)
  if (createdProductIds.length > 0) {
    await prisma.priceRule.create({
      data: {
        name: 'Çınar Isı Özel Ürün Net Fiyatı',
        priority: 1,
        type: 'CUSTOMER_PRODUCT',
        companyId: company1.id,
        productId: createdProductIds[0],
        specialPrice: 1950, // Liste fiyatı 2450 yerine net 1950 TL
        active: true,
      }
    });
  }

  console.log('✅ Tohumlama başarıyla tamamlandı!');
  console.log(`
  ══════════════════════════════════════════════════════
  📌 TEST KULLANICI BİLGİLERİ
  ──────────────────────────────────────────────────────
  👑 Admin Girişi:
     Email: admin@ersaticaret.com
     Şifre: Admin123!
     
  🏢 A Grubu Bayi Girişi (Çınar Isı Ltd. - %15-20 İndirimli):
     Email: bayi1@cinarisi.com
     Şifre: Ersa123!
     Cari Limit: 150.000 TL | Kullanılan: 35.000 TL
     
  🏢 B Grubu Bayi Girişi (Marmara Teknik - %10 İndirimli):
     Email: bayi2@marmarateknik.com
     Şifre: Ersa123!
     Cari Limit: 80.000 TL
     
  👤 Standart B2C Müşteri:
     Email: musteri@gmail.com
     Şifre: Ersa123!
  ══════════════════════════════════════════════════════
  `);
}

main()
  .catch((e) => {
    console.error('❌ Tohumlama Hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
