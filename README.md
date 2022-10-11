# COMPSCI705/SOFTENG702 HCI Project

This is the implementation built to support Group 14's research on project D2: Visualising and supporting uncertainty in emotion recognition displays. This project is supervised by Dr. Danielle Lottridge and supported by Dr. Gerald Weber. 

Web app is currently deployed at [hci.etinaude.dev](https://hci.etinaude.dev/about). Use ID '56' when prompted.

The purpose of our project is to provide a greater understanding of how the display of machine uncertainty affects a human user's response toward the classification of human emotion in written text. The approach we have when doing this is comparing the accuracy of classification of emotion in written text by providing different displays of uncertainty. 

We are currently designating two different focus groups. One will be presented with the emotion that a machine thinks is most prominent in the passage. The other group will receive information about various emotions and the certainty the machine has for each of them.
<br />
<br />
<br />
## Experimental Design

<p align="center">
  <img src="https://i.imgur.com/arjidk6.png" />
</p>

1. As the user enters the experiment, they will be asked to read the instructions and enter the user ID that was provided to them. They will then be asked to provide their consent to take part in the research experiment, clicking 'Agree and Proceed' if they consent.

2. When the user begins the experiment, a [GPT-3](https://openai.com/api/) machine generated text will be displayed to them.

3. A machine will then classify the emotion of this same text and display it to the user. This varies depending on the group in which the user is in. Group A is the treatment group, where emotion classification and machine uncertainties are displayed to the user, while Group B is the control, where only the emotion that the machine thinks is being displayed in the text is shown.

4. Following this, the user is given a custom text field to type what emotion they think was being portrayed in the text.

5. Next, the user will select from a finite list of emotions the emotion they think was being portrayed in the text - joy, love, surprise, anger, sadness, fear. 

6. The user will next fill out a custom text field explaining why they made their classifications.

7. Finally, the user will be asked to enter the confidence that they had in their answers on a slider. 0% for not confident at all and 100% for very confident.

8. After submitting, the user will do the same for 9 more stories - a total of 10.

<p align="center">
  <img src="https://i.imgur.com/knvoCdH.png" />
</p>

The results from all users from both groups will then be analysed. The effect of a display of machine uncertainty to users and how it affects whether or not they classified the given emotion from a written text correctly, and their confidence will be looked at and with findings compiled in a report.
<br />

## Experimental Preparations
### Research Questions
To determine the direction of research, research gaps from the literature review were summarised. Multiple rounds of discussions were conducted within the team and with the supervisor. Initially, the team wanted to investigate the impact of a variety of different displays of machine uncertainty on human’s ability to classify emotions. After discussing with the supervisor, the team realised the necessity of controlling variables, and thus only two different kinds of displays were chosen in the final experiment.

### Implementation
Text emotion classification is the centre of this research project, to obtain text data the team utilised the Generative Pre-trained Transformer 3 [GPT3](https://openai.com/api/) to generate stories with emotions. Furthermore, to show machine emotion classification uncertainty, a hugging face emotion classification model [bert-base-uncased-emotion](https://huggingface.co/bhadresh-savani/bert-base-uncased-emotion) was used to generate six different emotion classifications with percentages. A web app was created for experiment participants to read stories and uncertainty displays and enter their emotion classification results. To reduce the waiting time for users, stories and machine classification results were pre-generated stories and classifications and stored on Firebase.

### Instructions and Consent
Detailed instructions and a Research Consent Form are included in the web app before users proceed with the experiment. The instructions include the time required for the participants to complete the entire experiment, the content of the experiment tasks, how the experimental data was generated, and how they should interact with the web app. In the consent form, participants agreed to statements such as to take part in this research and that they are able to withdraw their participation at any time and to withdraw any data traceable.

### Organising Test Subjects
Around 30 participants were recruited to complete the experiment. All participants are friends or family members of one of the team members. Participants were informed of the task, the time required, the research topic, and other relevant information in the Research Consent Form, and they only proceeded with the experiment if they agreed with the consent. 

### Testing
Participants were randomly allocated into two groups, control and treatment groups. Each participant is randomly assigned a positive integer from 0 to 100 as their user ID, participants with a user ID less than 50 are assigned to the control group, and the rest are assigned to the treatment group. To investigate the impact of the display of machine uncertainty, the control group is shown one emotion classification label (e.g. Happy) generated by the machine (the label with the highest percentage from the list of labels). In contrast, the treatment group is shown with a list of labels with percentages (uncertainty information). 

### Results
User-generated data is collected through the web app and directly stored in the Firebase database. Each participant was asked to provide three pieces of data for each question, the custom answer collected from a short answer input text box, the emotion label selected from a finite list of emotions provided collected from a multi-select drop-down list, and the confidence level percentage collected from a slider from 0% to 100%. To complete the experiment, each participant was required to complete 10 questions, in total, 30 data points were collected for each participant.

<br />
<br />

## Installation

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

4. To create a production version of our app:

```bash
npm run build
```

## Implementation Decisions
For implementation, we wanted to carry out the experiment with a large amount of people in a short time frame to an effective quality, as so opted for a lightweight tech stack.

- [Svelte](https://svelte.dev/)

Svelte was used because of its familiarity and lightweight nature in creating a highly functioning web application.

- [Firebase](https://firebase.google.com/)

A simple Firebase database was used in order to store the data from participant experiments. Calls to the database are fast and efficient.

- [Netlify](https://www.netlify.com/)

The web application was hosted on Netlify. Simple and easy.

- [Cloudflare](https://www.cloudflare.com/)

- [GitHub](https://github.com)

Github is the most familiar and well-used version control used by the group and so was selected.

## Forms
All UAHPEC certificates can be found [here](https://github.com/etinaude/gpt3-hci-research/blob/main/Certificates.pdf):

<br />

## Developers

| Dev           | GitHub                                  |
| ------------- | --------------------------------------- |
| Etienne Naude  | [etinaude](https://github.com/etinaude) |
| Raina Song       | [rainasong](https://github.com/rainasong)  |
| Henry Gann      | [4hgann](https://github.com/4hgann) |
| Lance Zhang     | [lancelancezhang](https://github.com/lancelancezhang) |
| Yuwei Shen       | [alieevee](https://github.com/alieevee) |
| Balaram Panda |[BalaramUOA](github.com/BalaramUOA) |


