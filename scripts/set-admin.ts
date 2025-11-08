import { prisma } from "../lib/prisma";

async function setAdmin() {
  try {
    const email = "john@example.com";
    
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
