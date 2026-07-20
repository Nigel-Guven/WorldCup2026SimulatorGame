using System.Text.Json.Serialization;
using WorldCupSimulator.Models.Countries;

namespace WorldCupSimulator.Models;

public class Country
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    [JsonPropertyName("short_name")]
    public string ShortName { get; set; } = string.Empty;
    [JsonPropertyName("confederation")]
    public Confederation Confederation { get; set; }
    [JsonPropertyName("football_association")]
    public string FootballAssociationName { get; set; } = string.Empty;
    [JsonPropertyName("default_points")]
    public int DefaultRankingPoints { get; set; }
    [JsonPropertyName("strength")]
    public int Strength { get; set; }
    [JsonPropertyName("flag_url")]
    public string FlagUrl { get; set; } = string.Empty;
    [JsonPropertyName("home_stadium")]
    public string HomeStadium { get; set; } = string.Empty;
}