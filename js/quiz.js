// quiz.js

class TOEICQuiz {
  constructor() {
    this.Questions = [];
    this.answers = new Map();
    this.correctAnswers = new Map();
    this.score = 0;
    this.numQuestions = 10; // Number of questions to load

    this.submitClicked = false; // Flag to track if submit button is clicked
    this.timeLimit = 1800; // Default time limit for the quiz (30 minutes in seconds)
    this.timerInterval = null; // Interval for the timer
    this.quizSubmitted = false; // Flag to track whether the quiz has been automatically submitted
    this.quizStarted = false; // Flag to track if the quiz has started

    this.answerCorrectness = new Array(this.numQuestions).fill(false); // Array to store correctness of answers

    // Get references to the elements
    this.timerFloat = document.querySelector('.timer-float');
    this.column1Top = document.querySelector('.column-1-top');
    this.startButton = document.querySelector('.start-button');

    // Store the original width of the .timer-float element
    this.originalTimerFloatWidth = this.timerFloat.offsetWidth;

    // Bind event listeners
    this.adjustTimerFloatPosition = this.adjustTimerFloatPosition.bind(this);
    this.startQuiz = this.startQuiz.bind(this);
    this.adjustTimerFloatPosition();
    // Add event listener for window resize
    window.addEventListener('resize', () => {
      this.adjustTimerFloatPosition();
    });

    window.addEventListener('scroll', this.adjustTimerFloatPosition);
  }

  // Method to shuffle an array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Method to handle selection of answer choices
  selectAnswer(event) {
    if (this.submitClicked) {
      return; // Prevent selection after submit button is clicked
    }

    const selectedButton = event.target;
    // console.log("selectedButton ", selectedButton);
    const passageIndex = parseInt(selectedButton.dataset.passageIndex);
    const questionIndex = parseInt(selectedButton.dataset.questionIndex);


    // Deselect any previously selected answer choice
    const choicesList = selectedButton.parentNode;
    choicesList.querySelectorAll('button').forEach(button => {
      button.classList.remove('selected');
      button.style.backgroundColor = ''; // Reset background color
    });

    // Toggle 'selected' class for clicked answer choice
    selectedButton.classList.add('selected');

    // Highlight the clicked answer choice
    selectedButton.style.backgroundColor = 'lightblue';

    // Store the user's selection for later scoring
    const selectedChoice = selectedButton.textContent.trim().substring(3).trim(); // Remove (A), (B), (C), (D) from the text
    // console.log("selectedChoice ", selectedChoice);

    // console.log("questionIndex in selectAnswer = ", questionIndex);
    // Formulate the key for the answer map
    const answerKey = `${passageIndex}.${questionIndex}`;
    this.answers.set(answerKey, selectedChoice);
    // console.log("this.answers in selectAnswer : ", this.answers);
  }

  // Method to get the question index from a button element
  getQuestionIndex(button) {
    return parseInt(button.dataset.questionIndex);
  }

  // Method to add event listeners to answer choice buttons
  addChoiceListeners() {
    document.querySelectorAll('.choices button').forEach(button => {
      button.addEventListener('click', this.selectAnswer.bind(this));
    });
  }

  async displayQuiz() {
    try {
      await this.loadQuestions();
      this.loadCorrectAnswers();
      this.displayTimeDropdown();
      this.displayStartButton();

      // Add margin between "Choose time" label and dropdown
      const dropdownLabel = document.querySelector('label[for="timeDropdown"]');
      dropdownLabel.style.marginBottom = '20px'; // Adjust as needed

      // Add margin between dropdown and "Start Quiz" button
      const dropdown = document.getElementById('timeDropdown');
      dropdown.style.marginBottom = '20px'; // Adjust as needed

    } catch (error) {
      console.error('Error loading quiz:', error);
    }
  }

  async loadQuestions() {
    const response = await fetch('./questions/questionsPart6.json');
    this.Questions = await response.json();

    this.Questions = this.shuffleArray(this.Questions).slice(0, this.numQuestions);

    // Shuffle the passages
    const shuffledData = this.shuffleArray([...this.Questions]);
    shuffledData.forEach((section, sectionIndex) => {
      // Shuffle the questions within each passage
      const shuffledQuestions = section.questions // shuffle([...section.questions]);
      shuffledQuestions.forEach((questionData, index) => {
        // Shuffle the choices for each question
        const shuffledOptions = this.shuffleArray([...questionData.choices]);
      });
    });

    // console.log(this.Questions);
  }

  // Method to display questions
  // displayQuestions() {
  //   const quizElement = document.getElementById('quiz'); // Get quiz element

  //   const quizColumn = document.createElement('div');
  //   quizColumn.classList.add('quiz-column'); // Add the CSS class to the quiz column

  //   this.Questions.forEach((section, sectionIndex) => {
  //     const passageBlock = document.createElement('div');
  //     passageBlock.classList.add('passage-block');

  //     const passageElement = document.createElement('div');
  //     passageElement.classList.add('passage');
  //     passageElement.textContent = `Passage ${sectionIndex + 1}:  ${section.passage.replace(/\n/g, '\n\n')}`;
  //     // passageElement.innerHTML = `Passage ${sectionIndex + 1}: ${section.passage.replace(/\n/g, '<br>')}`;
  //     passageBlock.appendChild(passageElement);


  //     passageBlock.appendChild(document.createElement('br')); // Add

  //     section.questions.forEach((questionData, index) => {
  //       const questionBlock = document.createElement('div');
  //       questionBlock.classList.add('question-block');

  //       const questionElement = document.createElement('div');
  //       questionElement.classList.add('question');
  //       questionElement.textContent = `Question ${questionData.question}`;
  //       questionBlock.appendChild(questionElement);

  //       const optionsList = document.createElement('div');
  //       optionsList.classList.add('choices');

  //       // const optionElement = document.createElement('div');
  //       // // optionElement.className = 'option';
  //       // optionElement.classList.add('choices');
  //       this.displayChoices(optionsList, questionData.choices, sectionIndex, index);
  //       // questionBlock.appendChild(optionElement);
  //       questionBlock.appendChild(optionsList);
  //       questionBlock.appendChild(document.createElement('br')); // Add
  //       passageBlock.appendChild(questionBlock);
  //     });

  //     quizElement.appendChild(passageBlock);
  //     quizElement.appendChild(document.createElement('br')); // Add
  //     quizElement.appendChild(document.createElement('br')); // Add 
  //   });
  //   // Add event listeners to answer choice buttons
  //   this.addChoiceListeners();

  // }


// Method to display questions
displayQuestions() {
  const quizElement = document.getElementById('quiz'); // Get quiz element

  const quizColumn = document.createElement('div');
  quizColumn.classList.add('quiz-column'); // Add the CSS class to the quiz column

  this.Questions.forEach((section, sectionIndex) => {
    const passageBlock = document.createElement('div');
    passageBlock.classList.add('passage-block');

    const passageElement = document.createElement('div');
    passageElement.classList.add('passage');

    // Replace single "\n" with a single line break and double "\n\n" with two line breaks
    const passageText = `Passage ${sectionIndex + 1}: ${section.passage.split('\n\n').join('<br><br>').split('\n').join('<br>')}`;
    passageElement.innerHTML = passageText;
    passageBlock.appendChild(passageElement);

    passageBlock.appendChild(document.createElement('br')); // Add

    section.questions.forEach((questionData, index) => {
      const questionBlock = document.createElement('div');
      questionBlock.classList.add('question-block');

      const questionElement = document.createElement('div');
      questionElement.classList.add('question');
      questionElement.textContent = `Question ${questionData.question}`;
      questionBlock.appendChild(questionElement);

      const optionsList = document.createElement('div');
      optionsList.classList.add('choices');

      this.displayChoices(optionsList, questionData.choices, sectionIndex, index);
      questionBlock.appendChild(optionsList);
      questionBlock.appendChild(document.createElement('br')); // Add
      passageBlock.appendChild(questionBlock);
    });

    quizElement.appendChild(passageBlock);
    quizElement.appendChild(document.createElement('br')); // Add
    quizElement.appendChild(document.createElement('br')); // Add 
    // Add horizontal line
    const horizontalLine = document.createElement('hr');
    quizElement.appendChild(horizontalLine);
  });

  // Add event listeners to answer choice buttons
  this.addChoiceListeners();
}


  // Method to display choices for a question
  displayChoices(choicesList, choices, passageIndex, questionIndex) {
    const shuffledChoices = this.shuffleArray([...choices]);
    shuffledChoices.forEach((choice, choiceIndex) => {
      const choiceButton = document.createElement('button');
      choiceButton.textContent = `(${String.fromCharCode(65 + choiceIndex)}) ${choice}`;

      // Store the questionIndex as a data attribute of the button
      choiceButton.dataset.passageIndex = passageIndex;
      choiceButton.dataset.questionIndex = questionIndex;

      // Add margin or padding to create spacing between choice buttons
      choiceButton.style.marginBottom = '5px'; // Adjust the value as needed

      choiceButton.style.cursor = 'pointer'; // Change cursor to pointer

      choicesList.appendChild(choiceButton);
      choicesList.appendChild(document.createElement('br')); // Add line break
    });
  }


  // Method to display Submit button
  displaySubmitButton() {
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    // submitButton.id = 'submit';
    submitButton.classList.add('submit-button'); // Apply the CSS class to the Submit button

    submitButton.style.backgroundColor = 'red'; // Set background color
    submitButton.style.padding = '10px 20px'; // Set padding
    submitButton.style.fontSize = '20px'; // Set font size
    submitButton.style.border = 'none'; // Remove border
    submitButton.style.color = 'white'; // Set text color to white

    submitButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to submit your answers?')) {
        // console.log('Submit button clicked');
        this.calculateScore();
        this.submitClicked = true; // Set flag to indicate submit button clicked
        submitButton.disabled = true; // Disable button after submission

        // Set cursor style to default for all buttons
        document.querySelectorAll('button').forEach(button => {
          button.style.cursor = 'default';
        });

        // Move to the top of the page
        window.scrollTo({
          top: 0,
          behavior: 'smooth' // Smooth scrolling
        });

        // Stop the timer
        clearInterval(this.timerInterval);
      }
    });
    // Add pointer cursor on hover
    submitButton.style.cursor = 'pointer';

    // Append the submit button inside the .submit-button div
    const submitButtonContainer = document.getElementById('submit');
    submitButtonContainer.appendChild(submitButton);

  }


  calculateScore() {
    this.score = 0;
    this.answerCorrectness = []; // Reset the array

    // Loop through correct answers to ensure all are checked
    this.correctAnswers.forEach((correctAnswer, answerKey) => {
      const userAnswer = this.answers.get(answerKey);

      // Check if user's answer matches the correct answer
      const isCorrect = userAnswer === correctAnswer;

      // Check if the user's answer is correct, wrong, or unanswered
      let answerStatus;
      if (isCorrect) {
        answerStatus = 'correct';
      } else if (userAnswer !== undefined) {
        answerStatus = 'wrong';
      } else {
        answerStatus = 'unanswered';
      }

      this.answerCorrectness.push({ key: answerKey, status: answerStatus })

      // console.log("this.answerCorrectness :", this.answerCorrectness);
      if (isCorrect) {
        this.score++;
      }
    });

    // Correct score display to show total number of questions
    const totalQuestions = this.correctAnswers.size;
    // console.log("this.Questions.answerKey : ", this.correctAnswers.size)
    this.displayScore(totalQuestions);

    this.displayCorrectAnswers();
  }


  // Method to display score with total number of questions
  displayScore(totalQuestions) {
    const scoreContainer = document.createElement('div');
    scoreContainer.textContent = `Your score: ${this.score} out of ${totalQuestions}`;
    scoreContainer.style.color = 'red'; // Set text color to red
    scoreContainer.style.fontSize = '30px';
    const answersColumn = document.querySelector('.answers-column');
    answersColumn.appendChild(scoreContainer);
  }

  // Method to load correct answers
  loadCorrectAnswers() {
    this.Questions.forEach((passage, passageIndex) => {
      passage.questions.forEach((question, questionIndex) => {
        const questionKey = `${passageIndex}.${questionIndex}`;
        this.correctAnswers.set(questionKey, question.answer);
      });
    });
    // console.log("loadCorrectAnswers", this.correctAnswers);
  }


  // Method to display correct answers
  displayCorrectAnswers() {
    const correctAnswersContainer = document.createElement('div');
    correctAnswersContainer.classList.add('correct-answers');

    this.answerCorrectness.forEach(({ key, status }) => {
      const correctAnswer = this.correctAnswers.get(key);
      const answerText = document.createElement('p');
      const [passageIndex, questionIndex] = key.split('.').map(Number);

      const questionNumber = `Passage ${passageIndex + 1}: Q. ${questionIndex + 1}`;

      if (status === 'correct') {
        answerText.style.color = 'green'; // Correct answers in green
      } else if (status === 'wrong') {
        answerText.style.color = 'red'; // Wrong answers in red
      } else {
        answerText.style.color = 'orange'; // Unanswered questions in orange
      }

      answerText.textContent = `${questionNumber}: ${correctAnswer}`;
      correctAnswersContainer.appendChild(answerText);
    });

    const answersColumn = document.querySelector('.answers-column');
    answersColumn.appendChild(correctAnswersContainer);
  }

  displayTimeDropdown() {
    // Create the dropdown container element
    const dropdownContainer = document.createElement('div');
    // dropdownContainer.classList.add('timer-float'); // Add timer-float class

    // Create the label element
    const label = document.createElement('label');
    label.setAttribute('for', 'timeDropdown');
    label.textContent = 'Choose time: ';
    label.style.color = 'blue'; // Set text color to red
    label.style.fontSize = '30px'
    dropdownContainer.appendChild(label);

    // Create the select element
    const select = document.createElement('select');
    select.setAttribute('id', 'timeDropdown');
    select.style.width = '200px'; // Set width of the select box
    select.style.height = '50px'; // Set height of the select box
    select.style.padding = '5px'; // Add padding to the select box
    select.style.border = '2px solid blue'; // Add border to the select box
    select.style.fontSize = '30px'; // Set font size of the text inside the select box
    select.style.color = 'blue'; // Set color of the text inside the select box

    // Define the options
    const options = [
      { value: '300', text: '5 minute' },
      { value: '600', text: '10 minute' },
      { value: '720', text: '12 minute' },
      { value: '900', text: '15 minute' },
      { value: '1200', text: '20 minute' },
      { value: '1800', text: '30 minutes' },
      { value: '2400', text: '40 minutes' },
      { value: '3000', text: '50 minutes' }
    ];

    // Create and append option elements
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.setAttribute('value', option.value);
      optionElement.textContent = option.text;
      optionElement.style.color = 'blue'; // Set text color of options to blue
      optionElement.style.fontSize = '20px'; // Set font size of options to 20px
      select.appendChild(optionElement);
    });

    // Append the label and select elements to the dropdown container
    dropdownContainer.appendChild(label);
    dropdownContainer.appendChild(select);

    // Append the dropdown container to the quiz element
    document.querySelector('.timer-float').appendChild(dropdownContainer);

  }

  displayStartButton() {
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Quiz';
    startButton.style.fontSize = '30px'
    startButton.style.width = '200px'; // Set width to 200 pixels
    startButton.style.height = '50px'; // Set height to 50 pixels
    startButton.style.backgroundColor = 'green'; // Change background color to green
    startButton.style.color = 'white'; // Change text color to white
    startButton.style.cursor = 'pointer'; // Set cursor to pointer
    startButton.addEventListener('click', () => {
      const selectedTime = document.getElementById('timeDropdown').value;
      this.timeLimit = parseInt(selectedTime);
      this.startQuiz();
    });

    // Append the start button to the new-box container
    const newBox = document.querySelector('.timer-float');
    newBox.appendChild(startButton);
    // document.getElementById('quiz').appendChild(startButton);
  }

  adjustTimerFloatPosition() {
    const rect = this.column1Top.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop >= rect.bottom) {
      const originalWidth = this.timerFloat.offsetWidth; // Store the original width

      // Apply fixed positioning and set the original width
      this.timerFloat.style.position = 'fixed';
      this.timerFloat.style.top = '0';
      // this.timerFloat.style.left = '0';
      this.timerFloat.style.width = `${originalWidth}px`; // Explicitly set the width
    } else {
      // Revert to relative positioning and remove the width property
      this.timerFloat.style.position = 'relative';
      this.timerFloat.style.top = '';
      this.timerFloat.style.left = '';
      this.timerFloat.style.width = '';
    }
  }

  startQuiz() {
    // Hide time dropdown and start button
    document.getElementById('timeDropdown').style.display = 'none';
    document.querySelector('button').style.display = 'none';

    // Hide the dropdown container
    const dropdownContainer = document.querySelector('.timer-float');
    dropdownContainer.querySelector('select').style.display = 'none';
    dropdownContainer.querySelector('label').style.display = 'none';

    // Display remaining time
    this.displayTimer();

    // Display the quiz column, answers column, and submit button
    document.querySelector('.quiz-column').style.display = 'block';
    document.querySelector('.answers-column').style.display = 'block';
    document.querySelector('.submit-button-container').style.display = 'block';

    // Enable submit button
    this.displaySubmitButton();

    // Set the flag to indicate that the quiz has started
    this.quizStarted = true;

    // Load and display questions
    this.loadQuestions();
    this.displayQuestions();

  }

  displayTimer() {
    const timerElement = document.createElement('div');
    timerElement.textContent = `Time left: ${this.formatTime(this.timeLimit)}`;
    timerElement.style.color = "blue";
    timerElement.style.fontSize = '30px'; // Set font size to 20 pixels
    // document.getElementById('quiz').appendChild(timerElement);

    // Append the timer element to the timer-float container
    const newBox = document.querySelector('.timer-float');
    newBox.appendChild(timerElement);

    // Start the timer
    this.timerInterval = setInterval(() => {
      this.timeLimit--;
      timerElement.textContent = `Time left: ${this.formatTime(this.timeLimit)}`;

      if (this.timeLimit <= 0) {
        clearInterval(this.timerInterval);
        this.submitQuiz();
        // console.log("submitQuiz was called.");
      }
    }, 1000); // Update the timer every second
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  // Method to submit the quiz automatically when time is up
  submitQuiz() {
    // Prevent duplicate submission
    if (this.quizSubmitted) {
      return;
    }

    // Disable answer choices
    const choiceButtons = document.querySelectorAll('.choices button');
    choiceButtons.forEach(button => {
      button.disabled = true;
    });

    // Disable submit button
    document.querySelector('.submit-button').disabled = true;

    if (!this.submitClicked) {
      choiceButtons.forEach(button => {
        const questionIndex = this.getQuestionIndex(button); // Retrieve question index using getQuestionIndex method
        if (this.answers.has(questionIndex)) {
          const selectedChoice = this.answers.get(questionIndex);
          this.answers.set(questionIndex, selectedChoice);
        }
      });
    }

    // Calculate and display scores
    this.calculateScore();

    // Set the flag to indicate that the quiz has been submitted
    this.quizSubmitted = true;
  }

}

// Create instance of TOEICQuiz and display the quiz
const quiz = new TOEICQuiz();
quiz.displayQuiz();
