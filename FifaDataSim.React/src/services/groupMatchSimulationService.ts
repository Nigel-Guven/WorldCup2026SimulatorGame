import type { Country } from "../types/country";
import { SimulationEngineService } from "./simulationEngineService";

export class GroupMatchSimulationEngine {

  public static simulateMatch(
    home: Country,
    away: Country
  ): {
    home: number;
    away: number;
  } {
    const expectedGoals =
      SimulationEngineService.calculateExpectedGoals(
        home,
        away
      );

    const homeGoals =
      SimulationEngineService.knuthPoissonRandom(
        expectedGoals.home
      );

    const awayGoals =
      SimulationEngineService.knuthPoissonRandom(
        expectedGoals.away
      );

    return {
      home: homeGoals,
      away: awayGoals,
    };
  }
}