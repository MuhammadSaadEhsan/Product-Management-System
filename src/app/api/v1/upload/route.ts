import { NextRequest } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return errorResponse(new Error('No file provided'));
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    const folder = (formData.get('folder') as string) || 'bill_manager/products';
    const result = await uploadImage(base64, folder);
    return successResponse(result, 'Image uploaded');
  } catch (error) {
    return errorResponse(error);
  }
}
