import 'dotenv/config';
import { supplierSyncService } from './sync/supplier-sync-service';
import { prisma } from './db';

async function testSync() {
  console.log('====================================================');
  console.log('🧪 TEST: SUPPLIER PRODUCT INGESTION ENGINE');
  console.log('====================================================\n');

  // 1. Test Girdap Sync
  console.log('--- 1. Testing Girdap (Limit: 5 products) ---');
  try {
    const resGirdap = await supplierSyncService.runSync('GIRDAP', {
      mode: 'FULL',
      maxPages: 1,
      limit: 5,
    });
    console.log('✅ Girdap Result:', {
      jobId: resGirdap.jobId,
      total: resGirdap.total,
      created: resGirdap.created,
      updated: resGirdap.updated,
      failed: resGirdap.failed,
    });
  } catch (e: any) {
    console.error('❌ Girdap Error:', e.message);
  }

  // 2. Test Garantiis Sync
  console.log('\n--- 2. Testing Garantiis Süpürge Parçaları (Limit: 5 products) ---');
  try {
    const resGaranti = await supplierSyncService.runSync('GARANTIIS', {
      mode: 'FULL',
      maxPages: 1,
      limit: 5,
    });
    console.log('✅ Garantiis Result:', {
      jobId: resGaranti.jobId,
      total: resGaranti.total,
      created: resGaranti.created,
      updated: resGaranti.updated,
      failed: resGaranti.failed,
    });
  } catch (e: any) {
    console.error('❌ Garantiis Error:', e.message);
  }

  // 3. Test Kombisan Sync
  console.log('\n--- 3. Testing Kombisan B4B API (Limit: 5 products) ---');
  try {
    const resKombisan = await supplierSyncService.runSync('KOMBISAN', {
      mode: 'FULL',
      maxPages: 1,
      limit: 5,
    });
    console.log('✅ Kombisan Result:', {
      jobId: resKombisan.jobId,
      total: resKombisan.total,
      created: resKombisan.created,
      updated: resKombisan.updated,
      failed: resKombisan.failed,
    });
  } catch (e: any) {
    console.error('❌ Kombisan Error:', e.message);
  }

  // 4. Test Re-run (Duplicate Check)
  console.log('\n--- 4. Testing Duplicate Prevention (Re-running Girdap) ---');
  try {
    const resReRun = await supplierSyncService.runSync('GIRDAP', {
      mode: 'FULL',
      maxPages: 1,
      limit: 5,
    });
    console.log('✅ Duplicate Prevention Result (Expected 0 created, 5 updated):', {
      created: resReRun.created,
      updated: resReRun.updated,
      total: resReRun.total,
    });
  } catch (e: any) {
    console.error('❌ Duplicate Test Error:', e.message);
  }

  // Check Database Records
  const supplierCount = await prisma.supplier.count();
  const supplierProdCount = await prisma.supplierProduct.count();
  const jobCount = await prisma.importJob.count();
  console.log('\n📊 Database Summary:');
  console.log(' - Total Suppliers:', supplierCount);
  console.log(' - Total Supplier Products:', supplierProdCount);
  console.log(' - Total Import Jobs:', jobCount);
}

testSync();
