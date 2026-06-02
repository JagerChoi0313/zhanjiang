#!/usr/bin/env node
import { seedSuperAdmin } from "../lib/admin-seed.mjs";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to seed super admin.");
  process.exit(1);
}

try {
  const result = await seedSuperAdmin();
  console.log(`Super admin ${result.action}: ${result.email}`);
  process.exit(0);
} catch (error) {
  console.error(error.message || "Failed to seed super admin.");
  process.exit(1);
}
