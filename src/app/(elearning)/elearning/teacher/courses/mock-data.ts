export type CourseStatus = 'Draft' | 'Review' | 'Published';
export type LessonContentType = 'Video' | 'PDF' | 'Slide' | 'Text' | 'Exercise' | 'External Link';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: LessonContentType;
  contentUrl?: string; // S3 link, youtube link, etc.
  textContent?: string; // Rich text content if type is 'Text'
  isPreview: boolean; // Free preview
  isRequired: boolean;
  isIntroduction: boolean;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  coverImage: string;
  category: string;
  level: string; // Beginner, Intermediate, Advanced
  language: string;
  tags: string[];
  status: CourseStatus;
  sections: Section[];
  // Stats
  studentCount: number;
  lessonCount: number; // Calculated or stored
  completionRate?: number; 
  lastUpdated: string;
}

export const mockCourses: Course[] = [
  {
    id: "course-1",
    title: "IELTS Writing Task 2",
    description: "Master the structure and vocabulary needed to score 7.0+ in IELTS Writing Task 2.",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",
    category: "IELTS",
    level: "Intermediate",
    language: "English",
    tags: ["Writing", "IELTS", "Academic"],
    status: "Published",
    studentCount: 120,
    lessonCount: 12,
    completionRate: 68,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sections: [
      {
        id: "section-1",
        title: "Introduction",
        lessons: [
          {
            id: "lesson-1",
            title: "Understanding the Prompt",
            description: "How to break down an IELTS Task 2 prompt.",
            duration: 15,
            type: "Video",
            isPreview: true,
            isRequired: true,
            isIntroduction: true,
            contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          },
          {
            id: "lesson-2",
            title: "Scoring Criteria",
            description: "Learn how examiners grade your essay.",
            duration: 10,
            type: "PDF",
            isPreview: false,
            isRequired: true,
            isIntroduction: false,
          }
        ]
      },
      {
        id: "section-2",
        title: "Essay Structures",
        lessons: [
          {
            id: "lesson-3",
            title: "Opinion Essays (Agree/Disagree)",
            description: "Structure for opinion essays.",
            duration: 20,
            type: "Video",
            isPreview: false,
            isRequired: true,
            isIntroduction: false,
          }
        ]
      }
    ]
  },
  {
    id: "course-2",
    title: "Business English Fundamentals",
    description: "Essential English communication skills for the modern workplace.",
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&q=80",
    coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80",
    category: "Business",
    level: "Beginner",
    language: "English",
    tags: ["Communication", "Business", "Speaking"],
    status: "Draft",
    studentCount: 58,
    lessonCount: 8,
    completionRate: 0,
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    sections: [
      {
        id: "section-3",
        title: "Emails & Correspondence",
        lessons: [
          {
            id: "lesson-4",
            title: "Writing Professional Emails",
            description: "Tone, structure, and useful phrases.",
            duration: 25,
            type: "Video",
            isPreview: true,
            isRequired: false,
            isIntroduction: false,
          }
        ]
      }
    ]
  },
  {
    id: "course-3",
    title: "JLPT N2 Reading",
    description: "Advanced reading comprehension strategies for the JLPT N2 exam.",
    thumbnail: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=500&q=80",
    coverImage: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80",
    category: "JLPT",
    level: "Advanced",
    language: "Japanese",
    tags: ["Reading", "JLPT", "N2"],
    status: "Published",
    studentCount: 35,
    lessonCount: 20,
    completionRate: 85,
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    sections: [
      {
        id: "section-4",
        title: "Short Passages",
        lessons: [
          {
            id: "lesson-5",
            title: "Identifying the Author's Opinion",
            description: "Key grammar points that indicate opinions.",
            duration: 30,
            type: "Video",
            isPreview: false,
            isRequired: true,
            isIntroduction: false,
          }
        ]
      }
    ]
  }
];
