# Edge Function: `ai-editor-chat`

OpenAI streaming chat endpoint for the AI editor assistant in the newsletter creator studio.

## Configuration

| Property | Value |
|---|---|
| **Method** | `POST` |
| **Auth Required** | Yes |
| **Rate Limit Tier** | `ai` (3 req / 60s) |
| **Model** | `gpt-5-nano` |

```
withMiddleware(handler, { requireAuth: true, rateLimit: { tier: "ai" } })
```

## Request

### Headers

| Header | Required | Value |
|---|---|---|
| `Authorization` | Yes | `Bearer <supabase-jwt>` |
| `Content-Type` | Yes | `application/json` |

### Body

```json
{
  "messages": [
    { "role": "user", "content": "Write a welcome post for my newsletter" },
    { "role": "assistant", "content": "Sure! Here's a draft..." },
    { "role": "user", "content": "Make it more casual" }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `messages` | `{ role: string, content: string }[]` | Yes | Chat messages in OpenAI format |

### Role Values

- `"user"` — messages from the user
- `"assistant"` — previous assistant responses (for context)
- `"system"` — system prompt instructions

## Response

### Success (200)

Streaming response via Server-Sent Events (`text/event-stream`):

```
data: {"content": "Here's", "finish": false}

data: {"content": " a draft", "finish": false}

data: {"content": " for your post...", "finish": false}

data: {"content": "", "finish": true}

data: [DONE]
```

Each SSE message contains:

| Field | Type | Description |
|---|---|---|
| `content` | `string` | Chunk of generated text |
| `finish` | `boolean` | Whether this is the final content chunk |

The stream terminates with `data: [DONE]`.

### Errors

| Status | Condition |
|---|---|
| 400 | Invalid JSON body or missing `messages` array |
| 401 | Missing or invalid JWT |
| 429 | Rate limit exceeded (3 requests per 60 seconds) |
| 500 | OpenAI API error or unexpected failure |

## Dependencies

- OpenAI SDK (npm:openai) — streaming chat completions API

## Usage Example (Client)

```typescript
const { data } = await supabase.functions.invoke("ai-editor-chat", {
  body: { messages: [{ role: "user", content: "Draft a intro" }] },
});

const reader = data.pipeThrough(new TextDecoderStream()).getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // parse SSE: "data: {}\n\n"
}
```
