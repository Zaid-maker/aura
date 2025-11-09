import { prisma } from "../lib/prisma";

async function setAdmin() {
  try {
    // Get email from command-line argument
    const email = process.argv[2];

    // Validate that email was provided
    if (!email || email.trim() === "") {
      console.error("❌ Error: Email address is required");
      console.error("\nUsage: bun scripts/set-admin.ts <email>");
      console.error("Example: bun scripts/set-admin.ts user@example.com");
      process.exit(1);
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ Error: Invalid email format");
      console.error(`Provided: ${email}`);
      console.error("\nPlease provide a valid email address");
      process.exit(1);
    }

    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
      },
    });

    console.log("✅ User updated successfully:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
