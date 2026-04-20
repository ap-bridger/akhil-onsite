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

type CategorizationStatus = "NEEDS_REVIEW" | "NEEDS_MORE_INFO" | "REVIEWED";

export const categorizeTransaction = async (
  _parent: unknown,
  args: {
    transactionId: string;
    status: CategorizationStatus;
    categoryId?: string | null;
    payee?: string | null;
    reason?: string | null;
  },
) => {
  if (args.status !== "NEEDS_MORE_INFO" && args.status !== "REVIEWED") {
    throw new Error(
      `Invalid status "${args.status}"; expected NEEDS_MORE_INFO or REVIEWED`,
    );
  }
  if (args.status === "REVIEWED" && !args.categoryId) {
    throw new Error("categoryId is required when status is REVIEWED");
  }

  return prisma.$transaction(async (tx) => {
    let payeeId: string | null = null;
    if (args.payee) {
      const existing = await tx.vendor.findFirst({
        where: { name: args.payee },
      });
      const vendor =
        existing ?? (await tx.vendor.create({ data: { name: args.payee } }));
      payeeId = vendor.id;
    }

    const categorization = await tx.categorization.create({
      data: {
        reason: args.reason ?? "Manually categorized",
        aiGenerated: false,
        status: args.status,
        confidenceScore: 100,
        categoryId: args.categoryId ?? null,
        payeeId,
        transactionId: args.transactionId,
      },
    });

    return tx.transaction.update({
      where: { id: args.transactionId },
      data: { categorizationId: categorization.id },
      include: {
        categorization: {
          include: {
            payee: true,
            category: true,
          },
        },
      },
    });
  });
};
