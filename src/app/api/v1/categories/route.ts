import { NextRequest } from 'next/server';
import { getCategoryRepo } from '@/repositories';
import { categorySchema } from '@/validators/schemas';
import { successResponse, createdResponse, errorResponse } from '@/lib/apiResponse';
import { slugify } from '@/lib/utils';

const categoryRepo = getCategoryRepo();

export async function GET() {
  try {
    const categories = await categoryRepo.findAll({ isActive: true }, { sort: { name: 1 } });
    return successResponse(categories);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = categorySchema.parse(body);
    const slug = slugify(validated.name);
    const category = await categoryRepo.create({ ...validated, slug });
    return createdResponse(category);
  } catch (error) {
    return errorResponse(error);
  }
}
