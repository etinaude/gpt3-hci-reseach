<script lang="ts">
	import { Configuration, OpenAIApi } from 'openai';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import firebaseConfig from '../keys/firebase';
	import apiKey from '../keys/openAI';

	let fireStore: any;
	let app: any;
	let db: any;

	let state = '';

	let emotion = '';
	let explaination = '';
	let confidence = '5';

	let story = `Loading...`;
	let computerPrediction = 'This is a sad story';
	let storyPrompt = '';

	onMount(async () => {
		const firebaseApp = await import('firebase/app');
		const fireAnalytics = await import('firebase/analytics');
		fireStore = await import('firebase/firestore/lite');

		// Initialize Firebase
		app = firebaseApp.initializeApp(firebaseConfig);
		const analytics = fireAnalytics.getAnalytics(app);
		db = fireStore.getFirestore(app);
	});

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

	const configuration = new Configuration({
		apiKey
	});
	const openai = new OpenAIApi(configuration);

	function validate(): boolean {
		if (!emotion || !explaination) {
			state = 'error';

			setTimeout(() => {
				state = '';
			}, 2000);

			return false;
		}

		return true;
	}

	function reset() {
		story = 'Loading';
		emotion = '';
		explaination = '';
		confidence = '5';

		getPrompt();
	}

	async function submit() {
		state = 'loading';
		const doc = {
			computerPrediction,
			confidence,
			emotion,
			explaination,
			story,
			storyPrompt
		};

		console.log(doc);

		if (!validate()) return;

		const uuid = uuidv4();

		try {
			await fireStore.setDoc(fireStore.doc(db, 'docs', uuid), doc);
			state = 'success';

			reset();
		} catch {
			state = 'apiError';
		}

		setTimeout(() => {
			state = '';
		}, 2000);
	}

	function pickRandomItem(items: any[]) {
		return items[Math.floor(Math.random() * items.length)];
	}

	function generatePrompt(): string {
		let emotion = pickRandomItem(possibleEmotions);
		let subject = pickRandomItem(possibleSubjects);
		let object = pickRandomItem(possibleObjects);

		return `Tell me a long ${emotion} story about a ${subject} who had a ${object}`;
	}

	async function gpt3Call(prompt: string): Promise<string> {
		const completion = await openai.createCompletion({
			model: 'text-davinci-002',
			prompt: prompt,
			temperature: 0.6,
			max_tokens: 100
		});

		return completion.data.choices![0].text!;
	}

	async function getPrompt() {
		storyPrompt = generatePrompt();
		story = await gpt3Call(storyPrompt);

		getComputerPrediction();
	}

	async function getComputerPrediction() {
		let prompt = `What emotion is this story ${story}?`;

		computerPrediction = await gpt3Call(prompt);
	}

	reset();
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
