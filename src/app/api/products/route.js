// app/api/products/route.js (Modify this file)

import { NextResponse } from 'next/server';
// *** IMPORTANT: Update the import path and function names ***
import { readJsonData, writeJsonData } from '@/app/lib/dataUtils'; // Ensure this path is correct for your structure

// Define the filename for product/order data
const PRODUCTS_FILENAME = 'Products.json';

// --- GET Handler (List All Products/Orders) ---
export async function GET() {
  try {
    // Use readJsonData and provide a default empty array if the file doesn't exist or is empty
    const allProducts = (await readJsonData(PRODUCTS_FILENAME)) || [];
    // console.log(`API GET /api/products - Found ${allProducts.length} products`);
    return NextResponse.json(allProducts);
  } catch (error) {
    console.error(`API GET /api/products Error (${PRODUCTS_FILENAME}):`, error);
    // Check if the error is from reading data
    const message = error.message.includes('Could not read data')
      ? `Server error reading data file ${PRODUCTS_FILENAME}.`
      : 'Failed to fetch products.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// --- POST Handler (Add New Product/Order) ---
export async function POST(request) {
  let allProducts = []; // Define in outer scope
  try {
    const newProductData = await request.json();

    // Basic Server-Side Validation (Keep this or enhance it)
    if (
      !newProductData ||
      typeof newProductData !== 'object' ||
      !newProductData.product?.name // Example: Checking for nested 'product.name'
    ) {
      return NextResponse.json(
        { message: 'Invalid product data. Product name is required.' },
        { status: 400 }
      );
    }

    // Use readJsonData, default to empty array if file not found
    allProducts = (await readJsonData(PRODUCTS_FILENAME)) || [];

    // Generate a unique ID on the server (Keep this logic)
    const productToAdd = {
      ...newProductData,
      // Overwrite any client-sent ID, generate server-side
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    allProducts.push(productToAdd);
    console.log(
      `API POST /api/products - Adding product: ${productToAdd.id} to ${PRODUCTS_FILENAME}`
    );

    // Use writeJsonData to save the updated array
    await writeJsonData(PRODUCTS_FILENAME, allProducts);

    // Respond with the *actually added* product data
    return NextResponse.json(productToAdd, { status: 201 }); // 201 Created
  } catch (error) {
    console.error(
      `API POST /api/products Error (${PRODUCTS_FILENAME}):`,
      error
    );
    // Check specific error types
    const message = error.message.includes('Could not') // Check for our specific read/write errors
      ? `Server error reading or writing data file ${PRODUCTS_FILENAME}.`
      : error instanceof SyntaxError // Check if the incoming request body was invalid JSON
      ? 'Invalid JSON data received in request.'
      : 'Failed to add product on server.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
