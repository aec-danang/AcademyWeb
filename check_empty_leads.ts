import { prisma } from './src/lib/prisma';

async function main() {
  const emptyEmailLeads = await prisma.lead.findMany({
    where: {
      OR: [
        { email: null },
        { email: '' }
      ]
    }
  });
  console.log("Empty email leads:");
  console.table(emptyEmailLeads.map(l => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    message: l.message,
    status: l.status,
    createdAt: l.createdAt
  })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
