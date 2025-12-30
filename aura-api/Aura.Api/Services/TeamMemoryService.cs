using System.Text.Json;

namespace Aura.Api.Services;

public class TeamMemoryService
{
    private readonly string _memoryFile = "team_memory.json";
    private List<TeamFact> _facts = new();

    public TeamMemoryService()
    {
        LoadMemory();
    }

    private void LoadMemory()
    {
        if (File.Exists(_memoryFile))
        {
            try
            {
                var json = File.ReadAllText(_memoryFile);
                _facts = JsonSerializer.Deserialize<List<TeamFact>>(json) ?? new List<TeamFact>();
            }
            catch { _facts = new List<TeamFact>(); }
        }
    }

    public void SaveFact(string subject, string relation, string value)
    {
        var newFact = new TeamFact(subject, relation, value, DateTime.Now);
        _facts.Add(newFact);
        
        // Save to Disk
        var json = JsonSerializer.Serialize(_facts, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(_memoryFile, json);
    }

    public string GetRelevantContext(string query)
    {
        // Simple keyword search (Better approach: Vector search, but this is free/simple)
        var relevant = _facts
            .Where(f => query.Contains(f.Subject, StringComparison.OrdinalIgnoreCase) || 
                        query.Contains(f.Value, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(f => f.Timestamp)
            .Take(5) // Last 5 relevant facts
            .ToList();

        if (!relevant.Any()) return "";

        return "🧠 MEMORY CONTEXT:\n" + string.Join("\n", relevant.Select(f => $"- {f.Subject} {f.Relation} {f.Value} (recorded {f.Timestamp.ToShortDateString()})"));
    }

    public List<TeamFact> GetAllFacts() => _facts;
}

public record TeamFact(string Subject, string Relation, string Value, DateTime Timestamp);
