import React from "react";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { useForm } from "react-hook-form";
import { useState } from "react";
import SendIcon from "./icons/SendIcon";

const firebaseConfig = {
  apiKey: "AIzaSyAgby7hOBRU-eoAXNvJ53MoVOzOe1TBEsE",
  authDomain: "bi-chatbot-434f4.firebaseapp.com",
  projectId: "bi-chatbot-434f4",
  storageBucket: "bi-chatbot-434f4.appspot.com",
  messagingSenderId: "95059422040",
  appId: "1:95059422040:web:235dfda8982af2b214d32d",
  measurementId: "G-SCE2JDXTLF",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const functions = getFunctions(app);

const hostname = window.location.hostname;

if (hostname === "localhost") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

function App() {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");

  const submitQuestion = (formData) => {
    setAnswer("Submitting question, please hold on...");
    setQuestion(formData.question)
    const submitQ = httpsCallable(functions, "submitQuestion");
    submitQ({ question: formData.question })
      .then((result) => {
        console.log(result);
        setAnswer(result.data);
      })
      .catch((err) => {
        setAnswer(
          "I'm sorry, but there appears to be an error. Please try again"
        );
      });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleKeypress = (e) => {
    e.target.style.height = 'inherit';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;
    if(e.which === 13 && !e.shiftKey) {
      e.preventDefault();
  
      handleSubmit(submitQuestion)();
    }
  }

  return (
    <div class="flex flex-col min-h-screen">
      <div class="flex flex-col">
        <div>Hello!</div>
        <div class="whitespace-pre-line">{question}</div>
        <div class="whitespace-pre-line">{answer}</div>
      </div>
      <div class="grow h-full"></div>
      <form
        class="flex items-center py-2 px-3 bg-gray-100 rounded-lg dark:bg-gray-700"
        onSubmit={handleSubmit(submitQuestion)}
      >
        <textarea
          rows="1"
          type="text"
          name="question"
          class="block mx-4 p-2.5 w-full text-gray-900 bg-white rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Ask away!"
          onKeyDown={handleKeypress}
          {...register("question")}
        ></textarea>
        <button
          type="submit"
          class="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
        >
          <svg
            class="w-6 h-6 rotate-90"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default App;
