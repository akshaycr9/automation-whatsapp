const requiredLater = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "SHOPIFY_WEBHOOK_SECRET",
  "META_APP_SECRET",
  "META_VERIFY_TOKEN",
  "META_ACCESS_TOKEN",
  "WHATSAPP_BUSINESS_ACCOUNT_ID",
  "WHATSAPP_PHONE_NUMBER_ID"
];

console.log("Environment check placeholder.");
console.log("These variables will be required when integrations are implemented:");
for (const key of requiredLater) {
  console.log(`- ${key}`);
}
