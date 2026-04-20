import { prisma } from "@/lib/db";

export const categories = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};
