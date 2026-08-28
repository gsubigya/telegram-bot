export default async function handler(req, res) {
const allowedOrigin = "https://gsubigya.github.io";

// CORS
res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
res.setHeader("Vary", "Origin");

// CORS preflight
if (req.method === "OPTIONS") {
return res.status(204).end();
}

// POST only
if (req.method !== "POST") {
return res.status(405).json({
success: false,
error: "Method not allowed"
});
}

// Origin validation
if (req.headers.origin !== allowedOrigin) {
return res.status(403).json({
success: false,
error: "Forbidden"
});
}

// Parse request body
let data;

try {
if (typeof req.body === "string") {
data = JSON.parse(req.body);
} else {
data = req.body;
}
} catch {
return res.status(400).json({
success: false,
error: "Invalid request"
});
}

const name =
typeof data?.name === "string"
? data.name.trim()
: "";

const age = Number(data?.age);

const gender =
typeof data?.gender === "string"
? data.gender
: "";

const explanation =
typeof data?.explanation === "string"
? data.explanation.trim()
: "";

/*

* IMPORTANT:
* No password or credential field is accepted.
*
* This endpoint intentionally cannot receive or forward
* passwords from the phishing-awareness demonstration.
  */

// Name validation
if (name.length < 2 || name.length > 80) {
return res.status(400).json({
success: false,
error: "Invalid name"
});
}

// Age validation
if (
!Number.isInteger(age) ||
age < 1 ||
age > 120
) {
return res.status(400).json({
success: false,
error: "Invalid age"
});
}

// Gender validation
const allowedGenders = [
"Male",
"Female",
"Other",
"Prefer not to say"
];

if (!allowedGenders.includes(gender)) {
return res.status(400).json({
success: false,
error: "Invalid gender"
});
}

// Explanation validation
if (
explanation.length < 1 ||
explanation.length > 1000
) {
return res.status(400).json({
success: false,
error: "Invalid explanation"
});
}

// Environment secrets
const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

if (!botToken || !chatId) {
console.error("Missing Telegram configuration");

```
return res.status(500).json({
  success: false,
  error: "Server configuration error"
});
```

}

const message =
`🛡️ Security Testing — Phishing Demo

📋 Survey Response

👤 Name: ${name}
🎂 Age: ${age}
⚧️ Gender: ${gender}

📝 Explanation:
${explanation}

🔐 Credential Handling:
No password or real authentication credential was collected or transmitted.`;

try {
const telegramResponse = await fetch(
`https://api.telegram.org/bot${botToken}/sendMessage`,
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
chat_id: chatId,
text: message
})
}
);

```
const telegramData = await telegramResponse.json();

if (!telegramResponse.ok || !telegramData.ok) {
  console.error("Telegram API rejected request");

  return res.status(502).json({
    success: false,
    error: "Unable to submit response"
  });
}

return res.status(200).json({
  success: true
});
```

} catch (error) {
console.error("Telegram request failed");

```
return res.status(502).json({
  success: false,
  error: "Unable to submit response"
});
```

}
}
