const functions = require("firebase-functions");
const axios = require("axios");
const {Configuration, OpenAIApi} = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const {get_encoding, encoding_for_model} = require("@dqbd/tiktoken");
const enc = encoding_for_model("text-embedding-ada-002");

const pineconeUrl = `https://${process.env.PINECONE_INDEX_NAME}-${process.env.PINECONE_PROJECT_ID}.svc.${process.env.PINECONE_ENVIRONMENT}.pinecone.io`;

const limit = 3500; // ChatGPT 3.5 has a 4096 token limit, leaving ~500 tokens -> 350 words to answer
const roleText = "You are a helpful assistant that will use the given contextual information below to help answer questions as factually as possible";
const preamble = "Please answer the question below with the given context. If possible, quote any clauses where information referenced, and indicate how certain you are in your answer based on the information provided";
const question = "What safety features should I consider for lifting appliances and lifting machines?";

exports.submitQuestion = functions.https.onCall((data, context) => {
  const question = data.question?? "nothing!";
  console.log("Log is working!");

  return openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: question,
  }).then((emb) => {
    // emb.data.data[0].embedding;
    return axios.post(
        `${pineconeUrl}/query`,
        {
          "includeValues": "false",
          "includeMetadata": "true",
          "vector": emb.data.data[0].embedding,
          "topK": 15,
        },
        {
          headers: {
            "Api-Key": process.env.PINECONE_API_KEY,
            "accept": "application/json",
            "content-type": "application/json",
          },
        },
    );
  }).then((response) => {
    const answers = [];
    const sources = [];
    let contexts = "";
    for (const entry of response.data.matches) {
      answers.push(entry.metadata.text);
      sources.push(entry.metadata.doc);
    }

    let tokenCount = 0;
    tokenCount += enc.encode(roleText + preamble + question).length;
    let i = 0;
    while (tokenCount < limit) {
      const contextText = `Text snippet from ${sources[i]}:\n ${answers[i]}\n\n`;
      const encodedContextText = enc.encode(contextText);

      if (tokenCount + encodedContextText.length < limit) {
        tokenCount += encodedContextText.length;
        contexts += contextText;
      } else {
        contexts += new TextDecoder().decode(enc.decode(encodedContextText.slice(0, limit - tokenCount)));
        tokenCount += encodedContextText.slice(0, limit - tokenCount).length;
      }

      i += 1;
      if (i >= answers.length) {
        break;
      }
    }

    const message = [
      {
        "role": "system",
        "content": roleText,
      },
      {
        "role": "user",
        "content": `${preamble}\n Q: ${question}\n\n ${contexts}`,
      },
    ];
    return message;
  }).then((mes) => {
    return openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.2,
      messages: mes,
    });
  }).then((res) => {
    console.log(res.data.choices[0].message.content);
    return res.data.choices[0].message.content;
  });
});


