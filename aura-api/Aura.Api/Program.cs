using Aura.Api.Services;
using Aura.Api.Models;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddHttpClient();
// Register Gemini Service as Singleton to keep "Sticky Model" memory alive
builder.Services.AddSingleton<GeminiService>();
builder.Services.AddSingleton<WhatsAppService>();
builder.Services.AddSingleton<TeamMemoryService>();
builder.Services.AddHostedService<MorningScheduler>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Health Check & Brain Test
app.MapGet("/", async (GeminiService gemini) => 
{
    var response = await gemini.ChatAsync("System Check: Are you fully operational?");
    return Results.Ok(new { Status = "Online", Brain = response });
});

// Whatsapp Webhook (Incoming Messages)
app.MapPost("/webhook", async (HttpContext context, GeminiService gemini, WhatsAppService whatsapp, TeamMemoryService memory, IConfiguration config) =>
{
    try
    {
        var json = await new StreamReader(context.Request.Body).ReadToEndAsync();
        
        var payload = JsonSerializer.Deserialize<WhatsAppWebhookEvent>(json);
        
        var message = payload?.Entry?.FirstOrDefault()
            ?.Changes?.FirstOrDefault()
            ?.Value?.Messages?.FirstOrDefault();

        if (message != null && message.Text != null)
        {
            var userText = message.Text.Body;
            var senderId = message.From;
            var senderName = payload?.Entry?.FirstOrDefault()
                ?.Changes?.FirstOrDefault()
                ?.Value?.Contacts?.FirstOrDefault()?.Profile?.Name ?? "User";

            Console.WriteLine($"📨 MSG from {senderName}: {userText}");

            // 1. 🔍 SILENT EXTRACTION (Thrifty Mode)
            var isWorth = userText.Length > 15 || userText.Contains("update") || userText.Contains("plan");
            if (isWorth) 
            {
            _ = Task.Run(async () => {
                var fact = await gemini.ExtractFactAsync(userText);
                if (fact != null)
                {
                    memory.SaveFact(fact.Subject, fact.Relation, fact.Value);
                    Console.WriteLine($"� LEARNED: {fact.Subject} is {fact.Value}");
                }
            });
            }

            // 2. 🗣️ DECIDE TO SPEAK (Silent Observer Logic)
            var triggerWords = new[] { "aura", "bot", "help", "summary", "decision", "what do you think", "?" };
            var isTriggered = triggerWords.Any(w => userText.Contains(w, StringComparison.OrdinalIgnoreCase));

            if (isTriggered)
            {
                // Retrieve relevant memory context
                var contextData = memory.GetRelevantContext(userText);
                
                var promptWithMemory = $@"
                CONTEXT FROM TEAM MEMORY:
                {contextData}

                USER QUESTION:
                {userText}

                Answer based on the memory if possible. Be helpful and concise.
                ";

                Console.WriteLine("🤖 AURA WAKING UP...");
                var aiResponse = await gemini.ChatAsync(promptWithMemory);
                
                if (!string.IsNullOrEmpty(senderId))
                {
                    await whatsapp.SendMessageAsync(senderId, aiResponse);
                }
            }
            else
            {
                Console.WriteLine("🤫 Aura staying silent.");
            }
        }

        return Results.Ok();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error processing webhook: {ex.Message}");
        return Results.Ok(); 
    }
});

// Whatsapp Webhook (Verification Request)
app.MapGet("/webhook", (HttpContext context) =>
{
    // Meta sends a challenge to verify the webhook
    var mode = context.Request.Query["hub.mode"];
    var token = context.Request.Query["hub.verify_token"];
    var challenge = context.Request.Query["hub.challenge"];

    // TODO: Move VERIFY_TOKEN to config
    var myVerifyToken = "aura_secret_token";

    if (!string.IsNullOrEmpty(mode) && !string.IsNullOrEmpty(token))
    {
        if (mode == "subscribe" && token == myVerifyToken)
        {
            return Results.Text(challenge, "text/plain");
        }
        return Results.Forbid();
    }
    return Results.BadRequest();
});

app.Run();
