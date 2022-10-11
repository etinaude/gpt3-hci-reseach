<script lang="ts">
	import { goto } from '$app/navigation';

	function back() {
		window.location.href = '/';
		goto('/');
	}
</script>

<svelte:head>
	<title>Thank You!</title>
</svelte:head>

<section id="End">
	<h1>Thanks for participating!</h1>

	<button on:click={() => back()}> Back to the start </button>
</section>
