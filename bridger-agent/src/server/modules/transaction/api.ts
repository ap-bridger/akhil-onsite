import { prisma } from "@/lib/db";

export const transactions = async (
  _parent: unknown,
  args: { bankAccountId: string },
) => {
  return prisma.transaction.findMany({
    where: { bankAccountId: args.bankAccountId },
    orderBy: { transactionDate: "desc" },
    include: {
      categorization: {
        include: {
          payee: true,
          category: true,
        },
      },
    },
  });
};
