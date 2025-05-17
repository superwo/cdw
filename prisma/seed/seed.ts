import { PrismaClient } from "@prisma/client";
import { seedTaxonomy } from "./taxonomy.seed";
// import { seedAdmin } from "./admin.seed";

const prisma = new PrismaClient();

async function main() {
	// await prisma.$executeRaw`TRUNCATE TABLE "makes" RESTART IDENTITY CASCADE`;
	// await prisma.$executeRaw`TRUNCATE TABLE "classifieds" RESTART IDENTITY CASCADE`;
	await seedTaxonomy(prisma);
	// await seedClassifieds(prisma);
	// await seedImages(prisma);
	// await seedAdmin(prisma);
	// await seedCustomers(prisma);
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
