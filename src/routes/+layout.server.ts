import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '@/prisma'
export const load: LayoutServerLoad = async (event) => {
    const authsession = await event.locals.auth();
    if (authsession && authsession.user && authsession?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: authsession?.user?.email } })
        return {
            user,
        };
    }
    return
};