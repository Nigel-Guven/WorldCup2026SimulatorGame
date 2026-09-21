export function generatePenaltySequence(
  scoreA: number,
  scoreB: number
): { seqA: string[]; seqB: string[] } {
  const seqA: string[] = [];
  const seqB: string[] = [];

  // Determine standard 5-round shootout vs sudden death
  const maxScore = Math.max(scoreA, scoreB);
  const totalRounds = maxScore >= 5 ? maxScore : 5;

  let currentA = 0;
  let currentB = 0;

  for (let round = 1; round <= totalRounds; round++) {
    // Determine Team A outcome for this round
    if (currentA < scoreA && (scoreA - currentA >= totalRounds - round + 1 || Math.random() > 0.3)) {
      seqA.push('G');
      currentA++;
    } else if (currentA < scoreA) {
      seqA.push('G');
      currentA++;
    } else {
      seqA.push('R');
    }

    // Determine Team B outcome for this round
    if (currentB < scoreB && (scoreB - currentB >= totalRounds - round + 1 || Math.random() > 0.3)) {
      seqB.push('G');
      currentB++;
    } else if (currentB < scoreB) {
      seqB.push('G');
      currentB++;
    } else {
      seqB.push('R');
    }

    // Stop early in standard 5 rounds if mathematically uncatchable
    if (round <= 5) {
      const remainingA = 5 - round;
      const remainingB = 5 - (seqB.length === round ? round : round - 1);

      if (currentA > currentB + remainingB || currentB > currentA + remainingA) {
        break;
      }
    }
  }

  return { seqA, seqB };
}