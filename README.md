# Academy English Center - Web Application

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack
- **Hosting:** Vercel
- **Database:** Neon (Serverless PostgreSQL)
- **Storage:** Cloudflare R2
- **Version Control:** GitHub

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load the Montserrat font family, as dictated by the design system.

---

# AEC Academy English Center — Public Website Design System

> Extracted and adapted from `Brand book sRGB.pdf`. Purpose: practical design rules for designing a public website for ACADEMY AEC.

## 1. Brand Overview

- **Brand / Company:** ACADEMY AEC / Academy English Center
- **Website:** academy.edu.vn
- **Address shown:** 98 Le Dinh Ly St, Da Nang
- **Founded:** 2006
- **Original founding location:** 104/9 Le Dinh Ly, Da Nang
- **Business:** English education center for learners from age 4+
- **Programs:** Kid English & Skills, Teen English & Skills, IELTS, TOEFL, TOEIC, Test Prep, Adult Learners, General English, Communication English, Corporate English, ESP, soft skills in English, Skills / Counseling / Community

## 2. Brand Positioning

**Brand personality:** professional, educational, trusted, modern, energetic, optimistic, student-centered, community-focused, international-standard, humanistic.

**Website feeling:** bright, clean, international, trustworthy, friendly, achievement-focused, professional.

**Avoid:** childish look, cold corporate look, too many colors, heavy gradients, random icons, excessive shadows, full dark website.

## 3. Vision, Mission, and Message

**Vision:** Build ACADEMY AEC into a dedicated learning community that serves carefully, wholeheartedly, and professionally for the future of learners and society.

**Mission:** Educate people through English so they become successful global citizens responsible toward themselves and the community.

**Founder expectations:**
1. Provide high-quality, diverse, international-standard English training.
2. Develop soft skills and life values so learners become confident global citizens.
3. Maintain professionalism and humanistic education values, putting student needs and character first.
4. Build a dedicated learning and service community for the future of learners and society.

**Meaning behind the expectations:**
1. English is a tool to capture the future and open opportunities.
2. Soft skills and life values nurture character.
3. Student needs mean preparing learners for life and community integration.
4. A learning and service community becomes a model incubator for community spirit.

## 4. Logo Meaning

The AEC logo is adjusted from the old logo with a modern, forward-moving, light, and connected direction.

**Logo symbol meanings:**
- Human: learner-centered education.
- Open book: learning, knowledge, education.
- New page / new chapter: AEC’s development and integration journey.
- Bird / wing shape: growth, ambition, flying higher.
- V shape: Vietnam, Victory, success, glory.

**Brand message from logo:** AEC is a modern, international-standard education environment that helps young learners study successfully, grow with strong will, and become responsible global citizens.

## 5. Logo Usage Rules

**Allowed logo versions:**
- Full-color logo on white or light background.
- Inverted logo for dark navy background.
- Monochrome logo for special print or dark-background situations.
- Vertical logo layout.
- Horizontal logo layout.

**Recommended website logo usage:**
- Use the **horizontal logo** in website header/navigation.
- Use the **vertical logo** in footer, loading screen, brand intro section, or about page.
- Use inverted logo on navy sections.

**Logo clear space:** keep safe empty area around the logo. For website use, reserve at least **0.5× logo height** on all sides.

**Logo don'ts:**
- Do not change logo ratio.
- Do not recolor the logo outside approved versions.
- Do not turn the logo into outline.
- Do not add shadow to the logo.
- Do not add gradient to the logo.
- Do not place logo on low-contrast background.
- Do not change logo font or letter spacing.
- Do not rebuild or redraw the logo.

## 6. Color System

**AEC Orange**
- HEX: `#f68d2e`
- RGB: `rgb(246, 141, 46)`
- Pantone: `715C`
- Use for CTA buttons, highlights, active states, icons, badges, section accents.

**AEC Navy**
- HEX: `#2c2d65`
- RGB: `rgb(44, 45, 101)`
- Pantone: `2119C`
- Use for headings, body text, footer, navigation text, serious/trust-focused sections.

**Orange palette:**
```css
--orange-50:#fef4eb; --orange-100:#fcdabc; --orange-200:#fac18d;
--orange-300:#f8a75e; --orange-500:#f68d2e; --orange-600:#ea740a;
--orange-700:#bb5d08; --orange-800:#8c4606; --orange-900:#5b2e04;
--orange-950:#2e1702;
```

**Navy palette:**
```css
--navy-50:#f0f0f8; --navy-100:#cecef9; --navy-200:#acaddb;
--navy-300:#8a8bcc; --navy-400:#6869bd; --navy-500:#4a4baa;
--navy-600:#3b3c88; --navy-800:#2c2d65; --navy-900:#1d1e44;
--navy-950:#0e0f22;
```

**Website color usage:**
| Use | Color |
|---|---|
| Main CTA | `#f68d2e` |
| CTA hover | `#ea740a` |
| Main heading | `#2c2d65` |
| Body text | `#2c2d65` or dark gray |
| Footer background | `#2c2d65` |
| Light orange background | `#fef4eb` |
| Light navy background | `#f0f0f8` |
| Cards | `#ffffff` |
| Icons | `#f68d2e` |
| Dark card background | `#2c2d65` |
| Dark section text | `#ffffff` |

**Gradient:** use only as decoration, never on the logo.
```css
background:linear-gradient(90deg,#f68d2e 0%,#2c2d65 100%);
```
Recommended use: hero overlay, CTA banner, divider, card hover accent, footer decorative strip.

## 7. Typography

**Primary font:** `Montserrat`. Use it across the full website.
```css
font-family:"Montserrat",sans-serif;
```

**Font weights:**
| Use | Weight |
|---|---|
| Hero heading | 800 / ExtraBold |
| Section heading | 700 / Bold |
| Card title | 700 / Bold |
| Navigation | 600 / SemiBold |
| Body text | 400 / Regular |
| Captions | 400 or 500 |
| Buttons | 700 / Bold |

**Type scale:**
```css
--text-xs:.75rem; --text-sm:.875rem; --text-base:1rem; --text-lg:1.125rem;
--text-xl:1.25rem; --text-2xl:1.5rem; --text-3xl:2rem;
--text-4xl:2.5rem; --text-5xl:3.5rem;
```

**Heading rules:** bold Montserrat, navy for most headings, orange for emphasis words, uppercase only for short impact headings, large and easy to scan.

## 8. Graphic Elements

**Main graphic element:** use the abstract AEC logo symbol as a recurring human/book/bird-wing shape.

**Allowed styles:** filled shape, outline shape, low-opacity watermark, orange/navy pattern, cropped oversized corner shape, official palette recolor only.

**Recommended opacity:**
```css
opacity:.04; /* subtle */ 
opacity:.12; /* stronger but safe */
```

**Website uses:** hero background, footer texture, program card decoration, section background watermark, CTA banner pattern, about page identity.

## 9. Layout System

**General style:** strong orange/navy contrast, big bold headings, clean white cards, subtle grid backgrounds, large logo-derived shapes, thick footer/header bars, rounded modern UI, professional education style.

**Container:**
```css
.container{max-width:1200px;margin:0 auto;padding:0 24px;}
```

**Grid:** desktop 12 columns, tablet 6 columns, mobile 1 column.

**Section spacing:**
```css
section{padding:80px 0;}
@media(max-width:768px){section{padding:48px 0;}}
```

## 10. UI Components

**Primary button:**
```css
.btn-primary{background:#f68d2e;color:#fff;border-radius:999px;padding:14px 24px;font-weight:700;border:0;}
.btn-primary:hover{background:#ea740a;}
```

**Secondary button:**
```css
.btn-secondary{background:#fff;color:#2c2d65;border:2px solid #2c2d65;border-radius:999px;padding:14px 24px;font-weight:700;}
```

**Dark button:**
```css
.btn-dark{background:#2c2d65;color:#fff;border-radius:999px;padding:14px 24px;font-weight:700;}
```

**Card:**
```css
.card{background:#fff;border-radius:24px;padding:32px;box-shadow:0 16px 40px rgba(44,45,101,.08);}
```

**Card rules:** orange icons, navy titles, white background, rounded corners, soft shadow, optional orange top border.

## 11. Navbar and Footer

**Navbar structure:** `Logo | Programs | IELTS | Kids & Teens | Corporate | About | Teachers | Contact | Register`

**Navbar rules:** white background, navy text, orange active underline, orange Register button, sticky header recommended, horizontal logo recommended.

**Footer rules:** navy background, white text, orange icons, inverted/white logo, address, phone, email, website, social links, quick links, course links.

## 12. Homepage Structure

1. **Header:** logo, programs, IELTS, Kids & Teens, Corporate, About AEC, Contact, Register Now.
2. **Hero:** headline `Learn English. Build Confidence. Become a Global Citizen.`
3. **Vietnamese hero option:** `Học tiếng Anh vững chắc, tự tin hội nhập toàn cầu.`
4. **Hero subtext:** `Academy English Center provides high-quality English programs for kids, teens, IELTS learners, working adults, and corporate teams in Da Nang.`
5. **Hero CTAs:** Find Your Course, Book Placement Test.
6. **Hero visual:** student photo, orange abstract logo shape, navy block, achievement badges.
7. **Program categories:** Kids, Teens, IELTS, TOEFL/TOEIC/Test Prep, Adult English, Communication English, Corporate English, Skills & Counseling.
8. **Why Choose AEC:** use four founder expectations as benefit cards.
9. **Vision and Mission:** two large cards.
10. **IELTS/Test Prep highlight:** conversion section for IELTS, TOEFL, TOEIC, Test Prep.
11. **Teachers / Academic Team:** photo, name, qualification, specialization.
12. **Student Success / Testimonials:** navy/orange cards.
13. **Placement Test CTA:** `Not sure which course fits you? Take a placement test and get a learning path.`
14. **Footer:** navy footer with orange icons and quick links.

## 13. Complete CSS Tokens

```css
:root{
  --color-orange:#f68d2e; --color-orange-hover:#ea740a;
  --color-navy:#2c2d65; --color-navy-dark:#1d1e44; --color-navy-deep:#0e0f22;
  --color-orange-light:#fef4eb; --color-navy-light:#f0f0f8; --color-white:#fff;
  --text-main:#2c2d65; --text-muted:#5f607a; --text-white:#fff;
  --font-main:"Montserrat",sans-serif;
  --radius-sm:8px; --radius-md:16px; --radius-lg:24px; --radius-pill:999px;
  --shadow-card:0 16px 40px rgba(44,45,101,.08);
  --shadow-button:0 8px 20px rgba(246,141,46,.28);
  --container:1200px; --section-padding:80px;
}
```

## 14. Design System Name

**AEC Bright Learning System**

A bright, professional, student-centered education design system using AEC orange for energy, AEC navy for trust, Montserrat for modern clarity, and logo-derived wing/book graphics for brand recognition.

## 15. Final Rules Checklist

- Use Montserrat only.
- Use `#f68d2e` for energy, CTAs, icons, and highlights.
- Use `#2c2d65` for trust, headings, body text, footer, and serious sections.
- Keep the website mostly white and clean.
- Use the logo exactly as provided.
- Use logo-derived shapes as subtle background graphics.
- Make the website professional, modern, and friendly.
- Use real students, teachers, classrooms, and success stories.
- Put course registration and placement test CTAs in key locations.
- Keep layouts bold, rounded, clean, and easy to scan.
- Never distort, recolor, shadow, outline, or add gradient to the logo.
