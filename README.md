# COMPSCI705/SOFTENG702 HCI Project

## Description

This is the implementation built to support Group 14's research on project D2: Visualising and supporting uncertainty in emotion recognition displays. This project is supervised by Dr. Danielle Lottridge and supported by Dr. Gerald Weber. 

Web app is currently deployed [here](https://hci-702.netlify.app/)

The project looks at understanding how the display of machine uncertainty affects a human user's response and uncertainty toward the classification of human emotion in written text. 


## Experimental Design
1. As the user enters the experiment, they will be asked to read the instructions and enter the user ID that was provided to them. They will then be asked to provide their consent to take part in the research experiment, clicking 'Agree and Proceed' if they consent.

2. When the user begins the experiment, a [GPT-3](https://openai.com/api/) machine generated text will be displayed to them.

3. A machine will then classify the emotion of this same text and display it to the user. This varies depending on the group in which the user is in. Group A is the treatment group, where emotion classification and machine uncertainties are displayed to the user, while Group B is the control, where only the emotion that the machine thinks is being displayed in the text is shown.

4. Following this, the user is given a custom text field to type what emotion they think was being portrated in the text.

5. Next, the user will select from a finite list of emotions the emotion they think was being portrayed in the text - joy, love, surprise, anger, sadness, fear. 

6. The user will next fill out a custom text field explaining why they made their classifications.

7. Finally, the user will be asked to enter the confidence that they had in their answers on a slider. 0% for not confident at all and 100% for very confident.

8. After submitting, the user will do the same for 9 more stories - a total of 10.

The results from all users from both groups will then be analysed. The effect that a display of machine uncertainty to users and how it affects whether or not they classified the given emotion from a written text correctly, and their confidence will be looked at and with findings compiled in a report.


## Experimental Preparations
TODO:
- speaking with surpervisors
- research, lit review
- implementation
- organising test subjects
- consent
- carrying out testing
- collection of results


## Installation

TODO: EXTRA DETAILS FOR INSTALL INSTRUCTIONS

1. Install node.js and npm then run:

```bash
npm install
```

2. Request keys from a dev and place the keys dir in `src/keys`.

3. Once you've created a project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

4. To create a production version of your app:

```bash
npm run build
```

5. You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.


## How to use

You can either follow installation instructions from above or demo the web app [here](https://hci-702.netlify.app/)

Enter X ID here to demo Group A and Y ID to demo Group B.


## Built with

- [Svelte](https://svelte.dev/)
- [Firebase](https://firebase.google.com/)
- [GitHub](https://github.com)
- [Netlify](https://www.netlify.com/)


## Developers

TODO

| Dev           | Portfolio                            | GitHub                                  |
| ------------- | ------------------------------------ | --------------------------------------- |
| Etienne Naude | [etinaude.dev](https://etinaude.dev) | [etinaude](https://github.com/etinaude) |
| Raina Song    |                                      |                                         |
| Henry Gann    |                                      |                                         |
| Lance Zhang   |                                      | [lancelancezhang](https://github.com/lancelancezhang) |
| Simon Cheng   |                                      |                                         |
| Yuwei Shen    |                                      | [alieevee](https://github.com/alieevee) |
| Balaram Panda |                                      |                                         |
