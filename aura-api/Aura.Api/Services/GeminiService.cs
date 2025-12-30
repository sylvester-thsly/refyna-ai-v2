using Aura.Api.Models;
using System.Text.Json;
using System.Text;

namespace Aura.Api.Services;

public class GeminiService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<GeminiService> _logger;
    private string _currentActiveModel = "gemini-2.5-flash"; // Default Sticky Model

    private readonly string[] _availableModels = 
    [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash"
    ];

    public GeminiService(HttpClient http, IConfiguration config, ILogger<GeminiService> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public async Task<string> ChatAsync(string userMessage)
    {
        var apiKey = _config["Gemini:ApiKey"];
        if (string.IsNullOrEmpty(apiKey)) return "Error: API Key missing in Server Config.";

        // Sort models to try Sticky Model first
        var modelsToTry = _availableModels.OrderByDescending(m => m == _currentActiveModel).ToArray();

        Exception? lastError = null;

        foreach (var model in modelsToTry)
        {
            try
            {
                _logger.LogInformation($"🔄 Trying model: {model}...");
                
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
                
                var requestBody = new GenerateContentRequest(
                    new List<Content> { new Content(new List<Part> { new Part(userMessage) }) }
                );

                var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _http.PostAsync(url, content);
                
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    // Check for Rate Limit (429) or Overload (503)
                    if ((int)response.StatusCode == 429 || (int)response.StatusCode == 503)
                    {
                         _logger.LogWarning($"⚠️ Model {model} hit rate limit/overload. Switching...");
                         lastError = new Exception($"Model {model} failed: {response.StatusCode}");
                         continue; // Try next model
                    }
                    throw new Exception($"Gemini API Error: {response.StatusCode} - {error}");
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<GenerateContentResponse>(responseJson, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                var answer = result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
                
                if (!string.IsNullOrEmpty(answer))
                {
                    _logger.LogInformation($"✅ Success with {model}");
                    _currentActiveModel = model; // Stick to this model
                    return answer;
                }
            }
            catch (Exception ex)
            {
                lastError = ex;
                _logger.LogError(ex, $"Error using model {model}");
            }
        }

        return "I'm having trouble thinking right now. All my brains are busy! 🧠🔥";
    }

    // 🕵️ EXTRACTION ENGINE
    public async Task<TeamFact?> ExtractFactAsync(string userMessage)
    {
        var apiKey = _config["Gemini:ApiKey"];
        
        // Strict JSON extraction prompt
        var prompt = $@"
        Analyze this message and extract a specific FACT about the team, project, or schedule.
        Message: ""{userMessage}""
        
        Example 1: ""Sylvester is handling the backend"" -> {{ ""Subject"": ""Sylvester"", ""Relation"": ""role"", ""Value"": ""Backend Dev"" }}
        Example 2: ""Meeting is on Friday"" -> {{ ""Subject"": ""Meeting"", ""Relation"": ""date"", ""Value"": ""Friday"" }}
        Example 3: ""Hello good morning"" -> NULL

        Return ONLY raw JSON. If no fact, return null string.
        structure: {{ Subject, Relation, Value }}
        ";

        try {
           // We reuse the basic send logic (simplified for brevity)
           // In production, refactor the POST logic to a private helper method to avoid duplication using _http
           // For now, I'll copy the minimal POST logic to ensure 'fact extraction' works
           var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";
           var requestBody = new GenerateContentRequest(new List<Content> { new Content(new List<Part> { new Part(prompt) }) });
           var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
           var content = new StringContent(json, Encoding.UTF8, "application/json");
           var response = await _http.PostAsync(url, content);
           if (!response.IsSuccessStatusCode) return null;
           
           var responseJson = await response.Content.ReadAsStringAsync();
           var result = JsonSerializer.Deserialize<GenerateContentResponse>(responseJson, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
           var text = result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

           if (string.IsNullOrEmpty(text) || text.Contains("null") || text.Contains("NULL")) return null;

           // Clean markdown code blocks if any
           text = text.Replace("```json", "").Replace("```", "").Trim();
           
           return JsonSerializer.Deserialize<TeamFact>(text);
        }
        catch { return null; }
    }
}
