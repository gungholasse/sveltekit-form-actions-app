<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import FeedbackForm from '../components/feedback-form.svelte';
	import FeedbackStats from '../components/feedback-stats.svelte';
	import FeedbackItem from '../components/feedback-item.svelte';
	import type { ActionData, PageData } from './$types';
	import { invalidate } from '$app/navigation';
	import feedbackStore from '$lib/store';

	export let data: PageData;
	export let form: ActionData;
	$: ({ feedbacks } = data);
	let pageLoading = false;

	async function onFocus() {
		$feedbackStore.setPageLoading(true);
		await invalidate('fetch:feedbacks');
		$feedbackStore.setPageLoading(false);
	}

	onMount(() => {
		window.addEventListener('focus', onFocus);

		return () => {
			window.removeEventListener('focus', onFocus);
		};
	});

	$: pageLoading = $feedbackStore.pageloading;
</script>

<svelte:head>
	<title>Feedback App ✅</title>
</svelte:head>

<main class="md:container mt-10 sm:mt-24 px-5">
	<FeedbackForm {form} />
	<FeedbackStats {feedbacks} />

	{#each feedbacks as feedback}
		<FeedbackItem {form} {feedback} />
	{/each}

	{#if feedbacks.length === 0}
		<p
			in:fade={{ delay: 700, duration: 300 }}
			class="max-w-md mx-auto py-6 text-center text-lg rounded-md bg-white"
		>
			No Feedbacks Found
		</p>
	{/if}
</main>
{#if pageLoading}
	<div
		class="fixed top-2 left-2 sm:top-5 sm:left-5 inline-block h-4 w-4 sm:h-8 sm:w-8 animate-spin rounded-full border-2 sm:border-4 border-solid border-yellow-400 border-r-transparent align-[-0.125em] text-warning motion-reduce:animate-[spin_1.5s_linear_infinite]"
		role="status"
	/>
{/if}
