using System.Text.Json.Serialization;

namespace Aura.Api.Models;

// The root object from Meta Webhook
public record WhatsAppWebhookEvent(
    [property: JsonPropertyName("object")] string? Object,
    [property: JsonPropertyName("entry")] List<WhatsAppEntry>? Entry
);

public record WhatsAppEntry(
    [property: JsonPropertyName("id")] string? Id,
    [property: JsonPropertyName("changes")] List<WhatsAppChange>? Changes
);

public record WhatsAppChange(
    [property: JsonPropertyName("value")] WhatsAppChangeValue? Value,
    [property: JsonPropertyName("field")] string? Field
);

public record WhatsAppChangeValue(
    [property: JsonPropertyName("messaging_product")] string? MessagingProduct,
    [property: JsonPropertyName("metadata")] WhatsAppMetadata? Metadata,
    [property: JsonPropertyName("contacts")] List<WhatsAppContact>? Contacts,
    [property: JsonPropertyName("messages")] List<WhatsAppMessage>? Messages
);

public record WhatsAppMetadata(
    [property: JsonPropertyName("display_phone_number")] string? DisplayPhoneNumber,
    [property: JsonPropertyName("phone_number_id")] string? PhoneNumberId
);

public record WhatsAppContact(
    [property: JsonPropertyName("profile")] WhatsAppProfile? Profile,
    [property: JsonPropertyName("wa_id")] string? WaId
);

public record WhatsAppProfile([property: JsonPropertyName("name")] string? Name);

public record WhatsAppMessage(
    [property: JsonPropertyName("from")] string? From,
    [property: JsonPropertyName("id")] string? Id,
    [property: JsonPropertyName("timestamp")] string? Timestamp,
    [property: JsonPropertyName("text")] WhatsAppText? Text,
    [property: JsonPropertyName("type")] string? Type
);

public record WhatsAppText([property: JsonPropertyName("body")] string? Body);
