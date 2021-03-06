// constants to identify field names
export const survey_name = "survey_name";
export const question = "question";
export const choice = "choice";

// the length of input of survey fields
export const len = {
  name: {
    min: 3,
    max: 50,
  },
  question: {
    min: 1,
    max: 1000,
  },
  choice: {
    min: 1,
    max: 200,
  },
};
