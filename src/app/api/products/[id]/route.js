import { NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '@/app/lib/dataUtils';

const PRODUCTS_FILENAME = 'Products.json';
export async function GET(request, { params: paramsPromise }) {
  console.log(request, paramsPromise, "dfidighu");

  try {
    const params = await paramsPromise;
    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const allProducts = (await readJsonData(PRODUCTS_FILENAME)) || [];
    const product = allProducts.find((p) => p.id === productId);

    if (!product) {
      return NextResponse.json(
        { message: `Product with ID ${productId} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    const resolvedId = paramsPromise.id || (await paramsPromise)?.id || 'unknown';
    console.error(`API GET /api/products/${resolvedId} Error:`, error);

    const message = error.message?.includes('Could not read data')
      ? `Server error reading data file ${PRODUCTS_FILENAME}.`
      : 'Failed to fetch product.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  let allProducts = [];
  try {
    const productId = params.id;
    const updatedProductData = await request.json();
    console.log(`API PUT /api/products/${productId}`);

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required.' },
        { status: 400 }
      );
    }
    if (
      !updatedProductData ||
      typeof updatedProductData !== 'object' ||
      !updatedProductData.product?.name
    ) {
      return NextResponse.json(
        { message: 'Invalid update data. Product name is required.' },
        { status: 400 }
      );
    }

    allProducts = (await readJsonData(PRODUCTS_FILENAME)) || [];

    let productFound = false;
    const updatedProducts = allProducts.map((product) => {
      if (product.id === productId) {
        productFound = true;
        return { ...product, ...updatedProductData, id: productId };
      }
      return product;
    });

    if (!productFound) {
      return NextResponse.json(
        { message: `Product with ID ${productId} not found.` },
        { status: 404 }
      );
    }

    await writeJsonData(PRODUCTS_FILENAME, updatedProducts);

    const finalUpdatedProduct = updatedProducts.find((p) => p.id === productId);

    return NextResponse.json(finalUpdatedProduct, { status: 200 });
  } catch (error) {
    console.error(`API PUT /api/products/${params.id} Error:`, error);
    const message = error.message.includes('Could not')
      ? 'Server error reading or writing product data.'
      : error instanceof SyntaxError
      ? 'Invalid JSON data received for update.'
      : 'Failed to update product on server.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  let allProducts = [];
  try {
    const productId = params.id;
    console.log(`API DELETE /api/products/${productId}`);

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required.' },
        { status: 400 }
      );
    }

    allProducts = (await readJsonData(PRODUCTS_FILENAME)) || [];

    const initialLength = allProducts.length;
    const filteredProducts = allProducts.filter(
      (product) => product.id !== productId
    );

    if (filteredProducts.length === initialLength) {
      return NextResponse.json(
        { message: `Product not found.` },
        { status: 404 }
      );
    }

    await writeJsonData(PRODUCTS_FILENAME, filteredProducts);

    return NextResponse.json(
      { message: `Product deleted successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error(`API DELETE /api/products/${params.id} Error:`, error);
    const message = error.message.includes('Could not')
      ? 'Server error reading or writing product data.'
      : 'Failed to delete product on server.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
