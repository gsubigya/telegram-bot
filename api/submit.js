export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  // Only accept JSON
  if (!req.headers["content-type"]?.includes("application/json")) {
    return res.status(415).json({
      success: false,
      error: "Unsupported content type"
    });
  }

  // Check that the request came from your website
  const allowedOrigin = " https://gsubigya.github.io/";

  const origin = req.headers.origin;

  if (origin !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      error: "Forbidden"
    });
  }

  const { name, age, gender, explanation } = req.body || {};

  // Basic validation
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

  const numericAge = Number(age);

  if (!Number.isInteger(numericAge) || numericAge < 1 || numericAge > 120) {
    return res.status(400).json({
      success: false,
      error: "Invalid age"
    });
  }

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({
      success: false,
      error: "Invalid name"
    });
  }

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

  if (explanation.length < 1 || explanation.length > 1000) {
    return res.status(400).json({
      success: false,
      error: "Invalid explanation"
    });
  }

  // Telegram credentials ONLY exist on Vercel
  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram environment variables are missing");

    return res.status(500).json({
      success: false,
      error: "Server configuration error"
    });
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

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramData.ok) {
      console.error("Telegram request failed");

      return res.status(502).json({
        success: false,
        error: "Unable to submit response"
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error("Telegram connection failed");

    return res.status(502).json({
      success: false,
      error: "Unable to submit response"
    });
  }
}
