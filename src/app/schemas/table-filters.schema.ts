import { ClassifiedStatus, CustomerStatus } from "@prisma/client";
import { z } from "zod";

export const AdminClassifiedFilterSchema = z.object({
	q: z.string().optional(),
	status: z
		.enum(["ALL", ...Object.values(ClassifiedStatus)])
		.default("ALL")
		.optional(),
});

export const AdminCustomerFilterSchema = z.object({
	q: z.string().optional(),
	status: z
		.enum(["ALL", ...Object.values(CustomerStatus)])
		.default("ALL")
		.optional(),
});
