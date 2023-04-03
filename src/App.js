import React from "react";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { useForm } from "react-hook-form";
import { useState } from "react";
import app from "./config/FirebaseConfig"
import FeedbackForm from "./FeedbackForm";

const analytics = getAnalytics(app);
const functions = getFunctions(app);

const hostname = window.location.hostname;

const startText = `Hello! I am a chatbot with contextual information on:

Building Control Act 1989 (2020 Edition)
Code for Environmental Sustainability of Buildings v4.0
Design for Maintainability - Non-Residential
Fire Code 2018
Fire Safety Act 1993 (2020 Edition)
PSSCOC Construction Works 2020
PSSCOC Design and Build 2020
SOP Act for Building and Construction 2021
Workplace Safety and Health Act 2014

Ask me anything related to these topics and I'll do my best to answer them!

If you want to ask another question, just retype your question below or refresh the page.
`;

if (hostname === "localhost") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

function App() {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [showFeedbackText, setShowFeedbackText] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const submitQuestion = (formData) => {
    setAnswer("Submitting question, please hold on...");
    setQuestion(formData.question);
    reset();
    setShowFeedbackText(false);
    const submitQ = httpsCallable(functions, "submitQuestion");
    submitQ({ question: formData.question })
      .then((result) => {
        setAnswer(result.data);
        setShowFeedbackText(true);
      })
      .catch((err) => {
        setAnswer(
          "I'm sorry, but there appears to be an error. Please try again"
        );
      });
  };

  const handleKeypress = (e) => {
    e.target.style.height = "inherit";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();

      handleSubmit(submitQuestion)();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col min-h-screen overflow-auto">
        <div className="flex flex-col items-start m-4">
          <div className="text-sm rounded-lg bg-blue-600 text-white px-4 rounded-bl-none">
            Chat-BI
          </div>
          <div className="flex flex-col space-y-2 max-w-sm md:max-w-2xl items-start">
            <div className="whitespace-pre-wrap px-4 py-2 rounded-lg rounded-bl-none rounded-tl-none bg-gray-200 text-gray-600">
              {startText}
            </div>
          </div>
        </div>
        <div
          style={{ display: question ? "" : "none" }}
          className="flex flex-col items-end m-4"
        >
          <div className="flex flex-col space-y-2 max-w-sm md:max-w-2xl items-start">
            <div className="whitespace-pre-wrap px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white">
              {question}
            </div>
          </div>
        </div>
        <div
          style={{ display: question ? "" : "none" }}
          className="flex flex-col items-start m-4"
        >
          <div className="text-sm rounded-lg bg-blue-600 text-white px-4 rounded-bl-none">
            Chat-BI
          </div>
          <div className="flex flex-col space-y-2 max-w-sm md:max-w-2xl items-start">
            <div className="whitespace-pre-wrap px-4 py-2 rounded-lg inline-block rounded-bl-none rounded-tl-none bg-gray-200 text-gray-600">
              {answer}
            </div>
          </div>
        </div>
        <div
          style={{ display: showFeedbackText ? "" : "none" }}
          className="flex flex-col items-start m-4"
        >
          <div className="text-sm rounded-lg bg-blue-600 text-white px-4 rounded-bl-none">
            Chat-BI
          </div>
          <div className="flex flex-col space-y-2 max-w-sm md:max-w-2xl items-start">
            <div className="whitespace-pre-wrap px-4 py-2 rounded-lg inline-block rounded-bl-none rounded-tl-none bg-gray-200 text-gray-600">
              How did I fare?
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFeedbackForm(true)}
            className="text-white bg-gradient-to-br from-green-400 to-blue-600 focus:ring-4 focus:outline-none focus:ring-green-200 rounded-lg px-4 py-2 rounded-tl-none text-center"
          >
            Feedback
          </button>
        </div>
      </div>
      <form
        className="sticky bottom-0 flex items-center py-2 px-3 bg-gray-100"
        onSubmit={handleSubmit(submitQuestion)}
      >
        <textarea
          rows="1"
          type="text"
          name="question"
          className="block mx-4 p-2.5 w-full text-xl text-gray-900 bg-white rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ask away!"
          onKeyDown={handleKeypress}
          {...register("question", {
            required: true,
            minLength: 3,
          })}
        ></textarea>
        <button
          type="submit"
          className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100"
        >
          <svg
            className="w-6 h-6 rotate-90"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </button>
      </form>
      <FeedbackForm
        toggle={setShowFeedbackForm}
        display={showFeedbackForm}
        submitted={feedbackSubmitted}
        toggleSubmitted={setFeedbackSubmitted}
        data={{ question: question, answer: answer }}
      />
    </div>
  );
}

export default App;
