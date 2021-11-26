import { generateTrial, validateTrial } from "./trials_data.js";

const CONF = {
  num_rounds: 5,
}

let iteration = 0;
let trial = null;

window.liveSend = function (message) {
  const type = message.type;

  switch (type) {
    case "start":
      iteration = 0;
      window.liveRecv({
        type: 'status',
        iteration: 0,
        progress: {
          total: CONF.num_rounds,
          current: 0,
          completed: 0,
          skipped: 0,
          solved: 0,
          failed: 0,
        }
      })

    case "load":
      iteration++;
      trial = generateTrial(iteration);
      window.liveRecv({
        type: "trial",
        ...trial,
      });
      break;

    case "response":
      trial.response = message.response;
      trial.reaction = message.reaction;
      trial.feedback = validateTrial(trial);
      window.liveRecv({
        type: "feedback",
        feedback: trial.feedback,
      });

      window.liveRecv({
        type: "status",
        completed: trial.feedback !== undefined,
        success: trial.feedback,
        terminate: iteration >= CONF.num_rounds
      });
      break;
  }
};
