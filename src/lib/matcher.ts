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

export type Job = { title: string; company: string; skills: string[]; why: string; pay: string };

export const JOBS: Job[] = [
  { title: "Clinical Informatics Specialist", company: "Brightward Health", skills: ["health", "tech"], why: "Builds tools nurses actually want to use.", pay: "RM 7,500 / mo" },
  { title: "Food Scientist", company: "Kettle & Flask Co.", skills: ["food", "science"], why: "Turns kitchen instinct into repeatable recipes.", pay: "RM 6,200 / mo" },
  { title: "Legal Tech Product Lead", company: "Clausewise", skills: ["law", "tech"], why: "Knows contracts and code in the same breath.", pay: "RM 9,800 / mo" },
  { title: "Audio Software Developer", company: "Hummingtone Labs", skills: ["music", "tech"], why: "Hears the bug before it shows up.", pay: "RM 8,100 / mo" },
  { title: "Medical Illustrator", company: "Anatomie Studio", skills: ["health", "art"], why: "Draws the body accurately and beautifully.", pay: "RM 5,400 / mo" },
  { title: "Science Curriculum Designer", company: "Lumen Learning Lab", skills: ["teach", "science"], why: "Makes chemistry make sense to 14-year-olds.", pay: "RM 5,900 / mo" },
  { title: "Agri-Data Analyst", company: "Paddy & Pixel", skills: ["nature", "tech"], why: "Reads soil and spreadsheets.", pay: "RM 6,800 / mo" },
  { title: "Sports Rehab Coordinator", company: "Kinetic Ward", skills: ["sport", "health"], why: "Gets athletes back on the field safely.", pay: "RM 6,000 / mo" },
  { title: "Fintech UX Designer", company: "Ringgit Rounds", skills: ["finance", "art"], why: "Makes money screens calm, not scary.", pay: "RM 7,700 / mo" },
  { title: "Health Content Writer", company: "Wellnote Media", skills: ["words", "health"], why: "Explains medicine without the jargon.", pay: "RM 4,800 / mo" },
  { title: "Culinary Instructor", company: "Saffron School", skills: ["food", "teach"], why: "Teaches cooking with real patience.", pay: "RM 4,500 / mo" },
  { title: "Regulatory Affairs Chemist", company: "Formula North", skills: ["science", "law"], why: "Bridges the lab and the rulebook.", pay: "RM 8,400 / mo" },
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
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

function toSkill(token: string): string | undefined {
  const hit = INDEX.get(token) ?? INDEX.get(stem(token));
  if (hit) return hit;
  if (token.length < 4) return;
  // tolerate typos like "nurce" or "chemestry"
  for (const [w, s] of INDEX) if (w.length >= 4 && lev(token, w) <= (token.length > 6 ? 2 : 1)) return s;
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
