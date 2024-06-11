document.addEventListener("DOMContentLoaded", () => {
  let currentQuestionId = 1;
  const textAnswerQuestions = [2, 3, 5, 6, 8, 9];

  const questionContainer = document.getElementById("question-container");
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const submitUserDetail = document.getElementById("submit-user-detail");

  submitUserDetail.addEventListener("click", async () => {
    const name = document.getElementById("user-name").value;
    const email = document.getElementById("user-email").value;
    const phone = document.getElementById("user-phone").value;

    if (name === "" || email === "" || phone === "") {
      alert("Fill all details");
      return;
    }

    const response = await fetch("/submitUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phone }),
    });

    const data = await response.json();

    if (data.user) {
      if (data.status === 0) {
        questionText.textContent = "You have completed this survey!";
        optionsContainer.innerHTML = "";
        const scoretext = document.createElement("h2");
        scoretext.textContent = "Score = " + data.score;
        optionsContainer.appendChild(scoretext);
      } else {
        loadQuestion(data.status, data.id);
      }
    } else {
      loadQuestion(currentQuestionId, data.id);
    }
  });

  const loadQuestion = async (questionId, id) => {
    const response = await fetch(`/question/${questionId}`);
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
      button.addEventListener("click", () => submitTextAnswer(questionId, id));

      optionsContainer.appendChild(input);
      optionsContainer.appendChild(button);
    } else {
      data.options.forEach((option) => {
        const button = document.createElement("button");
        button.classList.add("option");
        button.textContent = option.option_text;
        button.addEventListener("click", () => submitAnswer(questionId, id, option.id));
        optionsContainer.appendChild(button);
      });
    }

    questionContainer.classList.add("fade-in");
    setTimeout(() => questionContainer.classList.remove("fade-in"), 500);
  };

  const submitAnswer = async (questionId, id, option_id) => {
    const response = await fetch("/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questionId, id, option_id }),
    });

    const data = await response.json();

    if (data.next) {
      loadQuestion(data.nextQuestionId, data.id);
    } else {
      questionText.textContent = "Thank you for completing the survey!";
      optionsContainer.innerHTML = `<h3>Your Score=${data.score}</h3>`;
    }
  };

  const submitTextAnswer = async (questionId, id) => {
    const textAnswer = document.getElementById("text-answer").value;
    const response = await fetch("/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questionId, id, text_answer: textAnswer }),
    });

    const data = await response.json();

    if (data.next) {
      loadQuestion(data.nextQuestionId, data.id);
    } else {
      questionText.textContent = "Thank you for completing the survey!";
      optionsContainer.innerHTML = `<h3>Your Score=${data.score}</h3>`;
    }
  };
});



























// document.addEventListener("DOMContentLoaded", () => {
//     let currentQuestionId = 1;

//     const questionContainer = document.getElementById("question-container");
//     const questionText = document.getElementById("question-text");
//     const optionsContainer = document.getElementById("options-container");
//   const submitUserDetail = document.getElementById("submit-user-detail");

//   submitUserDetail.addEventListener("click",async()=>{
 
//     const name = document.getElementById("user-name").value;
//     const email = document.getElementById("user-email").value;
//     const phone = document.getElementById("user-phone").value;
//     if(name===""||email===""||phone===""){
//       alert("Fill all details");
//       return;
//     } 
    
//     const response = await fetch("/submitUser", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ name,email,phone}),
//     });
  
//     const data = await response.json();
   
//     if(data.user){
//       if(data.status===0){
//       questionText.textContent = "You have completed this survey!";
//       optionsContainer.innerHTML = "";
//       const scoretext = document.createElement("h2")
//       scoretext.textContent="Score = "+data.score
//       optionsContainer.appendChild(scoretext)}else{
//         loadQuestion(data.status,data.id);
//       }
//     }else{
      
//     loadQuestion(currentQuestionId,data.id);
//     }
//   })
//     const loadQuestion = async (questionId,id) => {
//       const response = await fetch(`/question/${questionId}`);
//       const data = await response.json();

//       questionText.textContent = data.question.question_text;
//       optionsContainer.innerHTML = "";

//       data.options.forEach((option) => {
//         const button = document.createElement("button");
//         button.classList.add("option");
//         button.textContent = option.option_text;
//         button.addEventListener("click", () =>{
       
//           submitAnswer(questionId,id,option.id);}
//         );
//         optionsContainer.appendChild(button);
//       });

//       questionContainer.classList.add("fade-in");
//       setTimeout(() => questionContainer.classList.remove("fade-in"), 500);
//     };

//     const submitAnswer = async (questionId,id,option_id) => {
//       const response = await fetch("/submit", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ questionId,id,option_id}),
//       });
    
//       const data = await response.json();

//       if (data.next) {
//         loadQuestion(data.nextQuestionId,data.id);
//       } else {
//         console.log(data);
//         questionText.textContent = "Thank you for completing the survey!";
//         optionsContainer.innerHTML = `<h3>Your Score=${data.score}</h3>`;
//       }
//     };

    
//   });