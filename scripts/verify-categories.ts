
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testCategories() {
  console.log('🚀 Starting Categories Verification...');

  try {
    // 1. Create Root Category
    console.log('\n1. Creating Root Category...');
    const rootCategoryRes = await axios.post(`${API_URL}/categories`, {
      name: 'Test Root Category ' + Date.now(),
      description: 'A test root category',
      isActive: true,
      order: 1
    });
    const rootCategory = rootCategoryRes.data;
    console.log('✅ Created Root Category:', rootCategory.id);

    // 2. Create Child Category
    console.log('\n2. Creating Child Category...');
    const childCategoryRes = await axios.post(`${API_URL}/categories`, {
      name: 'Test Child Category ' + Date.now(),
      description: 'A test child category',
      parentId: rootCategory.id,
      isActive: true,
      order: 1
    });
    const childCategory = childCategoryRes.data;
    console.log('✅ Created Child Category:', childCategory.id);

    // 3. Get Tree
    console.log('\n3. Fetching Category Tree...');
    const treeRes = await axios.get(`${API_URL}/categories/tree`);
    const tree = treeRes.data;
    const foundRoot = tree.find((c: any) => c.id === rootCategory.id);
    if (foundRoot && foundRoot.children.find((c: any) => c.id === childCategory.id)) {
        console.log('✅ Tree structure verified');
    } else {
        console.error('❌ Tree structure mismatch', JSON.stringify(tree, null, 2));
    }

    // 4. Update Category
    console.log('\n4. Updating Child Category...');
    const updateRes = await axios.patch(`${API_URL}/categories/${childCategory.id}`, {
        name: childCategory.name + ' Updated',
        order: 2
    });
    console.log('✅ Updated Child Category:', updateRes.data.name);

    // 5. Test getAllProducts with onlyActive filter
    console.log('\n5. Testing Products Filter (onlyActive)...');
    try {
        await axios.get(`${API_URL}/categories/${rootCategory.id}/products?onlyActive=true`);
        console.log('✅ getAllProducts with onlyActive=true passed');
        
        await axios.get(`${API_URL}/categories/${rootCategory.id}/products?onlyActive=false`);
        console.log('✅ getAllProducts with onlyActive=false passed');

    } catch (error: any) {
        console.error('❌ Products filter failed:', error.response?.data || error.message);
    }

    // 6. Delete Categories
    console.log('\n6. Deleting Categories (Cleanup)...');
    await axios.delete(`${API_URL}/categories/${childCategory.id}`);
    await axios.delete(`${API_URL}/categories/${rootCategory.id}`);
    console.log('✅ Cleanup complete');

    console.log('\n🎉 Verification Finished Successfully!');

  } catch (error: any) {
    console.error('\n❌ Verification Failed:', error.response?.data || error.message);
  }
}

testCategories();
