namespace Aura.Api.Models;

public record GenerateContentRequest(List<Content> Contents, GenerationConfig? GenerationConfig = null);
public record Content(List<Part> Parts, string Role = "user");
public record Part(string Text);
public record GenerationConfig(double? Temperature, int? TopK, double? TopP);

public record GenerateContentResponse(List<Candidate>? Candidates);
public record Candidate(Content? Content, FinishReason? FinishReason);
public enum FinishReason { Unspecified, Stop, MaxTokens, Safety, Recitation, Other }
