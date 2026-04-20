import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const d = (iso: string) => new Date(`${iso}T12:00:00-08:00`);

type Status = "REVIEWED" | "NEEDS_REVIEW" | "NEEDS_MORE_INFO";

type TransactionRow = {
  key: string;
  date: string;
  details: string;
  amount: number;
};

type CategorizationRow = {
  transactionKey: string;
  vendor: string | null;
  category: string | null;
  status: Status;
  confidence: number;
  reason: string;
  aiGenerated?: boolean;
  humanOverride?: {
    vendor: string | null;
    category: string | null;
    reason: string;
  };
};

const CATEGORIES = [
  "Revenue",
  "COGS - Tea & Pearls",
  "COGS - Dairy",
  "COGS - Packaging",
  "Rent",
  "Payroll",
  "Utilities",
  "Internet & Phone",
  "Software & Subscriptions",
  "Insurance",
  "Repairs & Maintenance",
  "Office & Cleaning Supplies",
  "Owner's Contribution",
  "Uncategorized",
];

const VENDORS = [
  "Square Inc",
  "Gusto",
  "Kwan Family Trust",
  "PG&E",
  "Comcast Business",
  "Bossen Food Corp",
  "Possmei USA",
  "Clover Sonoma",
  "WebstaurantStore",
  "Costco Wholesale",
  "Next Insurance",
  "Toast Inc",
  "Hobart Service",
  "Amazon.com",
];

// The raw transactions as they would appear on the bank feed — no
// categorization info. The `key` field is just a seed-file-local identifier
// used to link each transaction to its categorization(s) below.
const TRANSACTIONS: TransactionRow[] = [
  // --- January ---
  { key: "jan-rent",         date: "2026-01-02", details: "ACH DEBIT KWAN FAMILY TRUST RENT JAN", amount: -3500 },
  { key: "jan-square-1",     date: "2026-01-03", details: "SQUARESUP DEPOSIT 260103 MOGEE TEA",   amount: 1124.4 },
  { key: "jan-bossen",       date: "2026-01-05", details: "BOSSEN FOOD CORP ONLINE #48219",       amount: -612.8 },
  { key: "jan-dairy",        date: "2026-01-08", details: "CLOVER SONOMA ACH DELIVERY",           amount: -214.5 },
  { key: "jan-payroll",      date: "2026-01-09", details: "GUSTO PAY 8GXK9Q",                     amount: -5820.44 },
  { key: "jan-pge",          date: "2026-01-12", details: "PG&E WEB ONLINE PAYMENT",              amount: -412.77 },
  { key: "jan-comcast",      date: "2026-01-13", details: "COMCAST BUSINESS 800-391-3000",        amount: -119.99 },
  { key: "jan-costco",       date: "2026-01-14", details: "POS COSTCO WHSE #478 OAKLAND CA",      amount: -287.44 },
  { key: "jan-webstaurant",  date: "2026-01-16", details: "WEBSTAURANT STORE 717-392-7472",       amount: -389.12 },
  { key: "jan-amazon",       date: "2026-01-20", details: "AMAZON.COM*RT4X91KQ3 SEATTLE WA",      amount: -84.27 },
  { key: "jan-insurance",    date: "2026-01-27", details: "NEXT INS PREMIUM 260127",              amount: -218 },
  { key: "jan-zelle",        date: "2026-01-29", details: "ZELLE FROM M WONG",                    amount: 5000 },

  // --- February ---
  { key: "feb-toast",        date: "2026-02-03", details: "TST* SOFTWARE FEE 22099",              amount: -165 },
  { key: "feb-hobart",       date: "2026-02-10", details: "HOBART SERVICE CO INVOICE 7744",       amount: -612 },
  { key: "feb-bossen-refund",date: "2026-02-14", details: "BOSSEN FOOD CORP REFUND #48977R",      amount: 82.4 },
  { key: "feb-square-1",     date: "2026-02-21", details: "SQUARESUP DEPOSIT 260221 MOGEE TEA",   amount: 2144.8 },

  // --- March ---
  { key: "mar-rent",         date: "2026-03-02", details: "ACH DEBIT KWAN FAMILY TRUST RENT MAR", amount: -3500 },
  { key: "mar-possmei",      date: "2026-03-09", details: "POSSMEI USA SHOPIFY #3104",            amount: -412.25 },
  { key: "mar-venmo",        date: "2026-03-15", details: "VENMO PAYMENT *JXKQ221",               amount: -45 },
  { key: "mar-square-1",     date: "2026-03-28", details: "SQUARESUP DEPOSIT 260328 MOGEE TEA",   amount: 2402.18 },
];

// The AI's first-pass categorization per transaction, plus optional human
// overrides for rows where the AI was unsure and a human weighed in.
// Together these cover every category, every status, and the AI → human
// override flow.
const CATEGORIZATIONS: CategorizationRow[] = [
  { transactionKey: "jan-rent",        vendor: "Kwan Family Trust", category: "Rent",                       status: "REVIEWED",        confidence: 99, reason: "Recurring monthly rent ACH on the 1st business day." },
  { transactionKey: "jan-square-1",    vendor: "Square Inc",        category: "Revenue",                    status: "REVIEWED",        confidence: 97, reason: "Daily Square merchant deposit, net of processing fees." },
  { transactionKey: "jan-bossen",      vendor: "Bossen Food Corp",  category: "COGS - Tea & Pearls",        status: "REVIEWED",        confidence: 96, reason: "Known wholesale supplier for tapioca pearls and syrups." },
  { transactionKey: "jan-dairy",       vendor: "Clover Sonoma",     category: "COGS - Dairy",               status: "REVIEWED",        confidence: 95, reason: "Regional dairy supplier, recurring delivery." },
  { transactionKey: "jan-payroll",     vendor: "Gusto",             category: "Payroll",                    status: "REVIEWED",        confidence: 98, reason: "Bi-weekly payroll run via Gusto." },
  { transactionKey: "jan-pge",         vendor: "PG&E",              category: "Utilities",                  status: "REVIEWED",        confidence: 99, reason: "Monthly electric utility." },
  { transactionKey: "jan-comcast",     vendor: "Comcast Business",  category: "Internet & Phone",           status: "REVIEWED",        confidence: 99, reason: "Monthly business internet." },
  { transactionKey: "jan-costco",      vendor: "Costco Wholesale",  category: "Office & Cleaning Supplies", status: "NEEDS_REVIEW",    confidence: 62, reason: "Costco purchases at this shop are sometimes packaging (COGS) and sometimes cleaning supplies — needs receipt." },
  { transactionKey: "jan-webstaurant", vendor: "WebstaurantStore",  category: "COGS - Packaging",           status: "REVIEWED",        confidence: 93, reason: "Cups, lids, and straws from foodservice wholesaler." },
  { transactionKey: "jan-amazon",      vendor: null,                category: null,                         status: "NEEDS_MORE_INFO", confidence: 35, reason: "Amazon purchase — cannot tell from descriptor whether this is business supplies or personal. Please attach receipt." },
  { transactionKey: "jan-insurance",   vendor: "Next Insurance",    category: "Insurance",                  status: "REVIEWED",        confidence: 98, reason: "Monthly small-business insurance premium." },
  { transactionKey: "jan-zelle",       vendor: null,                category: null,                         status: "NEEDS_MORE_INFO", confidence: 40, reason: "Inbound Zelle transfer with no memo. Could be owner contribution or customer refund reversal — please confirm.", humanOverride: { vendor: null, category: "Owner's Contribution", reason: "Confirmed by owner: personal funds deposited to cover Q1 working capital." } },
  { transactionKey: "feb-toast",       vendor: "Toast Inc",         category: "Software & Subscriptions",   status: "REVIEWED",        confidence: 96, reason: "Monthly Toast POS software fee." },
  { transactionKey: "feb-hobart",      vendor: "Hobart Service",    category: "Repairs & Maintenance",      status: "REVIEWED",        confidence: 92, reason: "Commercial kitchen equipment repair vendor." },
  { transactionKey: "feb-bossen-refund", vendor: "Bossen Food Corp", category: "Revenue",                   status: "NEEDS_REVIEW",    confidence: 58, reason: "Positive amount from a known supplier — likely a partial refund rather than revenue. Suggest recategorizing to offset COGS.", humanOverride: { vendor: "Bossen Food Corp", category: "COGS - Tea & Pearls", reason: "Human review: supplier refund, offsets January Bossen order — recategorized to COGS rather than revenue." } },
  { transactionKey: "feb-square-1",    vendor: "Square Inc",        category: "Revenue",                    status: "REVIEWED",        confidence: 97, reason: "Saturday Square deposit." },
  { transactionKey: "mar-rent",        vendor: "Kwan Family Trust", category: "Rent",                       status: "REVIEWED",        confidence: 99, reason: "Recurring monthly rent ACH." },
  { transactionKey: "mar-possmei",     vendor: "Possmei USA",       category: "COGS - Tea & Pearls",        status: "REVIEWED",        confidence: 94, reason: "Boba/tea ingredient wholesaler with US warehouse." },
  { transactionKey: "mar-venmo",       vendor: null,                category: "Uncategorized",              status: "NEEDS_REVIEW",    confidence: 50, reason: "Outbound Venmo with no recipient memo — not enough info to map to a vendor or category yet." },
  { transactionKey: "mar-square-1",    vendor: "Square Inc",        category: "Revenue",                    status: "REVIEWED",        confidence: 97, reason: "Saturday Square deposit." },
];

async function clearSeedData() {
  await prisma.categorization.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.clientConfig.deleteMany({});
  await prisma.bankAccount.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.category.deleteMany({});
}

async function seedCategories(): Promise<Map<string, string>> {
  const byName = new Map<string, string>();
  for (const name of CATEGORIES) {
    const row = await prisma.category.create({ data: { name } });
    byName.set(name, row.id);
  }
  return byName;
}

async function seedVendors(): Promise<Map<string, string>> {
  const byName = new Map<string, string>();
  for (const name of VENDORS) {
    const row = await prisma.vendor.create({ data: { name } });
    byName.set(name, row.id);
  }
  return byName;
}

async function seedClient() {
  const client = await prisma.client.create({ data: { name: "Mogee Tea LLC" } });
  const account = await prisma.bankAccount.create({
    data: { name: "Operating Checking", clientId: client.id },
  });
  await prisma.clientConfig.create({
    data: {
      bankAccountId: account.id,
      config: JSON.stringify({
        fiscalYearStart: "01-01",
        autoCategorizeThreshold: 0.85,
      }),
    },
  });
  return { client, account };
}

async function seedTransactions(bankAccountId: string): Promise<Map<string, string>> {
  const idByKey = new Map<string, string>();
  for (const row of TRANSACTIONS) {
    const txn = await prisma.transaction.create({
      data: {
        details: row.details,
        amount: row.amount,
        transactionDate: d(row.date),
        bankAccountId,
      },
    });
    idByKey.set(row.key, txn.id);
  }
  return idByKey;
}

async function seedCategorizations(
  transactionIdByKey: Map<string, string>,
  vendorIdByName: Map<string, string>,
  categoryIdByName: Map<string, string>,
) {
  const transactionDateByKey = new Map(TRANSACTIONS.map((t) => [t.key, t.date]));

  for (const row of CATEGORIZATIONS) {
    const transactionId = transactionIdByKey.get(row.transactionKey);
    const dateIso = transactionDateByKey.get(row.transactionKey);
    if (!transactionId || !dateIso) {
      throw new Error(`Unknown transactionKey: ${row.transactionKey}`);
    }

    const aiCat = await prisma.categorization.create({
      data: {
        transactionId,
        aiGenerated: row.aiGenerated ?? true,
        status: row.status,
        confidenceScore: row.confidence,
        reason: row.reason,
        payeeId: row.vendor ? vendorIdByName.get(row.vendor) ?? null : null,
        categoryId: row.category ? categoryIdByName.get(row.category) ?? null : null,
        createdAt: d(dateIso),
      },
    });

    let currentCatId = aiCat.id;

    if (row.humanOverride) {
      const override = await prisma.categorization.create({
        data: {
          transactionId,
          aiGenerated: false,
          status: "REVIEWED",
          confidenceScore: 100,
          reason: row.humanOverride.reason,
          payeeId: row.humanOverride.vendor ? vendorIdByName.get(row.humanOverride.vendor) ?? null : null,
          categoryId: row.humanOverride.category ? categoryIdByName.get(row.humanOverride.category) ?? null : null,
          createdAt: new Date(d(dateIso).getTime() + 60 * 60 * 1000),
        },
      });
      currentCatId = override.id;
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { categorizationId: currentCatId },
    });
  }
}

async function main() {
  console.log(
    `Clearing previous seed data (Greet table untouched), seeding ${TRANSACTIONS.length} transactions...`,
  );
  await clearSeedData();

  const categoryIdByName = await seedCategories();
  const vendorIdByName = await seedVendors();
  const { client, account } = await seedClient();
  const transactionIdByKey = await seedTransactions(account.id);
  await seedCategorizations(transactionIdByKey, vendorIdByName, categoryIdByName);

  console.log(`Seeded ${TRANSACTIONS.length} transactions for ${client.name}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
