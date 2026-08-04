using System.Text.Json;
using System.Text.Json.Serialization;

namespace FifaDataSim.Console;

public class TourneyFactory
{

// 1. Create the Hardcoded Configuration
public TournamentConfig GetHardcodedTournamentConfig() => new TournamentConfig
{
    TournamentName = "Global World Cup Qualifiers",
    TotalFinalsSlots = 32,
    Finals = new FinalsConfig { ParticipatingTeams = 32, Source = "Aggregated from Confederation Finals Destinations" },
    Confederations = new List<ConfederationConfig>
    {
        new ConfederationConfig
        {
            Id = "UEFA", TotalTeams = 90, QualifiedSlots = 10,
            Phases = new List<PhaseConfig>
            {
                new PhaseConfig { PhaseNumber = 1, Type = "MultiBranchKnockout", SeedCriteria = "Bottom 40", ParticipatingTeams = 40, Format = new FormatConfig { Paths = 10, TeamsPerPath = 4 }, Progression = new ProgressionConfig { AdvancingPerPath = 1, DestinationPhase = 2 } },
                new PhaseConfig { PhaseNumber = 2, Type = "GroupStage", SeedCriteria = "Top 50 + 10 Phase 1 Winners", ParticipatingTeams = 60, Format = new FormatConfig { Groups = 10, TeamsPerGroup = 6 }, Progression = new ProgressionConfig { AdvancingPerGroup = 1, Destination = "Finals" } }
            }
        },
        new ConfederationConfig
        {
            Id = "CONMEBOL", TotalTeams = 13, QualifiedSlots = 6,
            Phases = new List<PhaseConfig>
            {
                new PhaseConfig { PhaseNumber = 1, Type = "SingleEliminationKnockout", SeedCriteria = "Bottom 4", ParticipatingTeams = 4, Format = new FormatConfig { Paths = 1, TeamsPerPath = 4 }, Progression = new ProgressionConfig { AdvancingPerPath = 1, DestinationPhase = 2 } },
                new PhaseConfig { PhaseNumber = 2, Type = "SingleLeague", SeedCriteria = "Top 9 + 1 Phase 1 Winner", ParticipatingTeams = 10, Format = new FormatConfig { Groups = 1, TeamsPerGroup = 10 }, Progression = new ProgressionConfig { AdvancingPerGroup = 6, Destination = "Finals" } }
            }
        },
        new ConfederationConfig
        {
            Id = "AFC", TotalTeams = 70, QualifiedSlots = 5,
            Phases = new List<PhaseConfig>
            {
                new PhaseConfig { PhaseNumber = 1, Type = "MultiBranchKnockout", SeedCriteria = "Bottom 20", ParticipatingTeams = 20, Format = new FormatConfig { Paths = 10, TeamsPerPath = 2 }, Progression = new ProgressionConfig { AdvancingPerPath = 1, DestinationPhase = 2 } },
                new PhaseConfig { PhaseNumber = 2, Type = "MultiBranchKnockout", SeedCriteria = "Ranked 41-50 + 10 Phase 1 Winners", ParticipatingTeams = 20, Format = new FormatConfig { Paths = 10, TeamsPerPath = 2 }, Progression = new ProgressionConfig { AdvancingPerPath = 1, DestinationPhase = 3 } },
                new PhaseConfig { PhaseNumber = 3, Type = "GroupStage", SeedCriteria = "Top 40 + 10 Phase 2 Winners", ParticipatingTeams = 50, Format = new FormatConfig { Groups = 10, TeamsPerGroup = 5 }, Progression = new ProgressionConfig { AdvancingPerGroup = 2, DestinationPhase = 4 } },
                new PhaseConfig { PhaseNumber = 4, Type = "GroupStage", SeedCriteria = "20 Phase 3 Qualifiers", ParticipatingTeams = 20, Format = new FormatConfig { Groups = 5, TeamsPerGroup = 4 }, Progression = new ProgressionConfig { AdvancingPerGroup = 1, Destination = "Finals" } }
            }
        },
        new ConfederationConfig
        {
            Id = "OFC", TotalTeams = 27, QualifiedSlots = 1,
            Phases = new List<PhaseConfig>
            {
                new PhaseConfig { PhaseNumber = 1, Type = "MultiBranchKnockout", SeedCriteria = "Bottom 18", ParticipatingTeams = 18, Format = new FormatConfig { Paths = 9, TeamsPerPath = 2 }, Progression = new ProgressionConfig { AdvancingPerPath = 1, DestinationPhase = 2 } },
                new PhaseConfig { PhaseNumber = 2, Type = "GroupStage", SeedCriteria = "Top 9 + 9 Phase 1 Winners", ParticipatingTeams = 18, Format = new FormatConfig { Groups = 3, TeamsPerGroup = 6 }, Progression = new ProgressionConfig { AdvancingPerGroup = 1, DestinationPhase = 3 } },
                new PhaseConfig { PhaseNumber = 3, Type = "SingleLeague", SeedCriteria = "3 Phase 2 Winners", ParticipatingTeams = 3, Format = new FormatConfig { Groups = 1, TeamsPerGroup = 3 }, Progression = new ProgressionConfig { AdvancingPerGroup = 1, Destination = "Finals" } }
            }
        },
        new ConfederationConfig
        {
            Id = "CAF", TotalTeams = 77, QualifiedSlots = 6,
            Phases = new List<PhaseConfig>
            {
                new PhaseConfig { PhaseNumber = 1, Type = "MultiBranchKnockout", SeedCriteria = "Bottom 34", ParticipatingTeams = 34, Format = new FormatConfig { Paths = 17, TeamsPerPath = 2 }, Progression = new ProgressionConfig { AdvancingPerPath = 1, DestinationPhase = 2 } },
                new PhaseConfig { PhaseNumber = 2, Type = "GroupStage", SeedCriteria = "Top 43 + 17 Phase 1 Winners", ParticipatingTeams = 60, Format = new FormatConfig { Groups = 10, TeamsPerGroup = 6 }, Progression = new ProgressionConfig { AdvancingPerGroup = 1, DestinationPhase = 3 } },
                new PhaseConfig { PhaseNumber = 3, Type = "SingleLeague", SeedCriteria = "10 Phase 2 Winners", ParticipatingTeams = 10, Format = new FormatConfig { Groups = 1, TeamsPerGroup = 10 }, Progression = new ProgressionConfig { AdvancingPerGroup = 6, Destination = "Finals" } }
            }
        },
        new ConfederationConfig
        {
            Id = "CONCACAF", TotalTeams = 48, QualifiedSlots = 4,
            Phases = new List<PhaseConfig>
            {
                new PhaseConfig { PhaseNumber = 1, Type = "GroupStage", SeedCriteria = "All 48 Teams", ParticipatingTeams = 48, Format = new FormatConfig { Groups = 12, TeamsPerGroup = 4 }, Progression = new ProgressionConfig { AdvancingPerGroup = 1, DestinationPhase = 2 } },
                new PhaseConfig { PhaseNumber = 2, Type = "GroupStage", SeedCriteria = "12 Phase 1 Winners", ParticipatingTeams = 12, Format = new FormatConfig { Groups = 4, TeamsPerGroup = 3 }, Progression = new ProgressionConfig { AdvancingPerGroup = 1, Destination = "Finals" } }
            }
        }
    }
};


// 3. Define the DTO Classes
public class TournamentConfig
{
    public string TournamentName { get; set; } = string.Empty;
    public int TotalFinalsSlots { get; set; }
    public List<ConfederationConfig> Confederations { get; set; } = new();
    public FinalsConfig? Finals { get; set; }
}

public class ConfederationConfig
{
    public string Id { get; set; } = string.Empty;
    public int TotalTeams { get; set; }
    public int QualifiedSlots { get; set; }
    public List<PhaseConfig> Phases { get; set; } = new();
}

public class PhaseConfig
{
    public int PhaseNumber { get; set; }
    public string Type { get; set; } = string.Empty;
    public string SeedCriteria { get; set; } = string.Empty;
    public int ParticipatingTeams { get; set; }
    public FormatConfig? Format { get; set; }
    public ProgressionConfig? Progression { get; set; }
}

public class FormatConfig
{
    public int? Paths { get; set; }
    public int? TeamsPerPath { get; set; }
    public int? Groups { get; set; }
    public int? TeamsPerGroup { get; set; }
}

public class ProgressionConfig
{
    public int? AdvancingPerPath { get; set; }
    public int? AdvancingPerGroup { get; set; }
    public int? DestinationPhase { get; set; }
    public string? Destination { get; set; }
}

public class FinalsConfig
{
    public int ParticipatingTeams { get; set; }
    public string Source { get; set; } = string.Empty;
}
}