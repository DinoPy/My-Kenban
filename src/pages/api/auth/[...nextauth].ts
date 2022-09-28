import NextAuth, { type NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../server/db/client';
import { env } from '../../../env/server.mjs';

export const authOptions: NextAuthOptions = {
	// Include user.id on session
	callbacks: {
		async jwt({ token, user }) {
			token.user = user;
			return token;
		},
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
			}
			return session;
		},
	},
	// Configure one or more authentication providers
	adapter: PrismaAdapter(prisma),
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
		}),
		// ...add more providers here
		CredentialsProvider({
			name: 'Credentials',
			type: 'credentials',
			credentials: {},
			authorize: async (credentials) => {
				console.log('credentials', credentials);

				const { email, password } = credentials as {
					email: string;
					password: string;
				};

				// login to login
				// if (email === 'login' && password === 'login') {
				// 	console.log(email, password);
				const user = { id: 1, name: 'J Smith', email: 'jsmith@example.com' };
				return user;
				// }
				// return null;
			},
		}),
	],

	pages: {
		signIn: '/user/signin',
	},
};

export default NextAuth(authOptions);
