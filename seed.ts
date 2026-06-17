import { prisma } from './src/lib/prisma';

async function main() {
  const count = await prisma.sponsor.count();
  if (count === 0) {
    await prisma.sponsor.createMany({
      data: [
        { name: 'FPT', imageUrl: 'https://logo.clearbit.com/fpt.com.vn', website: 'https://fpt.com.vn', order: 1 },
        { name: 'Bách Khoa', imageUrl: 'https://logo.clearbit.com/dut.udn.vn', website: 'https://dut.udn.vn', order: 2 },
        { name: 'Kinh Tế', imageUrl: 'https://logo.clearbit.com/due.udn.vn', website: 'https://due.udn.vn', order: 3 },
        { name: 'VNPT', imageUrl: 'https://logo.clearbit.com/vnpt.vn', website: 'https://vnpt.vn', order: 4 },
        { name: 'Viettel', imageUrl: 'https://logo.clearbit.com/viettel.com.vn', website: 'https://viettel.com.vn', order: 5 },
        { name: 'DOOSAN', imageUrl: 'https://logo.clearbit.com/doosan.com', website: 'https://doosan.com', order: 6 },
        { name: 'LIXIL', imageUrl: 'https://logo.clearbit.com/lixil.com', website: 'https://lixil.com', order: 7 },
        { name: 'mobifone', imageUrl: 'https://logo.clearbit.com/mobifone.vn', website: 'https://mobifone.vn', order: 8 },
        { name: 'ABBANK', imageUrl: 'https://logo.clearbit.com/abbank.vn', website: 'https://abbank.vn', order: 9 },
        { name: 'Heineken', imageUrl: 'https://logo.clearbit.com/heineken.com', website: 'https://heineken.com', order: 10 },
        { name: 'EVN', imageUrl: 'https://logo.clearbit.com/evn.com.vn', website: 'https://evn.com.vn', order: 11 }
      ]
    });
    console.log('Seeded');
  } else {
    console.log('Already seeded');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
