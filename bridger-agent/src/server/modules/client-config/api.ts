import { prisma } from "@/lib/db";

export const clientConfigs = async (
  _parent: unknown,
  args: { bankAccountId: string },
) => {
  return prisma.clientConfig.findMany({
    where: { bankAccountId: args.bankAccountId },
    orderBy: { id: "desc" },
    take: 1,
  });
};

export const updateClientConfig = async (
  _parent: unknown,
  args: { bankAccountId: string; config: string },
) => {
  const existing = await prisma.clientConfig.findFirst({
    where: { bankAccountId: args.bankAccountId },
  });

  if (existing) {
    return prisma.clientConfig.update({
      where: { id: existing.id },
      data: { config: args.config },
    });
  }

  return prisma.clientConfig.create({
    data: {
      bankAccountId: args.bankAccountId,
      config: args.config,
    },
  });
};
