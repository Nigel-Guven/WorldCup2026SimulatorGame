using System.Text.Json.Serialization;

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
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Confederation Confederation { get; set; }
    
    [JsonPropertyName("football_association")]
    public string FootballAssociationName { get; set; } = string.Empty;
    
    [JsonPropertyName("default_points")]
    public double DefaultRankingPoints { get; set; }
    
    [JsonPropertyName("strength_attack")]
    public int StrengthAttack { get; set; }

    [JsonPropertyName("strength_defence")] 
    public int StrengthDefence { get; set; }

    [JsonPropertyName("flag_url")] 
    public string FlagUrl { get; set; } = string.Empty;
    
    [JsonPropertyName("home_stadium")]
    public string HomeStadium { get; set; } = string.Empty;
    
    [JsonPropertyName("form")]
    public string Form { get; set; } = string.Empty;
    
    [JsonPropertyName("home_advantage")]
    public double HomeAdvantage { get; set; }
    
    [JsonPropertyName("is_starred")]
    public bool IsStarred { get; set; } = false;
    
    [JsonPropertyName("is_official")]
    public bool IsOfficial { get; set; }
}