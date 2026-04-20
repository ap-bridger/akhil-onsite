import { prisma } from "@/lib/db";

export const vendors = async () => {
  return prisma.vendor.findMany({ orderBy: { name: "asc" } });
};
