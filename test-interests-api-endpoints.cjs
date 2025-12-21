const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TENANT_KEY = 'rabin';
const CUSTOMER_ID = 'd1bcae7e-ce70-11f0-8238-d2bc93e1fc48'; // From previous test

// Mock auth token (you'll need to get a real one from browser)
const AUTH_TOKEN = 'your-auth-token-here';

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-Key': TENANT_KEY,
            }
        };

        if (AUTH_TOKEN && AUTH_TOKEN !== 'your-auth-token-here') {
            options.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
        }

        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
        }

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testInterestsAPIs() {
    console.log('🧪 تست API های مدیریت علاقه‌مندی محصولات\n');

    try {
        // Test 1: Get available products
        console.log('📦 تست 1: دریافت لیست محصولات موجود');
        const productsResponse = await makeRequest(`/api/tenant/products/list?customer_id=${CUSTOMER_ID}`);
        console.log(`Status: ${productsResponse.status}`);
        
        if (productsResponse.status === 200 && productsResponse.data.success) {
            console.log(`✅ ${productsResponse.data.data.length} محصول موجود یافت شد`);
            productsResponse.data.data.forEach(product => {
                console.log(`  - ${product.name} (${product.category || 'بدون دسته'})`);
            });
        } else {
            console.log('❌ خطا در دریافت محصولات:', productsResponse.data);
        }

        // Test 2: Get current interests
        console.log('\n💝 تست 2: دریافت علاقه‌مندی‌های فعلی');
        const interestsResponse = await makeRequest(`/api/tenant/customers/${CUSTOMER_ID}/interests`);
        console.log(`Status: ${interestsResponse.status}`);
        
        if (interestsResponse.status === 200 && interestsResponse.data.success) {
            console.log(`✅ ${interestsResponse.data.data.length} علاقه‌مندی فعلی یافت شد`);
            interestsResponse.data.data.forEach(interest => {
                console.log(`  - ${interest.product_name} (${interest.interest_level})`);
            });
        } else {
            console.log('❌ خطا در دریافت علاقه‌مندی‌ها:', interestsResponse.data);
        }

        // Test 3: Add new interest (if products available)
        if (productsResponse.status === 200 && productsResponse.data.success && productsResponse.data.data.length > 0) {
            console.log('\n➕ تست 3: افزودن علاقه‌مندی جدید');
            const newProductId = productsResponse.data.data[0].id;
            const newProductName = productsResponse.data.data[0].name;
            
            const addResponse = await makeRequest(`/api/tenant/customers/${CUSTOMER_ID}/interests`, 'POST', {
                product_id: newProductId,
                interest_level: 'high',
                notes: 'تست افزودن علاقه‌مندی از طریق API'
            });
            
            console.log(`Status: ${addResponse.status}`);
            if (addResponse.status === 200 && addResponse.data.success) {
                console.log(`✅ علاقه‌مندی به "${newProductName}" با موفقیت اضافه شد`);
                
                // Test 4: Get updated interests
                console.log('\n🔄 تست 4: بررسی علاقه‌مندی‌های بروزرسانی شده');
                const updatedInterestsResponse = await makeRequest(`/api/tenant/customers/${CUSTOMER_ID}/interests`);
                
                if (updatedInterestsResponse.status === 200 && updatedInterestsResponse.data.success) {
                    console.log(`✅ ${updatedInterestsResponse.data.data.length} علاقه‌مندی (بعد از افزودن)`);
                    
                    // Test 5: Delete the added interest
                    const addedInterest = updatedInterestsResponse.data.data.find(i => i.product_id === newProductId);
                    if (addedInterest) {
                        console.log('\n🗑️ تست 5: حذف علاقه‌مندی اضافه شده');
                        const deleteResponse = await makeRequest(
                            `/api/tenant/customers/${CUSTOMER_ID}/interests?interest_id=${addedInterest.id}`, 
                            'DELETE'
                        );
                        
                        console.log(`Status: ${deleteResponse.status}`);
                        if (deleteResponse.status === 200 && deleteResponse.data.success) {
                            console.log(`✅ علاقه‌مندی "${newProductName}" با موفقیت حذف شد`);
                        } else {
                            console.log('❌ خطا در حذف علاقه‌مندی:', deleteResponse.data);
                        }
                    }
                }
            } else {
                console.log('❌ خطا در افزودن علاقه‌مندی:', addResponse.data);
            }
        }

        console.log('\n🎉 تست‌های API تکمیل شد!');
        console.log('\n📝 نکته: برای تست کامل، لطفاً AUTH_TOKEN را از مرورگر کپی کنید');

    } catch (error) {
        console.error('❌ خطا در تست API:', error.message);
    }
}

testInterestsAPIs();