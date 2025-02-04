import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '@/prisma'
export const load: LayoutServerLoad = async (event) => {
    const user = event.locals.user;

    return {
        user,
    };
};