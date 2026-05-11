import { NextRequest } from 'next/server';
import { getCategoryRepo } from '@/repositories';
import { categorySchema } from '@/validators/schemas';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { slugify } from '@/lib/utils';

const categoryRepo = getCategoryRepo();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = categorySchema.partial().parse(body);
    const updateData: Record<string, unknown> = { ...validated };
    if (validated.name) updateData.slug = slugify(validated.name);
    const category = await categoryRepo.updateById(id, updateData);
    if (!category) return errorResponse(new Error('Category not found'));
    return successResponse(category, 'Category updated');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await categoryRepo.updateById(id, { isActive: false });
    return successResponse(null, 'Category deleted');
  } catch (error) {
    return errorResponse(error);
  }
}
