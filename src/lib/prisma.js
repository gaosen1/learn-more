import { PrismaClient } from '@prisma/client';

// 在全局对象上添加Prisma客户端以防止热重载时创建多个实例
const globalForPrisma = global;

// 创建全局Prisma客户端实例
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 