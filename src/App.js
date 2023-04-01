import React from "react";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {useForm} from 'react-hook-form'
import { useState } from "react";

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

if (hostname === 'localhost') {
  connectFunctionsEmulator(functions, 'localhost', 5001)
}

function App() {
  const [answer, setAnswer] = useState("")
  const submitQuestion = (formData) => {
    const submitQ = httpsCallable(functions, 'submitQuestion');
    submitQ({question: formData.question}).then((result) =>{
      // TODO some error handling
      console.log(result)
      setAnswer(result.data)
    })
  }

  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm();

  return (
    <div>
      <div>Hello!</div>
      <form onSubmit={handleSubmit(submitQuestion)}>
        <div>
          <label>Question</label>
          <input type="text" name="question" {...register("question")} />
        </div>
        <div>
          <label></label>
          <button type="submit">Login</button>
        </div>
      </form>
      <div>{answer}</div>
    </div>
  );
}

export default App;
