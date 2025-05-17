import { SignInSchema } from "@/app/schemas/auth.schema";
import { SESSION_MAX_AGE } from "@/config/constants";
import { routes } from "@/config/routes";
import { bcryptPasswordCompare } from "@/lib/bcrypt";
import { issueChallenge } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import type { AdapterUser } from "@auth/core/adapters";
import CredentialsProvider from "@auth/core/providers/credentials";
import ResendProvider from "@auth/core/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig, User } from "next-auth";

export const config = {
	adapter: PrismaAdapter(prisma),
	useSecureCookies: false,
	trustHost: true,
	session: {
		strategy: "database",
		maxAge: SESSION_MAX_AGE / 1000,
	},
	providers: [
		CredentialsProvider({
			credentials: {
				email: {
					label: "Email",
					type: "email",
				},
				password: {
					label: "Password",
					type: "password",
				},
			},
			authorize: async (credentials): Promise<User | null> => {
				try {
					const validatedFields = SignInSchema.safeParse(credentials);

					if (!validatedFields.success) return null;

					const user = await prisma.user.findUnique({
						where: { email: validatedFields.data.email },
						select: { id: true, email: true, hashedPassword: true },
					});

					if (!user) return null;

					const match = await bcryptPasswordCompare(
						validatedFields.data.password,
						user.hashedPassword,
					);

					if (!match) return null;

					await issueChallenge(user.id, user.email);

					const dbUser = await prisma.user.findUnique({
						where: { id: user.id },
						omit: { hashedPassword: true },
					});

					return { ...dbUser, requires2FA: true };
				} catch (error) {
					console.log({ error });
					return null;
				}
			},
		}),
		ResendProvider({}),
	],
	pages: {
		signIn: routes.signIn,
		signOut: "/auth/sign-out",
		error: "/auth/error",
	},
	callbacks: {
		async jwt({ user, token }) {
			const session = await prisma.session.create({
				data: {
					expires: new Date(Date.now() + SESSION_MAX_AGE),
					sessionToken: crypto.randomUUID(),
					userId: user.id as string,
					requires2FA: user.requires2FA as boolean,
				},
			});

			if (!session) return null;

			if (user) token.requires2FA = user.requires2FA;

			token.id = session.sessionToken;
			token.exp = session.expires.getTime();

			return token;
		},

		async session({ session, user }) {
			session.user = {
				id: session.userId,
				email: user.email,
			} as AdapterUser;
			return session;
		},
	},
	jwt: {
		encode: async ({ token }) => token?.id as string,
	},
} as NextAuthConfig;
