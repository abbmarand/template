import { SvelteKitAuth } from "@auth/sveltekit"
import GoogleProvider from '@auth/core/providers/google';
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from '@/prisma'
import {
    GOOGLE_ID,
    GOOGLE_SECRET,
    AUTH_SECRET
} from '$env/static/private';
export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => {
    const authOptions = {
        adapter: PrismaAdapter(prisma),
        providers: [
            GoogleProvider({
                clientId: GOOGLE_ID,
                clientSecret: GOOGLE_SECRET
            })
        ],
        secret: AUTH_SECRET,
        trustHost: true

    }
    return authOptions
})