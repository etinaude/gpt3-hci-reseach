<script lang="ts">
	import { Configuration, OpenAIApi } from 'openai';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import firebaseConfig from '../keys/firebase';
	import apiKey from '../keys/openAI';
	import huggableKey from '../keys/huggable';

	let fireStore: any;
	let app: any;
	let db: any;

	let state = '';

	let emotion = '';
	let explaination = '';
	let confidence = '5';

	let story = `Loading...`;
	let singleComputerPrediction = '';
	let storyPrompt = '';
	let groupIsUncertainty = true;
	let uncertainties = new Map<string, string>([]);

	var data: number[];
	var labels: string[];
	labels = [];
	data = [];
		
	onMount(async () => {
		const firebaseApp = await import('firebase/app');
		const fireAnalytics = await import('firebase/analytics');
		fireStore = await import('firebase/firestore/lite');

		// Initialize Firebase
		app = firebaseApp.initializeApp(firebaseConfig);
		const analytics = fireAnalytics.getAnalytics(app);
		db = fireStore.getFirestore(app);
	});

	let possibleEmotions = ['fear', 'anger', 'sadness', 'surprise', 'love', 'joy'];
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
			singleComputerPrediction,
			confidence,
			emotion,
			explaination,
			story,
			storyPrompt
		};

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
		//story = "There once was a lady named Mary who had a knife in her back. It happened one day when she was walking home from work. She was stabbed by a man who came up behind her and then ran away. The knife was left in her back and she bled to death.";

		getComputerPrediction();
	}

	async function getComputerPrediction() {
		let prompt = `What emotion is this story ${story}?`;

		await getUncertaintyInformation(story);
	}

	async function getUncertaintyInformation(story: string){

		const headers = new Headers({ Authorization: `Bearer ${huggableKey}` });

		const options = {
			method: 'POST',
			headers,
			body: JSON.stringify(story)
		};

		const res = await fetch(
			`https://api-inference.huggingface.co/models/bhadresh-savani/bert-base-uncased-emotion/`,
			options
		);

		// Array holding uncertainty information
		const arr = await res.json();
		
		if (res.ok) {
			
			arr[0].forEach((obj: any) => {
				uncertainties.set(obj.label, obj.score.toString())
			});
			if (groupIsUncertainty) {
				labels = Array.from(uncertainties.keys());
				data = Array.from(uncertainties.values()).map(str => {return Number(str)});
			} else {
				singleComputerPrediction = [...arr[0].entries()].reduce((a, e ) => e[1] > a[1] ? e : a)[1].label;
			}
		} else {
			throw new Error(arr.error);
		}
	}

	reset();

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h2>What emotion is conveyed in this story?</h2>
	<div class="story">{story}</div>

	<h3>The computer thinks this:</h3>
	<div class="prediction">
		{#if groupIsUncertainty}
			<div class="chart">
				<div class="labels">
					{#each labels as l}
						<div>
							{l}
						</div>
					{/each}
				</div>
				<div class="percentages">
					{#each data as d}
						<div style="width: {d*700}px">
							{parseFloat(d.toFixed(4))*100}%
						</div>
					{/each}
				</div>
			</div>
		{:else}
			{singleComputerPrediction}
		{/if}
	</div>

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
