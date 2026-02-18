export function calculateValidationScore(data: {
  problem: string;
  targetAudience: string;
  revenueModel: string;
  requiredSkills?: string[];
  budget?: string;
  summary: string;
}) {
  let score = 0;

  if (data.problem.length > 30) score += 20;
  if (data.targetAudience.length > 20) score += 15;
  if (data.revenueModel.length > 20) score += 20;
  if (data.requiredSkills && data.requiredSkills.length > 0) score += 10;
  if (data.budget) score += 10;
  if (data.summary.length > 50) score += 10;

  if (/\d/.test(data.summary)) score += 5; // contains numbers

  score += 10; // category assumed present

  return score;
}
