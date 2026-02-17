export function calculateSimilarity(title1: string, title2: string) {
  const normalize = (str: string) =>
    str.toLowerCase().trim().split(" ");

  const words1 = normalize(title1);
  const words2 = normalize(title2);

  const common = words1.filter(word => words2.includes(word));

  return common.length / Math.max(words1.length, words2.length);
}
