/**
 * Clanker.College forbidden vocabulary (consumer-education drift).
 * Block these in UI copy and content. See DRIFT_DETECTOR.md.
 */
export const FORBIDDEN_PHRASES = [
  "buy course",
  "start learning",
  "enroll now",
  "students",
  "instructor",
  "instructors",
  "lectures",
  "graduation",
  "curriculum bundle",
  "lesson bundle",
  "what you'll learn",
  "course",
  "courses",
] as const;

export const FORBIDDEN_REGEX = new RegExp(
  FORBIDDEN_PHRASES.join("|"),
  "gi"
);

export function hasForbiddenVocabulary(text: string): { phrase: string; index: number } | null {
  const m = text.match(FORBIDDEN_REGEX);
  if (!m) return null;
  const phrase = m[0];
  const index = text.toLowerCase().indexOf(phrase.toLowerCase());
  return { phrase, index };
}
