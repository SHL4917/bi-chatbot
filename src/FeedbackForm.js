import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
import app from "./config/FirebaseConfig";

const db = getFirestore(app);
//className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
const FeedbackForm = (props) => {
  const [sliderValue, setSliderValue] = useState(5);
  const closeWindow = () => {
    props.toggle(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    unregister,
  } = useForm();

  const submitFeedback = (formData) => {
    if (props.submitted) {return}

    reset();
    const docRef = addDoc(collection(db, "feedbacks"), {
      answer: props.data.answer,
      question: props.data.question,
      helpful: formData.helpful,
      feedback: formData.feedback,
      submitTime: serverTimestamp(),
    })
      .then(() => {
        props.toggleSubmitted(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const displaySliderValue = (e) => {
    setSliderValue(e.target.value);
  };
  return (
    <div
      style={{ display: props.display ? "" : "none" }}
      className="fixed bg-gray-100 top-0 left-0 w-screen h-screen bg-gray-300 bg-opacity-50 z-40 flex flex-col items-center justify-center"
    >
      <div className="p-4 bg-white rounded-lg shadow sm:p-">
        <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5">
          <h3 className="text-lg text-gray-900">Feedback</h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={closeWindow}
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit(submitFeedback)}>
          <div className="grid gap-4 mb-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-gray-900">
                On a scale of 0 to 10, how helpful was the answer?
              </label>
              <div className="flex flex-row">
                <div className="mx-2">0</div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  className="range accent-blue-600"
                  onInput={displaySliderValue}
                  {...register("helpful", {
                    required: true,
                  })}
                ></input>
                <div className="mx-2">10</div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-2 text-gray-900">
                Other Feedback:
              </label>
              <textarea
                rows="4"
                className="block p-2.5 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Any feedback or suggestion is greatly appreciated!"
                {...register("feedback")}
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            className="text-white inline-flex items-center bg-blue-600 hover:bg-blue-500 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg px-4 py-2 text-center"
          >
            Submit Feedback
          </button>
          <div style={{ display: props.submitted ? "" : "none" }} className="my-2">
            Feedback submitted, thank you!
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
