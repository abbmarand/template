import type { Adapter } from '@auth/core/adapters';
import type { PrismaClient } from '@prisma/client';

export function CustomPrismaAdapter(p: PrismaClient): Adapter {
	return {
		async createUser(data) {
			const user = await p.user.create({
				data: {
					name: data.name,
					email: data.email,
					image: data.image,
					emailVerified: data.emailVerified
				}
			});
			return user;
		},
		async getUser(id) {
			const user = await p.user.findUnique({ where: { id } });
			return user;
		},
		async getUserByEmail(email) {
			const user = await p.user.findUnique({ where: { email } });
			return user;
		},
		async getUserByAccount({ providerAccountId, provider }) {
			const account = await p.account.findUnique({
				where: {
					provider_providerAccountId: {
						providerAccountId,
						provider
					}
				},
				include: { user: true }
			});
			return account?.user ?? null;
		},
		async updateUser(data) {
			const user = await p.user.update({
				where: { id: data.id },
				data: {
					name: data.name,
					email: data.email,
					image: data.image,
					emailVerified: data.emailVerified
				}
			});
			return user;
		},
		async deleteUser(userId) {
			await p.user.delete({ where: { id: userId } });
		},
		async linkAccount(data) {
			await p.account.create({
				data: {
					userId: data.userId,
					type: data.type,
					provider: data.provider,
					providerAccountId: data.providerAccountId,
					refresh_token: data.refresh_token?.toString(),
					access_token: data.access_token?.toString(),
					expires_at: data.expires_at ? Number(data.expires_at) : null,
					token_type: data.token_type,
					scope: data.scope,
					id_token: data.id_token,
					session_state: data.session_state ? data.session_state.toString() : null
				}
			});
		},
		async unlinkAccount({ providerAccountId, provider }) {
			await p.account.delete({
				where: {
					provider_providerAccountId: {
						providerAccountId,
						provider
					}
				}
			});
		},
		async createSession(data) {
			const session = await p.session.create({
				data: {
					sessionToken: data.sessionToken,
					userId: data.userId,
					expires: data.expires
				}
			});
			return session;
		},
		async getSessionAndUser(sessionToken) {
			const userAndSession = await p.session.findUnique({
				where: { sessionToken },
				include: { user: true }
			});
			if (!userAndSession) return null;

			// Get the account information for access token
			const account = await p.account.findFirst({
				where: { userId: userAndSession.user.id }
			});

			// If we have an account and it has an expires_at timestamp
			if (account?.expires_at) {
				const expiresAt = account.expires_at * 1000; // Convert to milliseconds
				if (Date.now() > expiresAt) {
					// Token has expired, try to refresh it
					if (account.refresh_token) {
						try {
							// Here you would implement the token refresh logic
							// For now, we'll just keep the session valid
							await p.session.update({
								where: { sessionToken },
								data: { expires: new Date(Date.now() + 2 * 60 * 60 * 1000) } // Extend by 2 hours
							});
						} catch (error) {
							console.error('Failed to refresh token:', error);
							// Don't throw, just continue with the existing session
						}
					}
				}
			}

			return {
				user: userAndSession.user,
				session: {
					sessionToken: userAndSession.sessionToken,
					userId: userAndSession.userId,
					expires: userAndSession.expires
				}
			};
		},
		async updateSession(data) {
			const session = await p.session.update({
				where: { sessionToken: data.sessionToken },
				data: {
					expires: data.expires
				}
			});
			return session;
		},
		async deleteSession(sessionToken) {
			await p.session.delete({ where: { sessionToken } });
		},
		async createVerificationToken(data) {
			const verificationToken = await p.verificationToken.create({
				data: {
					identifier: data.identifier,
					token: data.token,
					expires: data.expires
				}
			});
			return verificationToken;
		},
		async useVerificationToken(data) {
			try {
				const verificationToken = await p.verificationToken.delete({
					where: {
						identifier_token: {
							identifier: data.identifier,
							token: data.token
						}
					}
				});
				return verificationToken;
			} catch {
				// If token already used/deleted, just return null
				return null;
			}
		}
	};
}
