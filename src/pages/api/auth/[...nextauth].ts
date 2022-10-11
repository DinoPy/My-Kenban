import bcrypt from 'bcryptjs';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

// Prisma adapter for NextAuth, optional and can be removed
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../server/db/client';
import { env } from '../../../env/server.mjs';

export const authOptions: NextAuthOptions = {
	// Include user.id on session
	callbacks: {
		async signIn({ user }) {
			try {
				if (!user) return false;
				const foundUser = await prisma.userSchema.findFirst({
					where: {
						email: String(user?.email),
					},
				});

				if (!foundUser) {
					await prisma.userSchema.create({
						data: {
							email: String(user?.email),
							name: String(user?.email),
							password: String(user?.id),
						},
					});
				}
			} catch (e) {
				console.log(e);
				// return false;
			}

			return true;
		},
		async jwt({ token, user }) {
			console.log(token.email);
			const foundUser = await prisma.userSchema.findFirst({
				where: {
					email: String(token?.email),
				},
				select: {
					id: true,
					email: true,
					name: true,
				},
			});

			if (foundUser) {
				token.user = foundUser;
			} else {
				token.user = user;
			}
			return token;
		},
		async session({ session, user, token }) {
			if (token.user) {
				session.user = token.user as any;
			}
			return session;
		},
	},
	// Configure one or more authentication providers

	// adapter: PrismaAdapter(prisma),
	providers: [
		// DiscordProvider({
		// 	clientId: env.DISCORD_CLIENT_ID,
		// 	clientSecret: env.DISCORD_CLIENT_SECRET,
		// }),
		GoogleProvider({
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		}),
		// ...add more providers here
		CredentialsProvider({
			type: 'credentials',
			credentials: {},
			async authorize(credentials) {
				try {
					const { email, password } = credentials as {
						email: string;
						password: string;
					};

					const user = await prisma.userSchema.findUnique({
						where: { email: email },
					});

					if (!user) {
						throw new Error('Email does not exist');
					}

					const valid = await bcrypt.compare(
						password,
						(user as { password: string }).password
					);

					const toReturnUser = {
						id: user.id,
						email: user.email,
						name: user.name,
					};

					if (valid) {
						return toReturnUser;
					} else {
						console.log('here');
						throw new Error(
							'Incorrect password OR this email was registred with google'
						);
					}
				} catch (e) {
					console.log(e);
					throw new Error((e as Error).message);
				}

				return null;
			},
		}),
	],
	session: {
		strategy: 'jwt',
	},

	pages: {
		signIn: '/user/signin',
	},
};

export default NextAuth(authOptions);
