import type { GroupState } from "./groupState";
import type { MatchFixture } from "./matchFixture";

export interface TournamentSession {
  id: string;
  groups: GroupState[];
  fixtures: MatchFixture[];
  isGroupStageCompleted: boolean;
}