<script lang="ts">
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import firebaseConfig from '../keys/firebase';
	import { collection, doc, getDocs } from 'firebase/firestore';

	let fireStore: any;
	let app: any;
	let db: any;

	let state = '';

	let emotion = '';
	let explanation = '';
	let customAnswer = '';
	let confidence = '5';

	let stories: string[];
	let story = `Loading...`;
	let singleComputerPrediction = '';
	let allUncertainties: { id: string; emotions: Map<string, number> }[];
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
		setup();
	});

	async function setup() {
		const snapshot = await getDocs(collection(db, 'stories'));
		stories = [];
		allUncertainties = [];
		snapshot.forEach((doc) => {
			getStoriesAndClassification(doc.id, doc.data().story, doc.data().emotions);
		});
		console.log(stories);
		console.log(allUncertainties);
		story = stories[questionCount];
		labels = ['anger', 'fear', 'joy', 'love', 'sadness', 'surprise'];
		data = [64.32, 2.77, 41, 0.36, 1.59, 0.63];
		singleComputerPrediction = 'anger';
	}

	function getStoriesAndClassification(id: string, story: string, emotions: Map<string, number>) {
		stories.push(story);
		allUncertainties.push({ id, emotions });
	}
	let bertEmotions = ['joy', 'love', 'surprise', 'anger', 'sadness', 'fear'];

	/* let possibleEmotions = ['admiration', 'adoration', 'appreciation',  'amusement', 'anxiety', 'awe', 'awkwardness', 'boredom',  'calmness', 'confusion', 'craving', 'disgust', 'pain',  'entrancement', 'excitement', 'horror', 'interest', 'nostalgia',  'relief', 'romance','satisfaction'];
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
	]; */
	let bertEmotions = ['joy', 'love', 'surprise', 'anger', 'sadness', 'fear']; 


	function validate(): boolean {
		if (!emotion || !explanation || !customAnswer) {
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
			customAnswer = '';
			confidence = '5';
			if (questionCount != 0) {
				getUncertaintyInformation();
			}
		} else {
			showThankYou();
		}
	}

	async function submit() {
		state = 'loading';
		const doc = {
			userId,
			questionCount,
			singleComputerPrediction,
			confidence,
			emotion,
			explanation,
			customAnswer,
			story
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

	/* function pickRandomItem(items: any[]) {
		return items[Math.floor(Math.random() * items.length)];
	} */

	/* function generatePrompt(): string {
		let emotion = pickRandomItem(possibleEmotions);
		let subject = pickRandomItem(possibleSubjects);
		let object = pickRandomItem(possibleObjects);

		return `Tell me a long ${emotion} story about a ${subject} who had a ${object}`;
	} */

	/*async function gpt3Call(prompt: string): Promise<string> {
		const completion = await openai.createCompletion({
			model: 'text-davinci-002',
			prompt: prompt,
			temperature: 0.6,
			max_tokens: 100
		});

		return completion.data.choices![0].text!;
	}*/

	/* async function getPrompt() {
		storyPrompt = generatePrompt();
		story = await gpt3Call(storyPrompt); 
		
		//getComputerPrediction();
	} */

	/* async function getComputerPrediction() {
		let prompt = `What emotion is this story ${story}?`;

		await getUncertaintyInformation(story);
	} */

	async function getUncertaintyInformation(){
		/* console.log('here');

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

		//Array holding uncertainty information
		const arr = await res.json(); */
		
		console.log(typeof allUncertainties[questionCount].emotions);
		Object.entries(allUncertainties[questionCount].emotions).forEach(([key, value]) => {
			uncertainties.set(key, value.toString());
		});
		console.log(uncertainties);
		//For uncertainties
		labels = Array.from(uncertainties.keys());
		data = Array.from(uncertainties.values()).map((str) => {
			return Number(str);
		});
		story = stories[questionCount];
		//For single emotion
		singleComputerPrediction = [...uncertainties.entries()].reduce((a, e) =>
			e[1] > a[1] ? e : a
		)[0];
	}

	function showQuestions() {
		if (checkId()) {
			state = '';
			var userId = document.getElementById('UserId')!;
			var questionSection = document.getElementById('Questions')!;
			questionSection.style.display = 'flex';
			userId.style.display = 'none';
		} else {
			state = 'badId';
			setTimeout(() => {
				state = '';
			}, 2000);
		}
	}

	function checkId(): boolean {
		if (Number.isInteger(parseInt(userId)) && parseInt(userId) <= 100 && parseInt(userId) >= 0) {
			return true;
		}

		return false;
	}

	function showThankYou() {
		var endSection = document.getElementById('End')!;
		var questionSection = document.getElementById('Questions')!;
		questionSection.style.display = 'none';
		endSection.style.display = 'flex';
	}

	reset();
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section id="UserId">
	<h2>Instructions</h2>
	<p>
		Thank you for agreeing to take part in our HCI experiment. Please ensure that you take part in
		this study completely alone. It will take approximately 10 minutes to complete and you will be
		asked to classify 10 short stories. <br /><br />

		You will firstly be asked to enter your user ID - this should have been provided to you before
		the experiment. As your proceed from there you will be presented a story generated by a
		computer. This same story will also be inputted and classified by an AI and the emotion(s) it
		thinks is being displayed most will be shown to you. <br /><br />

		Following this you will select from a finite list of emotions the emotion you think best matches
		what was conveyed in the story above.<br /><br />

		In order for us to build a better understanding, we ask you to write a short answer reasoning
		why you selected the emotion.<br /><br />

		Finally, select on the slider the confidence level of your answer. 0% (left) being not confident
		at all and 100% (right) being very confident.<br />
	</p>
	<h3>Enter your user ID</h3>

	<input class="userId" bind:value={userId} placeholder="ID" />

	<hr />

	<h2>Research Concent Form</h2>
	<h3>THIS FORM WILL BE HELD FOR A PERIOD OF 2 MONTHS</h3>

	<p>
		Project title: Visualising and supporting uncertainty in emotion recognition displays<br />
		Name of Supervisor: Danielle Lottridge<br />
		Name of Student Researcher: Gerald Webber
	</p>

	<p>
		I have read the Participant Information Sheet, have understood the nature of the research and
		why I have been selected. I have had the opportunity to ask questions and have had them answered
		to my satisfaction.
		<br />
		<br />
		• I agree to take part in this research. <br />
		• I understand that I am free to withdraw my participation at any time, and to withdraw any data
		traceable.<br />
		• I wish / do not wish to receive the summary of findings.<br />
		• I agree to not disclose anything discussed in the focus group.<br />
	</p>

	<button on:click={() => showQuestions()} class="proceed"> Agree and Proceed </button>
</section>

<section id="Questions" style="display: none">
	<h2>Question {questionCount + 1}</h2>
	<h3>What emotion is conveyed in this story?</h3>
	<div class="story">{story}</div>

	<h3>The computer thinks this:</h3>
	<div class="prediction">
		{#if parseInt(userId) > 50}
			<div class="chart">
				<div class="labels">
					{#each labels as l}
						<div style="height: 20px; margin-bottom: 10px">
							<span style="font-size: {15}px">{l}</span>
						</div>
					{/each}
				</div>
				<div class="percentages">
					{#each data as d}
						<div style="width: {d * 5}px; height: 20px; margin-bottom: 10px">
							<span style="font-size: {15}px">{d}%</span>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			{singleComputerPrediction}
		{/if}
	</div>

	<div class="feedback-cont">
		<h3>What do you think the emotion showned in the story is? (describe in your own words):</h3>
		<textarea bind:value={customAnswer} />

		<br />
		<br />

		<h3>Select emotion showed in the story:</h3>

		<select bind:value={emotion}>
			{#each bertEmotions as opt}
				<option value={opt}>{opt}</option>
			{/each}
		</select>

		<h3>Why did you select this emotion?:</h3>
		<textarea bind:value={explanation} />

		<h3>How confident are you?:</h3>
		<input type="range" min="0" max="10" class="slider" bind:value={confidence} />
		<div>{confidence}0%</div>

		<br />
		<br />

		<button on:click={() => submit()}> Submit </button>
	</div>
</section>

<section id="End" style="display: none">
	<h2>Thanks for participating!</h2>
</section>
{#if state === 'badId'}
	<div class="banner error">
		Check your ID! Should be a positive number and equal or less than 100.
	</div>
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
