import huggableKey from '../keys/huggable';
import { Configuration, OpenAIApi } from 'openai';
import apiKey from '../keys/openAI';

export const possibleEmotions = [
	'admiration',
	'adoration',
	'appreciation',
	'amusement',
	'anxiety',
	'awe',
	'awkwardness',
	'boredom',
	'calmness',
	'confusion',
	'craving',
	'disgust',
	'pain',
	'entrancement',
	'excitement',
	'horror',
	'interest',
	'nostalgia',
	'relief',
	'romance',
	'satisfaction'
];
export const possibleSubjects = [
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
	'president'
];
export const possibleObjects = [
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

let story = '';

//Used to generate the prompt, make gpt3 call and classify it
async function getPrompt() {
	generatePrompt();
	story = await gpt3Call(generatePrompt());

	getComputerPrediction();
}

function generatePrompt(): string {
	let emotion = pickRandomItem(possibleEmotions);
	let subject = pickRandomItem(possibleSubjects);
	let object = pickRandomItem(possibleObjects);

	return `Tell me a long ${emotion} story about a ${subject} who had a ${object}`;
}

function pickRandomItem(items: any[]) {
	return items[Math.floor(Math.random() * items.length)];
}

const configuration = new Configuration({
	apiKey
});
const openai = new OpenAIApi(configuration);

async function gpt3Call(prompt: string): Promise<string> {
	const completion = await openai.createCompletion({
		model: 'text-davinci-002',
		prompt: prompt,
		temperature: 0.6,
		max_tokens: 100
	});

	//the story
	return completion.data.choices![0].text!;
}

async function getComputerPrediction() {
	let prompt = `What emotion is this story ${story}?`;

	await getUncertaintyInformation(story);
}

//Classify story using bert-base-uncased-emotion model
async function getUncertaintyInformation(story: string): Promise<object[]> {
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
		return arr;
	} else {
		throw new Error(arr.error);
	}
}
