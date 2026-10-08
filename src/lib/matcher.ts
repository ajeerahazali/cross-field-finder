// Local, in-browser job matching. No search text ever leaves the device.

export const SKILLS: Record<string, string[]> = {
  health: ["nurse", "nursing", "rn", "clinical", "clinic", "medical", "medicine", "patient", "hospital", "healthcare", "doctor", "physician", "caregiver", "paramedic", "midwife", "pharmacy", "pharmacist"],
  tech: ["code", "coder", "coding", "developer", "dev", "software", "programmer", "programming", "engineer", "python", "javascript", "web", "app", "it", "data", "tech", "computer"],
  food: ["chef", "cook", "cooking", "kitchen", "culinary", "baker", "baking", "food", "restaurant", "pastry", "gastronomy"],
  science: ["chemistry", "chemist", "chem", "lab", "laboratory", "biology", "biochem", "science", "scientist", "physics", "research"],
  law: ["law", "lawyer", "legal", "attorney", "paralegal", "solicitor", "compliance", "contract"],
  art: ["art", "artist", "design", "designer", "illustrator", "drawing", "painting", "creative", "graphic", "ux", "ui"],
  music: ["music", "musician", "audio", "sound", "composer", "singer", "dj", "producer"],
  teach: ["teacher", "teaching", "tutor", "education", "educator", "lecturer", "trainer", "school"],
  finance: ["finance", "accountant", "accounting", "banking", "banker", "money", "economics", "investment", "bookkeeping"],
  nature: ["farm", "farmer", "farming", "agriculture", "garden", "gardener", "plants", "botany", "environment", "ecology", "climate"],
  sport: ["sport", "sports", "athlete", "coach", "fitness", "trainer", "gym", "physio"],
  words: ["writer", "writing", "journalist", "editor", "copywriter", "author", "content", "storytelling"],
};

export type Job = { title: string; company: string; skills: string[]; why: string; pay: string; url: string };

// Curated hybrid roles at real Malaysian organisations.
export const JOBS: Job[] = [
  { title: "Clinical Informatics Specialist", company: "Sunway Medical Centre · Subang Jaya", skills: ["health", "tech"], why: "Bridges hospital wards and the electronic medical record system.", pay: "RM 7,500 / mo", url: "https://www.sunwaymedical.com/careers/" },
  { title: "Food Scientist", company: "Nestlé Malaysia · Petaling Jaya", skills: ["food", "science"], why: "Turns kitchen instinct into repeatable, safe recipes at scale.", pay: "RM 6,200 / mo", url: "https://www.nestle.com.my/jobs" },
  { title: "Legal Tech Product Lead", company: "ZICO Law · Kuala Lumpur", skills: ["law", "tech"], why: "Knows contracts and code in the same breath.", pay: "RM 9,800 / mo", url: "https://www.zicolaw.com/careers/" },
  { title: "Audio Software Developer", company: "Media Prima Digital · Bangsar", skills: ["music", "tech"], why: "Hears the bug before it shows up.", pay: "RM 8,100 / mo", url: "https://corporate.mediaprima.com.my/careers/" },
  { title: "Medical Illustrator", company: "Taylor's University School of Medicine · Subang", skills: ["health", "art"], why: "Draws the body accurately and beautifully for teaching.", pay: "RM 5,400 / mo", url: "https://careers.taylors.edu.my/" },
  { title: "Science Curriculum Designer", company: "Cikgu-fy EdTech · Kuala Lumpur", skills: ["teach", "science"], why: "Makes chemistry make sense to 14-year-olds.", pay: "RM 5,900 / mo", url: "https://www.jobstreet.com.my/en/job-search/edtech-jobs/" },
  { title: "Agri-Data Analyst", company: "Sime Darby Plantation · Carey Island", skills: ["nature", "tech"], why: "Reads soil and spreadsheets across palm estates.", pay: "RM 6,800 / mo", url: "https://www.simedarbyplantation.com/careers" },
  { title: "Sports Rehab Coordinator", company: "Institut Sukan Negara · Bukit Jalil", skills: ["sport", "health"], why: "Gets national athletes back on the field safely.", pay: "RM 6,000 / mo", url: "https://isn.gov.my/career/" },
  { title: "Fintech UX Designer", company: "Grab Malaysia · Petaling Jaya", skills: ["finance", "art"], why: "Makes money screens calm, not scary.", pay: "RM 7,700 / mo", url: "https://www.grab.com/my/careers/" },
  { title: "Health Content Writer", company: "DoctorOnCall · Kuala Lumpur", skills: ["words", "health"], why: "Explains medicine without the jargon.", pay: "RM 4,800 / mo", url: "https://www.doctoroncall.com.my/careers" },
  { title: "Culinary Instructor", company: "KDU University College · Shah Alam", skills: ["food", "teach"], why: "Teaches cooking with real patience.", pay: "RM 4,500 / mo", url: "https://kdu.edu.my/careers/" },
  { title: "Regulatory Affairs Chemist", company: "Pharmaniaga · Puchong", skills: ["science", "law"], why: "Bridges the lab and the NPRA rulebook.", pay: "RM 8,400 / mo", url: "https://www.pharmaniaga.com/careers/" },
];

const STOP = new Set(["and", "with", "plus", "or", "a", "an", "the", "who", "i", "am", "background", "in", "of", "+", "&", "also", "who's", "former", "ex"]);

function stem(w: string) {
  return w.replace(/(ing|ers|er|ist|ists|s)$/, "");
}

const INDEX = new Map<string, string>();
for (const [skill, words] of Object.entries(SKILLS)) {
  for (const w of words) {
    INDEX.set(w, skill);
    INDEX.set(stem(w), skill);
  }
  INDEX.set(skill, skill);
}

function lev(a: string, b: string) {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length]![b.length]!;
}

function toSkill(token: string): string | undefined {
  const hit = INDEX.get(token) ?? INDEX.get(stem(token));
  if (hit) return hit;
  if (token.length < 4) return undefined;
  // tolerate typos like "nurce" or "chemestry"
  for (const [w, s] of INDEX) if (w.length >= 4 && lev(token, w) <= (token.length > 6 ? 2 : 1)) return s;
  return undefined;
}

export function detectSkills(query: string): string[] {
  const tokens = query.toLowerCase().split(/[^a-z']+/).filter((t) => t && !STOP.has(t));
  const found = new Set<string>();
  // check two-word phrases first, e.g. "patient care", "web dev"
  for (const t of tokens) {
    const s = toSkill(t);
    if (s) found.add(s);
  }
  return [...found];
}

export function search(query: string) {
  const skills = detectSkills(query);
  if (!skills.length) return { skills, results: [] as (Job & { score: number })[] };
  const results = JOBS.map((j) => ({ ...j, score: j.skills.filter((s) => skills.includes(s)).length }))
    .filter((j) => j.score > 0)
    .sort((a, b) => b.score - a.score);
  return { skills, results };
}
