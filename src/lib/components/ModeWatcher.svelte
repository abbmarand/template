<script lang="ts">
	import { onMount } from 'svelte';

	let darkMode = false;

	onMount(() => {
		// Check system preference
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			darkMode = true;
			document.documentElement.classList.add('dark');
		}

		// Listen for changes
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			darkMode = e.matches;
			if (darkMode) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		});
	});
</script>
