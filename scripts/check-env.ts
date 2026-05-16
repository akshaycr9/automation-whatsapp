const requiredLater = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "SHOPIFY_WEBHOOK_SECRET",
  "META_APP_SECRET",
  "META_VERIFY_TOKEN"
];

console.log("Environment check placeholder.");
console.log("These variables will be required when integrations are implemented:");
for (const key of requiredLater) {
  console.log(`- ${key}`);
}
