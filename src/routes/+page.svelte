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
	let uncertainties = new Map<string, string>([]);
	let userId = '';
	let questionCount = 0;

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
		'dwarf',
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
		if (questionCount < 2) {
			story = 'Loading';
			emotion = '';
			explaination = '';
			confidence = '5';

			getPrompt();
		} else {
			showThankYou();
		}
			
	}

	async function submit() {
		state = 'loading';
		const doc = {
			singleComputerPrediction,
			confidence,
			emotion,
			explaination,
			story,
			storyPrompt, 
			userId,
		};

		if (!validate()) return;

		const uuid = uuidv4();

		try {
			await fireStore.setDoc(fireStore.doc(db, 'docs', uuid), doc);
			state = 'success';
			questionCount++;
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
		//story = "Fred had always been a bit uneasy around knives. He remembered when he was a child, his mother had accidentally cut herself while chopping vegetables and the sight of the blood had made him faint. Even now, as an adult, the sight of blood made him feel queasy. So when Fred found himself alone in a dark alleyway with a man wielding a knife, he was absolutely terrified. He tried to reason with the man, begging him not to hurt him, but it was";
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
			//For uncertainties
			labels = Array.from(uncertainties.keys());
			data = Array.from(uncertainties.values()).map(str => {return Number(str)});
			//For single emotion
			singleComputerPrediction = [...arr[0].entries()].reduce((a, e ) => e[1] > a[1] ? e : a)[1].label;
		} else {
			throw new Error(arr.error);
		}
	}

	function showQuestions() {
		if (checkId()){
			state = '';
			var userId  = document.getElementById('UserId')!;
			var questionSection  = document.getElementById('Questions')!;
			questionSection.style.display = 'flex';
			userId.style.display = 'none';
		} else {
			state = 'badId';
			setTimeout(() => {
				state = '';
			}, 2000);
		}
	}

	function checkId() : boolean{
		console.log(typeof(userId));
        if (Number.isInteger(parseInt(userId))){
			console.log(userId)
            return true;
        }
		
        return false;
    }

	function showThankYou(){
        var endSection  = document.getElementById('End')!;
        var questionSection  = document.getElementById('Questions')!;
        questionSection.style.display = 'none';
        endSection.style.display = 'flex';
    }

	reset();

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section id=UserId>
	<h2>Enter your user ID</h2>
	<input class="userId" bind:value={userId} />
	<button on:click={() => showQuestions()}> Proceed </button>
</section>

<section id=Questions style="display: none">
		<h2>What emotion is conveyed in this story?</h2>
		<div class="story">{story}</div>

		<h3>The computer thinks this:</h3>
		<div class="prediction">
			{#if parseInt(userId) % 2 == 0}
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
								{(parseFloat(d.toFixed(4))*100).toFixed(2)}%
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

<section id=End style="display: none">
	<h2>Thanks for participating!</h2>
</section>
{#if state === 'badId'}
	<div class="banner error">Check your ID! Should be a number.</div>
{/if}

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
