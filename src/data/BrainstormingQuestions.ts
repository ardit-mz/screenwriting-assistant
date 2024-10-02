const questions =  [
    "Have you come across any cinematic elements recently that captivated your attention?",
    "What message or insight do you hope to convey to your audience?",
    "What's a personal experience you've had that still lingers in your mind?",
    "What's a moral dilemma you've always wrestled with?",
    "What genre do you feel most compelled to write in right now?",
    "Is there a particular emotion or sensation you want your audience to feel while watching your film?",
    "What's a societal issue or trend you've observed that you think needs more exploration?",
    "Think of a twist or unexpected revelation that would shock your audience. Now, what story could lead to that moment?",
    "Are there any themes or topics you're hesitant to delve into?",
    "Which settings or landscapes do you envision as the backdrop for your narrative?"
]

export function getRandomQuestion () {
    const index = Math.floor(Math.random() * questions.length);
    return questions[index]
}