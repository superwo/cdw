import { MultiStepFormEnum } from "@/config/types";
import { z } from "zod";

export const MultiStepFormSchema = z.object({
	step: z.nativeEnum(MultiStepFormEnum),
	slug: z.string(),
});

export const SelectDateSchema = z.object({
	handoverDate: z.string({ message: "Handover Date is required" }),
	handoverTime: z.string({ message: "Handover Time is required" }),
});

export type SelectDateType = z.infer<typeof SelectDateSchema>;
