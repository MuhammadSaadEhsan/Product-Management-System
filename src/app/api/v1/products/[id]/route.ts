import { NextRequest } from 'next/server';
import { productService } from '@/services/productService';
import { productSchema } from '@/validators/schemas';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await productService.getProductById(id);
    if (!product) return errorResponse(new Error('Product not found'));
    return successResponse(product);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = productSchema.partial().parse(body);
    const product = await productService.updateProduct(id, validated);
    if (!product) return errorResponse(new Error('Product not found'));
    return successResponse(product, 'Product updated');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await productService.deleteProduct(id);
    return successResponse(null, 'Product deleted');
  } catch (error) {
    return errorResponse(error);
  }
}
