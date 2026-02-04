# AdherePod API Endpoints

Complete reference for all API routes. Includes LLM function-calling schemas for voice agent integration.

## Authentication

All endpoints marked **Auth: Yes** require a valid NextAuth session. The session user ID is extracted via `auth()` and used to scope all queries.

---

## Medications

### `GET /api/medications`

List all medications for the authenticated user.

**Auth:** Yes

**Request:** No body.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Lisinopril 10mg",
    "timesPerDay": 2,
    "timingDescription": "before meals",
    "startDate": "2026-02-03T00:00:00.000Z",
    "endDate": null,
    "notes": null,
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z"
  }
]
```

### `POST /api/medications`

Add a new medication.

**Auth:** Yes

**Request:**
```json
{
  "name": "Lisinopril 10mg",
  "timesPerDay": 2,
  "timingDescription": "before meals",
  "startDate": "2026-02-03",
  "endDate": null,
  "notes": "Take with water"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Medication name and dosage |
| `timesPerDay` | number | Yes | Doses per day |
| `timingDescription` | string | No | When to take (e.g. "before meals", "at bedtime") |
| `startDate` | string | Yes | Start date (YYYY-MM-DD) |
| `endDate` | string | No | End date (YYYY-MM-DD), omit if ongoing |
| `notes` | string | No | Additional notes |

**Response (201):** Created medication object.

### `PUT /api/medications`

Update an existing medication. Only include fields you want to change.

**Auth:** Yes

**Request:**
```json
{
  "id": "uuid",
  "name": "Lisinopril 20mg",
  "timesPerDay": 1
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Medication ID to update |
| `name` | string | No | New name |
| `timesPerDay` | number | No | New frequency |
| `timingDescription` | string | No | New timing |
| `startDate` | string | No | New start date |
| `endDate` | string | No | New end date |
| `notes` | string | No | New notes |

**Response (200):** Updated medication object.

### `DELETE /api/medications?id=<uuid>`

Delete a medication.

**Auth:** Yes

**Request:** Query parameter `id` (required).

**Response (200):**
```json
{ "message": "Medication deleted" }
```

---

## Voice Sessions

### `POST /api/voice/session`

Generate an ephemeral OpenAI API key for WebRTC realtime voice connection.

**Auth:** Yes

**Request:** No body.

**Response (200):** OpenAI ephemeral key object:
```json
{
  "value": "ek_...",
  "expires_at": 1738620000
}
```

---

## Voice Conversations

### `POST /api/voice/conversations`

Create a new conversation record.

**Auth:** Yes

**Request:** No body.

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "active",
  "startedAt": "2026-02-03T12:00:00.000Z",
  "endedAt": null
}
```

### `GET /api/voice/conversations`

List all conversations for the user (newest first).

**Auth:** Yes

**Response (200):** Array of conversation objects.

### `GET /api/voice/conversations?id=<uuid>`

Get a single conversation with all messages.

**Auth:** Yes

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "ended",
  "startedAt": "2026-02-03T12:00:00.000Z",
  "endedAt": "2026-02-03T12:05:00.000Z",
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "role": "user",
      "content": "What medications do I have?",
      "toolName": null,
      "toolArgs": null,
      "createdAt": "2026-02-03T12:00:05.000Z"
    }
  ]
}
```

---

## Voice Conversation Messages

### `POST /api/voice/conversations/messages`

Save a transcript message to a conversation.

**Auth:** Yes

**Request:**
```json
{
  "conversationId": "uuid",
  "role": "user",
  "content": "What medications do I have?",
  "toolName": null,
  "toolArgs": null
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `conversationId` | string | Yes | Conversation to append to |
| `role` | string | Yes | "user" or "agent" |
| `content` | string | Yes | Transcript text |
| `toolName` | string | No | Tool name if agent called a tool |
| `toolArgs` | string | No | JSON string of tool arguments |

**Response (201):** Created message object.

### `PATCH /api/voice/conversations/messages`

End a conversation (set status to "ended", record endedAt).

**Auth:** Yes

**Request:**
```json
{
  "conversationId": "uuid"
}
```

**Response (200):** Updated conversation object.

---

## Auth

### `POST /api/sign-up`

Register a new user account.

**Auth:** No

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (201):** `{ "message": "Account created successfully" }`

### `POST /api/forgot-password`

Initiate password reset. Always returns 200 to prevent email enumeration.

**Auth:** No

**Request:** `{ "email": "john@example.com" }`

**Response (200):** `{ "message": "If an account with that email exists, a password reset link has been sent." }`

### `POST /api/reset-password`

Complete password reset using token from email.

**Auth:** No

**Request:**
```json
{
  "token": "reset-token-string",
  "password": "newpassword123"
}
```

**Response (200):** `{ "message": "Password has been reset" }`

---

## Error Responses

All endpoints return errors in this format:

```json
{ "error": "Description of what went wrong" }
```

| Status | Meaning |
|---|---|
| 400 | Missing or invalid parameters |
| 401 | Not authenticated |
| 404 | Resource not found (or not owned by user) |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Server error |

---

## LLM Function-Calling Schemas

These are the tool definitions used by the OpenAI Realtime voice agent, defined with Zod in `src/lib/voice/tools.ts`. Any LLM with function-calling support can use these schemas.

### `list_medications`

```json
{
  "name": "list_medications",
  "description": "List all of the user's current medications",
  "parameters": {}
}
```

### `add_medication`

```json
{
  "name": "add_medication",
  "description": "Add a new medication for the user",
  "parameters": {
    "name": { "type": "string", "description": "Medication name and dosage, e.g. 'Lisinopril 10mg'" },
    "timesPerDay": { "type": "number", "description": "How many times per day to take it" },
    "timingDescription": { "type": "string", "optional": true, "description": "When to take it, e.g. 'before meals', 'at bedtime'" },
    "startDate": { "type": "string", "description": "Start date in YYYY-MM-DD format" },
    "endDate": { "type": "string", "optional": true, "description": "End date in YYYY-MM-DD format, omit if ongoing" },
    "notes": { "type": "string", "optional": true, "description": "Any additional notes" }
  }
}
```

### `edit_medication`

```json
{
  "name": "edit_medication",
  "description": "Update an existing medication",
  "parameters": {
    "id": { "type": "string", "description": "The medication ID to update" },
    "name": { "type": "string", "optional": true, "description": "New medication name" },
    "timesPerDay": { "type": "number", "optional": true, "description": "New times per day" },
    "timingDescription": { "type": "string", "optional": true, "description": "New timing description" },
    "endDate": { "type": "string", "optional": true, "description": "New end date in YYYY-MM-DD format" },
    "notes": { "type": "string", "optional": true, "description": "New notes" }
  }
}
```

### `delete_medication`

```json
{
  "name": "delete_medication",
  "description": "Delete a medication from the user's list",
  "parameters": {
    "id": { "type": "string", "description": "The medication ID to delete" }
  }
}
```

### Using These Tools with Other LLMs

These tool schemas can be adapted for any LLM that supports function calling:

- **Claude (Anthropic):** Convert to `tool_use` format with `input_schema`
- **GPT-4 (OpenAI Chat):** Use as-is in the `tools` array with `type: "function"`
- **Gemini (Google):** Convert to `FunctionDeclaration` format

Each tool executes a fetch call against the corresponding `/api/medications` endpoint. The LLM decides when to call a tool based on the user's voice input, and the result is fed back to continue the conversation.
