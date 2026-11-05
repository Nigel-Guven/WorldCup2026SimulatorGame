export function isValidSwissLeague(
  numberOfTeams: number,
  matchesPerTeam: number
): boolean {
  return (
    Number.isInteger(numberOfTeams) &&
    Number.isInteger(matchesPerTeam) &&
    numberOfTeams >= 2 &&
    matchesPerTeam >= 1 &&
    matchesPerTeam <= numberOfTeams - 1 &&
    (numberOfTeams * matchesPerTeam) % 2 === 0
  );
}