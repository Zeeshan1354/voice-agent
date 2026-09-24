// Edit this file to customize the agent for your business.
// No code changes needed elsewhere — the system prompt is built from this.

module.exports = {
  businessName: "Acme Support",

  // Shown to the caller when the call starts
  greeting: "Thanks for calling Acme Support. How can I help you today?",

  // Business hours (used by the agent to answer "are you open" type questions)
  hours: "Monday to Friday, 9am to 6pm Eastern Time",

  // Any facts you want the agent to know and answer from
  faqs: [
    { q: "What is your return policy?", a: "Items can be returned within 30 days of purchase with a receipt, for a full refund." },
    { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days." },
    { q: "How do I track my order?", a: "Order tracking links are emailed automatically once an order ships. Customers can also log into their account to view order status." },
    { q: "Do you offer refunds?", a: "Yes, full refunds are issued for returns made within the 30-day window." },
  ],

  // Phrases/situations where the agent should stop and hand off to a human
  // Set escalationPhoneNumber to a real number to actually transfer the call.
  escalationPhoneNumber: "", // e.g. "+15551234567" — leave blank to just say a human will follow up
  escalationTriggers: [
    "the caller is angry or the issue can't be resolved by policy",
    "the caller explicitly asks for a human or a manager",
    "the request involves billing disputes, legal threats, or account security (e.g. fraud, hacked account)",
  ],

  // How many back-and-forth turns before the agent proactively offers a human handoff
  maxTurnsBeforeOfferingHuman: 8,
};
