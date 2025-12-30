using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aura.Api.Services;

public class WhatsAppService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<WhatsAppService> _logger;

    public WhatsAppService(HttpClient http, IConfiguration config, ILogger<WhatsAppService> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public async Task SendMessageAsync(string toPhoneNumber, string messageText)
    {
        var phoneId = _config["WhatsApp:PhoneNumberId"];
        var token = _config["WhatsApp:AccessToken"];

        if (string.IsNullOrEmpty(phoneId) || string.IsNullOrEmpty(token))
        {
            _logger.LogWarning("⚠️ Cannot send WhatsApp message. Missing PhoneNumberId or AccessToken in config.");
            Console.WriteLine($"[SIMULATION] Sending to {toPhoneNumber}: {messageText}");
            return;
        }

        var url = $"https://graph.facebook.com/v17.0/{phoneId}/messages";

        var payload = new
        {
            messaging_product = "whatsapp",
            to = toPhoneNumber,
            text = new { body = messageText }
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        try 
        {
            var response = await _http.PostAsync(url, content);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError($"❌ WhatsApp API Error: {error}");
            }
            else
            {
                _logger.LogInformation($"✅ Message sent to {toPhoneNumber}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Network error sending WhatsApp message");
        }
    }
}
