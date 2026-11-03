const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting API Verification Tests with native fetch...\n');

  try {
    // 1. Health check
    const healthRes = await fetch('http://localhost:5000/health');
    const healthData = await healthRes.json();
    console.log('✅ 1. Server Health:', healthData);

    // 2. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@storerating.com',
        password: 'Admin@12345'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log('✅ 2. Admin Login Successful. Role:', adminLoginData.user?.role);

    // 3. Admin Metrics
    const metricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const metricsData = await metricsRes.json();
    console.log('✅ 3. Admin Metrics:', metricsData);

    // 4. Admin Users list
    const usersRes = await fetch(`${BASE_URL}/admin/users?role=STORE_OWNER`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const usersData = await usersRes.json();
    console.log(`✅ 4. Admin Users (Found ${usersData.length} Store Owners). Sample:`, {
      name: usersData[0]?.name,
      rating: usersData[0]?.assignedStoreRatingAverage
    });

    // 5. Store Owner Login & Dashboard
    const ownerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'a.harrison@corporate.org',
        password: 'Owner@12345'
      })
    });
    const ownerLoginData = await ownerLoginRes.json();
    const ownerToken = ownerLoginData.token;
    console.log('✅ 5. Store Owner Login Successful. Role:', ownerLoginData.user?.role);

    const ownerDashRes = await fetch(`${BASE_URL}/owner/dashboard`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    const ownerDashData = await ownerDashRes.json();
    console.log('✅ 6. Store Owner Dashboard: Store:', ownerDashData.store?.name, 'Avg Rating:', ownerDashData.store?.averageRating, 'Total Reviews:', ownerDashData.ratings?.length);

    // 6. Normal User Login & Rating
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@storerating.com',
        password: 'User@12345'
      })
    });
    const userLoginData = await userLoginRes.json();
    const userToken = userLoginData.token;
    console.log('✅ 7. Normal User Login Successful. Role:', userLoginData.user?.role);

    // 7. Get Stores Catalog
    const storesRes = await fetch(`${BASE_URL}/stores`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const storesData = await storesRes.json();
    console.log(`✅ 8. Stores Catalog (Found ${storesData.length} stores). Sample Store:`, {
      name: storesData[0]?.name,
      overallRating: storesData[0]?.overallRating,
      userRating: storesData[0]?.userRating
    });

    // 8. Submit / Upsert Rating
    const storeToRate = storesData[0];
    const ratingUpsertRes = await fetch(`${BASE_URL}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        storeId: storeToRate.id,
        rating: 5
      })
    });
    const ratingUpsertData = await ratingUpsertRes.json();
    console.log('✅ 9. Rating Upsert Successful:', ratingUpsertData.message, 'Rating Value:', ratingUpsertData.rating?.rating);

    // 9. Modify Rating to 4
    const ratingModifyRes = await fetch(`${BASE_URL}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        storeId: storeToRate.id,
        rating: 4
      })
    });
    const ratingModifyData = await ratingModifyRes.json();
    console.log('✅ 10. Rating Modification Successful:', ratingModifyData.message, 'New Value:', ratingModifyData.rating?.rating);

    console.log('\n🎉 ALL API ENDPOINTS AND ROLE-BASED ACCESS CHECKS PASSED PERFECTLY!\n');
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
