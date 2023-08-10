import { type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ url, depends }) => {
	depends('fetch:feedbacks');

	const pageQueryParam = url.searchParams.get('page');
	const limitQueryParam = url.searchParams.get('limit');
	const orderBy = url.searchParams.get('orderBy') === 'asc' ? 'asc' : 'desc';

	const page = pageQueryParam ? parseInt(pageQueryParam, 10) : 1;
	const limit = limitQueryParam ? parseInt(limitQueryParam, 10) : 10;
	const skip = (page - 1) * limit;

	const [totalFeedbacks, feedbacks] = await Promise.all([
		prisma.feedback.count(),
		prisma.feedback.findMany({
			skip,
			take: limit,
			orderBy: {
				createdAt: orderBy
			}
		})
	]);

	const totalPages = Math.ceil(totalFeedbacks / limit);
	const hasNextPage = page < totalPages;
	const hasPreviousPage = page > 1;

	return {
		status: 'success',
		pagination: {
			totalPages,
			currentPage: page,
			totalResults: totalFeedbacks,
			hasNextPage,
			hasPreviousPage
		},
		feedbacks
	};
};

export const actions = {
	addFeedback: async ({ request }) => {
		try {
			const { text, rating } = Object.fromEntries(await request.formData()) as {
				text?: string;
				rating: string;
			};

			if (!text) {
				return fail(400, {
					type: 'add',
					message: 'feedback input cannot be empty',
					feedback: { text, rating, id: '' }
				});
			} else if (text.trim().length < 10) {
				return fail(400, {
					type: 'add',
					message: 'feedback text must be at least 10 characters',
					feedback: { text, rating, id: '' }
				});
			}

			const feedback = await prisma.feedback.create({
				data: { text, rating: Number(rating) }
			});

			return { newFeedback: feedback };
		} catch (err: any) {
			if (err.code === 'P2002') {
				return fail(409, {
					type: 'add',
					message: 'Feedback with this title already exists',
					feedback: { text: '', id: '' }
				});
			}

			return fail(500, {
				type: 'add',
				message: err.message,
				feedback: { text: '', id: '' }
			});
		}
	}
} satisfies Actions;
