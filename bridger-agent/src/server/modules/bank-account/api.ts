import { prisma } from "@/lib/db";

export const bankAccounts = async () => {
  return prisma.bankAccount.findMany({ orderBy: { name: "asc" } });
};
