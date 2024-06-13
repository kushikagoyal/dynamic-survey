document.addEventListener("DOMContentLoaded", () => {
  let currentQuestionId = 1;
  const textAnswerQuestions = [2, 3, 5, 6, 8, 9];
  let sessionId = Math.random().toString(36).substring(2); // Generating a random session ID

  const questionContainer = document.getElementById("question-container");
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");

  const loadQuestion = async (questionId) => {
      try {
          const response = await fetch(`/question/${questionId}`);
          if (!response.ok) throw new Error('Failed to load question');
          const data = await response.json();

          questionText.textContent = data.question.question_text;
          optionsContainer.innerHTML = "";

          if (textAnswerQuestions.includes(parseInt(questionId))) {
              const input = document.createElement("input");
              input.type = "text";
              input.id = "text-answer";
              input.placeholder = "Enter your answer here";

              const button = document.createElement("button");
              button.textContent = "Submit";
              button.addEventListener("click", () => submitTextAnswer(questionId));

              optionsContainer.appendChild(input);
              optionsContainer.appendChild(button);
          } else {
              data.options.forEach((option) => {
                  const button = document.createElement("button");
                  button.classList.add("option");
                  button.textContent = option.option_text;
                  button.addEventListener("click", () => submitAnswer(questionId, option.id));
                  optionsContainer.appendChild(button);
              });
          }

          questionContainer.classList.add("fade-in");
          setTimeout(() => questionContainer.classList.remove("fade-in"), 500);
      } catch (error) {
          console.error("Error loading question:", error);
          alert("An error occurred while loading the question");
      }
  };

  const submitAnswer = async (questionId, option_id) => {
      try {
          const response = await fetch("/submit", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ questionId, sessionId, option_id }),
          });

          if (!response.ok) throw new Error('Failed to submit answer');
          const data = await response.json();

          if (data.next) {
              loadQuestion(data.nextQuestionId);
          } else {
              questionText.textContent = "Thank you for completing the survey!";
              optionsContainer.innerHTML = `<h3>Your Score = ${data.score}</h3>`;
          }
      } catch (error) {
          console.error("Error submitting answer:", error);
          alert("An error occurred while submitting your answer");
      }
  };

  const submitTextAnswer = async (questionId) => {
      const textAnswer = document.getElementById("text-answer").value;
      try {
          const response = await fetch("/submit", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ questionId, sessionId, text_answer: textAnswer }),
          });

          if (!response.ok) throw new Error('Failed to submit text answer');
          const data = await response.json();

          if (data.next) {
              loadQuestion(data.nextQuestionId);
          } else {
              questionText.textContent = "Thank you for completing the survey!";
              optionsContainer.innerHTML = `<h3>Your Score = ${data.score}</h3>`;
          }
      } catch (error) {
          console.error("Error submitting text answer:", error);
          alert("An error occurred while submitting your answer");
      }
  };

  // Start loading the first question
  loadQuestion(currentQuestionId);
});
