import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function seedAdmin() {
  await connectDB();
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) return existing;

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
  const admin = await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@billmanager.com',
    password: hashedPassword,
    role: 'admin',
    isActive: true,
  });

  console.log('✅ Admin user seeded successfully');
  return admin;
}
