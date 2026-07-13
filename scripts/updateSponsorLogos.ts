import { prisma } from "../src/lib/prisma";

const sponsorLogos = [
  { name: "FPT", imageUrl: "https://fpt.com/-/media/project/fpt-corporation/fpt/common/images/navigation/logo/fpt-logo.svg", website: "https://fpt.com.vn", order: 1 },
  { name: "Bách Khoa", imageUrl: "https://dut.udn.vn/portals/_default/skins/dhbk/img/front/logo.png", website: "https://dut.udn.vn", order: 2 },
  { name: "Kinh Tế", imageUrl: "https://due.udn.vn/portals/_default/skins/dhkt/img/front/logoDUE.png", website: "https://due.udn.vn", order: 3 },
  { name: "VNPT", imageUrl: "https://www.vnpt.com.vn/common/assets_v1/images/logo/vnpt_logo.png", website: "https://vnpt.vn", order: 4 },
  { name: "Viettel", imageUrl: "https://viettel.com.vn/static/images/logo-header.0ce71c2fd94a.png", website: "https://viettel.com.vn", order: 5 },
  { name: "DOOSAN", imageUrl: "https://www.doosan.com/images/common/CI_new.png", website: "https://doosan.com", order: 6 },
  { name: "LIXIL", imageUrl: "https://www.lixil.com/en/about/img/about_brand_tostem_img.png", website: "https://lixil.com", order: 7 },
  { name: "mobifone", imageUrl: "https://www.mobifone.vn/assets/source/image/logo.png?v=1.01", website: "https://mobifone.vn", order: 8 },
  { name: "ABBANK", imageUrl: "https://www.abbank.vn/uploads/images/2026/02/01/logo-160x62-697e39f2c1aaa.png", website: "https://abbank.vn", order: 9 },
  { name: "Heineken", imageUrl: "https://www.theheinekencompany.com/sites/heineken-corp/files/HeinekenLogo.png", website: "https://heineken.com", order: 10 },
  { name: "EVN", imageUrl: "https://www.evn.com.vn/EVNTheme/assets/svg/logos/EVN-TTTDTTH.png", website: "https://evn.com.vn", order: 11 },
];

async function main() {
  for (const sponsor of sponsorLogos) {
    await prisma.sponsor.updateMany({
      where: { name: sponsor.name },
      data: {
        imageUrl: sponsor.imageUrl,
        website: sponsor.website,
        order: sponsor.order,
      },
    });
  }

  console.log("Sponsor logo records updated");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });