<script lang="ts">
	import { Configuration, OpenAIApi } from 'openai';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import firebaseConfig from '../keys/firebase';
	import apiKey from '../keys/openAI';
	import huggableKey from '../keys/huggable';
	import { collection, getDocs } from "firebase/firestore"; 
	import { setUserProperties } from 'firebase/analytics';

	let fireStore: any;
	let app: any;
	let db: any;

	let state = '';

	let emotion = '';
	let explanation = '';
	let confidence = '5';

	let stories : string[];
	let story = `Loading...`;
	let singleComputerPrediction = '';
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
		fireStore = await import('firebase/firestore');

		// Initialize Firebase
		app = firebaseApp.initializeApp(firebaseConfig);
		const analytics = fireAnalytics.getAnalytics(app);
		db = fireStore.getFirestore(app);
		
		const snapshot = await getDocs(collection(db, "stories"));
		snapshot.forEach((doc) => {
			getStoriesAndClassification(doc.data().story, doc.data().emotions);
		});
	});

	function getStoriesAndClassification(story : string, emotions : Map<string, number> ){
		stories.push(story);
		
	}

	let possibleEmotions = ['admiration', 'adoration', 'appreciation',  'amusement', 'anxiety', 'awe', 'awkwardness', 'boredom',  'calmness', 'confusion', 'craving', 'disgust', 'pain',  'entrancement', 'excitement', 'horror', 'interest', 'nostalgia',  'relief', 'romance','satisfaction'];
	let possibleSubjects = [
		'dwarf',
		'elf',
		'dragon',
		'man named Fred',
		'lady named Mary',
		'pixie',
		'thief',
		'wizard',
		'archer',
		'teacher',
		'president',
	];
	let possibleObjects = [
		'ball',
		'balloon',
		'dog',
		'cat',
		'candle',
		'phone',
		'lock',
		'tower',
		'laptop',
		'hammer',
		'sled',
		'tree'
	];
	let bertEmotions = ['joy', 'love', 'surprise', 'anger', 'sadness', 'fear'];

	const configuration = new Configuration({
		apiKey
	});
	const openai = new OpenAIApi(configuration);

	function validate(): boolean {
		if (!emotion || !explanation) {
			state = 'error';

			setTimeout(() => {
				state = '';
			}, 2000);

			return false;
		}

		return true;
	}

	function reset() {
		if (questionCount < 10) {
			story = 'Loading';
			emotion = '';
			explanation = '';
			confidence = '5';

			getStory();
			//getPrompt();
		} else {
			showThankYou();
		}
			
	}

	function getStory(){

	}

	async function submit() {
		state = 'loading';
		const doc = {
			singleComputerPrediction,
			confidence,
			emotion,
			explanation,
			story,
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
		/* storyPrompt = generatePrompt();
		story = await gpt3Call(storyPrompt); */
		
		//getComputerPrediction();
	}

	async function getComputerPrediction() {
		let prompt = `What emotion is this story ${story}?`;

		//await getUncertaintyInformation(story);
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
        if (Number.isInteger(parseInt(userId))){
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
	<h2>Instructions</h2>
	<p>Thank you for agreeing to take part in our HCI experiment. Please ensure that you take part in this study completely alone. It will take approximately 10 minutes to complete and you will be asked to classify 10 short stories. <br><br>

		You will firstly be asked to enter your user ID - this should have been provided to you before the experiment. As your proceed from there you will be presented a story generated by a computer.
		
		This same story will also be inputted and classified by an AI and the emotion(s) it thinks is being displayed most will be shown to you. <br><br>
		
		Following this you will select from a finite list of emotions the emotion you think best matches what was conveyed in the story above.<br><br>
		
		In order for us to build a better understanding, we ask you to write a short answer reasoning why you selected the emotion.<br><br>
		
		Finally, select on the slider the confidence level of your answer. 0% (left) being not confident at all and 100% (right) being very confident.<br>
	</p>
	<h3>Enter your user ID</h3>
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
				{#each bertEmotions as opt}
					<option value={opt}>{opt}</option>
				{/each}
			</select>

			<h3>Why did you pick this?:</h3>
			<textarea bind:value={explanation} />

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
