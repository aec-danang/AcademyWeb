import { prisma } from './src/lib/prisma';

async function main() {
  const leads = await prisma.lead.findMany();
  console.log(`Found ${leads.length} leads.`);

  const seenEmails = new Set<string>();
  let deletedDuplicates = 0;
  let updatedEmails = 0;

  for (const lead of leads) {
    if (!lead.email || lead.email.trim() === '') {
      continue; // keep empty email records, don't dedup them
    }

    const lowerEmail = lead.email.toLowerCase().trim();

    // Deduplicate by email
    if (seenEmails.has(lowerEmail)) {
      await prisma.lead.delete({ where: { id: lead.id } });
      deletedDuplicates++;
      continue;
    }
    seenEmails.add(lowerEmail);

    // Update email to lowercase if needed
    if (lead.email !== lowerEmail) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { email: lowerEmail }
      });
      updatedEmails++;
    }
  }

  console.log(`Deleted Duplicates (by email): ${deletedDuplicates}`);
  console.log(`Updated Emails to Lowercase: ${updatedEmails}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
