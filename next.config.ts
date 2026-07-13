import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/new/gioi-thieu', destination: '/about', permanent: true },
      { source: '/new/tin-tuc-su-kien', destination: '/news', permanent: true },
      { source: '/new/lich-khai-giang', destination: '/schedule', permanent: true },
      { source: '/new/tieng-anh', destination: '/programs', permanent: true },
      { source: '/new/tieng-anh-thieu-nhi', destination: '/programs/kids', permanent: true },
      { source: '/new/tieng-anh-thieu-nien', destination: '/programs/teens', permanent: true },
      { source: '/new/luyen-thi-ielts', destination: '/programs/ielts', permanent: true },
      { source: '/new/tieng-anh-luyen-thi', destination: '/programs/testprep', permanent: true },
      { source: '/new/tieng-anh-can-ban-giao-tiep', destination: '/programs/communication', permanent: true },
      { source: '/new/tieng-anh-doanh-nghiep', destination: '/programs/corporate', permanent: true },
      { source: '/new/dien-thuyet-truoc-cong-chung', destination: '/programs/public-speaking', permanent: true },
      { source: '/new/du-hoc-he', destination: '/study-abroad', permanent: true },
      // Redirect old blog posts to the dynamic blog slug
      { source: '/new/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug', destination: '/blog/:slug', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
