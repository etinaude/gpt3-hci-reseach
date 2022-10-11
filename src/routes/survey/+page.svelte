<script lang="ts">
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import firebaseConfig from './../../keys/firebase';
	import { collection, getDocs } from 'firebase/firestore';
	import { page } from '$app/stores';
	import Banner from '$lib/Banner.svelte';

	let firebase: any = {
		fireStore: null,
		app: null,
		db: null
	};

	let userData = {
		chosenEmotion: '',
		explanation: '',
		customAnswer: '',
		confidence: '5'
	};

	let storyList: string[];
	let currentStory = `Loading...`;
	let singleComputerPrediction = '';
	let allUncertainties: { id: string; emotions: Map<string, number> }[];
	let userId = '';
	let questionCount = 0;

	let bannerInfo = {
		style: '',
		text: '',
		display: false
	};

	let labels = ['anger', 'fear', 'joy', 'love', 'sadness', 'surprise'];

	let graph = [
		{
			emotion: 'anger',
			probability: 64.32
		},
		{
			emotion: 'joy',
			probability: 41
		},
		{
			emotion: 'fear',
			probability: 2.77
		},
		{
			emotion: 'sadness',
			probability: 1.59
		},
		{
			emotion: 'surprise',
			probability: 0.63
		},
		{
			emotion: 'love',
			probability: 0.36
		}
	];

	onMount(async () => {
		const firebaseApp = await import('firebase/app');
		firebase.fireStore = await import('firebase/firestore');

		// Initialize Firebase
		firebase.app = firebaseApp.initializeApp(firebaseConfig);
		firebase.db = firebase.fireStore.getFirestore(firebase.app);
		setup();
	});

	async function setup() {
		const snapshot = await getDocs(collection(firebase.db, 'stories'));
		storyList = [];
		allUncertainties = [];
		snapshot.forEach((doc) => {
			getStoriesAndClassification(doc.id, doc.data().story, doc.data().emotions);
		});
		currentStory = storyList[questionCount];
		singleComputerPrediction = 'anger';

		userId = getId();
	}

	function getId(): string {
		try {
			const id = $page.url.search.split('=')[1];
			const idNum = parseFloat(id);

			if (idNum === Math.round(idNum) && idNum <= 100 && idNum >= 0) return id;
		} catch (error) {
			console.log(error);
		}
		window.location.href = 'about';
		return '';
	}

	function getStoriesAndClassification(id: string, story: string, emotions: Map<string, number>) {
		storyList.push(story);
		allUncertainties.push({ id, emotions });
	}

	function validate(): boolean {
		if (!(userData.chosenEmotion || userData.customAnswer) || !userData.explanation) {
			bannerInfo = {
				style: 'error',
				text: 'Please fill out all fields',
				display: true
			};

			setTimeout(() => {
				bannerInfo.display = false;
			}, 2000);

			return false;
		}

		return true;
	}

	function reset() {
		if (questionCount >= 10) {
			window.location.href = 'thanks';
			return;
		}

		currentStory = 'Loading';
		userData.chosenEmotion = '';
		userData.explanation = '';
		userData.customAnswer = '';
		userData.confidence = '5';
		if (questionCount != 0) {
			getUncertaintyInformation();
		}
	}

	async function submit() {
		bannerInfo.display = true;

		bannerInfo.text = 'Submitting...';
		bannerInfo.style = 'loading';

		const doc = {
			userId,
			questionCount,
			singleComputerPrediction,
			confidence: userData.confidence,
			emotion: userData.chosenEmotion,
			explanation: userData.explanation,
			customAnswer: userData.customAnswer, //TODO
			story: currentStory
		};

		if (!validate()) return;

		const uuid = uuidv4();

		try {
			await firebase.fireStore.setDoc(firebase.fireStore.doc(firebase.db, 'docs', uuid), doc);
			bannerInfo.text = 'Submitted! 🙂';
			bannerInfo.style = 'success';
			questionCount++;
			reset();
		} catch {
			bannerInfo.style = 'apiError';
			bannerInfo.text = 'Hmm Something went wrong! Please Try again shortly';
		}

		setTimeout(() => {
			bannerInfo.display = false;
		}, 2000);
	}

	async function getUncertaintyInformation() {
		graph = [];
		Object.entries(allUncertainties[questionCount].emotions).forEach(([key, value]) => {
			graph.push({ emotion: key, probability: value });
		});

		graph.sort((a, b) => b.probability - a.probability);

		//For uncertainties
		currentStory = storyList[questionCount];

		//For single emotion
		singleComputerPrediction = graph[0].emotion;
	}

	reset();
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<h1>Question {questionCount + 1}</h1>

<section class="flex-section">
	<div>
		<h3>What emotion is conveyed in this story?</h3>
		<div class="story">{currentStory}</div>

		<h3>The computer thinks this:</h3>
		<div class="prediction">
			{#if parseInt(userId) > 50}
				<div class="chart">
					{#each graph as datum}
						<div class="graph">
							<div>
								{datum.emotion}
							</div>
							<div style="width: {datum.probability * 5}px; " class="data-bar">
								<div>{datum.probability}%</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				{singleComputerPrediction}
			{/if}
		</div>
	</div>

	<!-- Feedback form -->
	<div class="feedback-cont">
		<h3>Select emotion showed in the story:</h3>

		<select bind:value={userData.chosenEmotion}>
			{#each labels as opt}
				<option value={opt}>{opt}</option>
			{/each}
		</select>

		<h3>What do you think the emotion shown in the story is? (if not in the list above)</h3>
		<textarea bind:value={userData.customAnswer} />

		<br />
		<br />

		<h3>Why did you select this emotion?:</h3>
		<textarea bind:value={userData.explanation} />

		<br />
		<br />

		<h3>How confident are you?:</h3>
		<input type="range" min="0" max="10" class="slider" bind:value={userData.confidence} />
		<div>{userData.confidence}0%</div>

		<br />
		<br />

		<button on:click={() => submit()}> Submit </button>
	</div>
</section>

<Banner {bannerInfo} />
