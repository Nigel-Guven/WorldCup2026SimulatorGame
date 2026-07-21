namespace WorldCupSimulator.Models;

public class KnockoutBracket
{
    public List<KnockoutMatch> RoundOf32 { get; set; } = new();
    public List<KnockoutMatch> RoundOf16 { get; set; } = new();
    public List<KnockoutMatch> QuarterFinals { get; set; } = new();
    public List<KnockoutMatch> SemiFinals { get; set; } = new();
    public KnockoutMatch ThirdPlaceMatch { get; set; } = new();
    public KnockoutMatch Final { get; set; } = new();
    public Country? Champion { get; set; }
}