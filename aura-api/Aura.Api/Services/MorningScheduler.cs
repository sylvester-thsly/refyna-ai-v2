namespace Aura.Api.Services;

public class MorningScheduler : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<MorningScheduler> _logger;
    private readonly IConfiguration _config;
    // Track if we sent the tip today to avoid spamming every second at 9:00 AM
    private DateTime _lastSentDate = DateTime.MinValue;

    public MorningScheduler(IServiceProvider services, ILogger<MorningScheduler> logger, IConfiguration config)
    {
        _services = services;
        _logger = logger;
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("⏰ Morning Scheduler started. Waiting for 9:00 AM...");

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;

            // Check if it's 9 AM and we haven't sent it today
            // (You can change Hour to verify it works, e.g. now.Hour)
            if (now.Hour == 9 && _lastSentDate.Date != now.Date)
            {
                _logger.LogInformation("🌅 It's 9 AM! Triggering Morning Design Tip...");
                await SendMorningTipAsync();
                _lastSentDate = now.Date;
            }

            // Check every minute
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task SendMorningTipAsync()
    {
        // Scope is required because BackgroundService is Singleton but Services can be Scoped (usually)
        // Although our services are Singletons, strict pattern is safer.
        using (var scope = _services.CreateScope())
        {
            var gemini = scope.ServiceProvider.GetRequiredService<GeminiService>();
            var whatsapp = scope.ServiceProvider.GetRequiredService<WhatsAppService>();

            // 1. Get Tip from Brain
            var tip = await gemini.ChatAsync("Generate a short, inspiring UI/UX design tip for the team. Be professional yet motivating. Max 2 sentences.");

            // 2. Get Target Group/User Number
            var targetPhone = _config["WhatsApp:TargetPhoneNumber"];
            
            if (string.IsNullOrEmpty(targetPhone))
            {
                _logger.LogWarning("⚠️ No TargetPhoneNumber configured for Morning Tip.");
                return;
            }

            // 3. Send
            await whatsapp.SendMessageAsync(targetPhone, $"🌅 *Morning Aura Check*\n\n{tip}");
        }
    }
}
