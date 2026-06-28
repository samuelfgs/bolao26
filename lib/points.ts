export function calculateGuessPoints(
  homeGuess: number | null,
  awayGuess: number | null,
  homeScore: number | null,
  awayScore: number | null
): number {
  if (homeGuess === null || awayGuess === null || homeScore === null || awayScore === null) {
    return 0;
  }

  const exactScore = homeGuess === homeScore && awayGuess === awayScore;
  if (exactScore) return 3;

  const guessWinner = homeGuess > awayGuess ? "home" : homeGuess < awayGuess ? "away" : "draw";
  const matchWinner = homeScore > awayScore ? "home" : homeScore < awayScore ? "away" : "draw";

  if (guessWinner === matchWinner) return 1;

  return 0;
}
