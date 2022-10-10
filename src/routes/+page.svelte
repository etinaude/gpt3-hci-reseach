<script lang="ts">
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import firebaseConfig from './../keys/firebase';
	import { collection, getDocs } from 'firebase/firestore';
	import { page } from '$app/stores';
	import Banner from '$lib/Banner.svelte';

	let fireStore: any;
	let app: any;
	let db: any;

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

	let bannerInfo = {
		style: '',
		text: '',
		display: false
	};

	var data: number[];
	var labels: string[];
	labels = [];
	data = [];

	onMount(async () => {
		const firebaseApp = await import('firebase/app');
		fireStore = await import('firebase/firestore');

		// Initialize Firebase
		app = firebaseApp.initializeApp(firebaseConfig);
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
		stories.push(story);
		allUncertainties.push({ id, emotions });
	}
	let bertEmotions = ['joy', 'love', 'surprise', 'anger', 'sadness', 'fear'];

	function validate(): boolean {
		if (!emotion || !explanation || !customAnswer) {
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
			window.location.href = 'thanks';
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

	reset();
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section id="Questions">
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
		<h3>Select emotion showed in the story:</h3>

		<select bind:value={emotion}>
			{#each bertEmotions as opt}
				<option value={opt}>{opt}</option>
			{/each}
		</select>

		<h3>What do you think the emotion shown in the story is? (if not in the list above)</h3>
		<textarea bind:value={customAnswer} />

		<br />
		<br />

		<h3>Why did you select this emotion?:</h3>
		<textarea bind:value={explanation} />

		<br />
		<br />

		<h3>How confident are you?:</h3>
		<input type="range" min="0" max="10" class="slider" bind:value={confidence} />
		<div>{confidence}0%</div>

		<br />
		<br />

		<button on:click={() => submit()}> Submit </button>
	</div>
</section>

<Banner {bannerInfo} />
