/**
 * Quick CLI to trigger an outbound call.
 * Usage:
 *   node call-now.js +923001234567
 *
 * Make sure the server (server.js) is already running and reachable at BASE_URL
 * before running this.
 */
require("dotenv").config();

const to = process.argv[2];
if (!to) {
  console.error("Usage: node call-now.js +923001234567");
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

fetch(`http://localhost:${PORT}/make-call`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ to }),
})
  .then((r) => r.json())
  .then((data) => {
    if (data.success) {
      console.log(`Call placed. Call SID: ${data.callSid}`);
    } else {
      console.error("Failed:", data.error);
    }
  })
  .catch((err) => console.error("Request failed:", err.message));
