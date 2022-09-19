<script lang="ts">
	import Counter from '$lib/Counter.svelte';

	let possibleEmotions = ['happy', 'sad', 'angry', 'scary', 'surprising'];
	let possibleSubjects = [
		'dawrf',
		'elf',
		'dragon',
		'man named Fred',
		'lady named Mary',
		'pixie',
		'thief',
		'wizard',
		'archer'
	];
	let possibleObjects = [
		'ball',
		'knife',
		'baloon',
		'dog',
		'cat',
		'candle',
		'phone',
		'lock',
		'tower'
	];

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h2>What emotion is convyed in this story?</h2>
	<div class="story">{story}</div>

	<h3>The computer thinks this:</h3>
	<div class="prediction">{computerPrediction}</div>

	<div class="feedback-cont">
		<h3>Select emotion showed in text:</h3>

		<select bind:value={emotion}>
			{#each possibleEmotions as opt}
				<option value={opt}>{opt}</option>
			{/each}
		</select>

		<h3>Why did you pick this?:</h3>
		<textarea bind:value={explaination} />

		<h3>How confident are you?:</h3>
		<input type="range" min="0" max="10" class="slider" bind:value={confidence} />
		<div>{confidence}0%</div>

		<button on:click={() => submit()}> Submit </button>
	</div>
</section>

{#if state === 'error'}
	<div class="banner error">Please fill in all the fields</div>
{/if}
{#if state === 'apiError'}
	<div class="banner error">Hmm Something went wrong! Please Try again later</div>
{/if}
{#if state === 'success'}
	<div class="banner success">Submitted!</div>
{/if}
{#if state === 'loading'}
	<div class="banner loading">Loading...</div>
{/if}
