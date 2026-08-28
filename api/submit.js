export default async function handler(req, res) {
const allowedOrigin = "https://gsubigya.github.io";

// CORS
res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
res.setHeader("Vary", "Origin");

// Only accept POST requests
if (req.method !== "POST") {
return res.status(405).json({
success: false,
error: "Method not allowed"
});
}

// Verify request origin
if (req.headers.origin !== allowedOrigin) {
return res.status(403).json({
success: false,
error: "Forbidden"
});
}

let data;

try {
// The frontend sends JSON as text/plain
if (typeof req.body === "string") {
data = JSON.parse(req.body);
} else {
data = req.body;
}
} catch (error) {
return res.status(400).json({
success: false,
error: "Invalid JSON"
});
}

const {
name,
age,
gender,
explanation
} = data || {};

// Check data types
if (
typeof name !== "string" ||
typeof gender !== "string" ||
typeof explanation !== "string"
) {
return res.status(400).json({
success: false,
error: "Invalid data"
});
}

// Name validation
if (name.length < 2 || name.length > 80) {
return res.status(400).json({
success: false,
error: "Invalid name"
});
}

// Age validation
const numericAge = Number(age);

if (
!Number.isInteger(numericAge) ||
numericAge < 1 ||
numericAge > 120
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

// Read secrets from Vercel environment variables
const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

if (!botToken || !chatId) {
console.error("Telegram environment variables are missing");

```
return res.status(500).json({
  success: false,
  error: "Server configuration error"
});
```

}

const message =
`📋 New Survey Response

👤 Name: ${name}
🎂 Age: ${numericAge}
⚧ Gender: ${gender}

📝 Explanation:
${explanation}`;

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
  console.error("Telegram API request failed");

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
console.error("Telegram connection failed");

```
return res.status(502).json({
  success: false,
  error: "Unable to submit response"
});
```

}
}
