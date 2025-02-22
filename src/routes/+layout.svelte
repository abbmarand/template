<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	let { children } = $props();
</script>

<ModeWatcher />
<div class="bg-background flex h-screen flex-col">
	<div class="flex-1">
		{@render children()}
	</div>
</div>
