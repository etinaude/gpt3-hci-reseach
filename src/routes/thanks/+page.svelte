<script lang="ts">
	function back() {
		window.location.href = '/';
	}
</script>

<svelte:head>
	<title>Thank You!</title>
	<meta name="description" content="About this app" />
</svelte:head>

<section id="End">
	<h1>Thanks for participating!</h1>

	<button on:click={() => back()}> Back to the start </button>
</section>
