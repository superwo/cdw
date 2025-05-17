"use server";

import { auth } from "@/auth";
import { completeChallenge, issueChallenge } from "@/lib/otp";
import { genericRateLimit } from "@/lib/rate-limiter";

export const resendChallengeAction = async () => {
	const limiterError = await genericRateLimit("otp");
	if (limiterError) return limiterError;

	const session = await auth();

	if (!session?.user) {
		return {
			success: false,
			message: "Unauthorized",
		};
	}

	await issueChallenge(session.user.id as string, session.user.email as string);

	return {
		success: true,
		message: "Code sent!",
	};
};

export const completeChallengeAction = async (code: string) => {
	const session = await auth();

	if (!session?.user) {
		return {
			success: false,
			message: "Unauthorized",
		};
	}

	const { id } = session.user;
	const result = await completeChallenge(id as string, code);

	return result;
};
