import { QuizQuestion } from "@/app/api/quiz/api";

export const dummyQuiz: QuizQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "Which of the following is NOT a common activation function used in neural networks?",
    options: ["ReLU (Rectified Linear Unit)", "Sigmoid", "Quantum Activation Function", "Tanh"],
    correctAnswer: 2,
    explanation: "Quantum Activation Function is not an actual activation function used in neural networks. The common ones are ReLU, Sigmoid, Tanh, Leaky ReLU, and others."
  },
  {
    id: 2,
    type: "true_false",
    question: "Convolutional Neural Networks (CNNs) are primarily used for processing sequential data like text.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. CNNs are primarily used for processing grid-like data such as images. For sequential data like text, RNNs or Transformers are more commonly used."
  },
  {
    id: 3,
    type: "mcq",
    question: "Which of these is a technique to prevent overfitting in neural networks?",
    options: ["Increasing model complexity", "Dropout", "Using smaller training datasets", "Removing all hidden layers"],
    correctAnswer: 1,
    explanation: "Dropout is a regularization technique that prevents overfitting by randomly deactivating neurons during training."
  },
  {
    id: 4,
    type: "mcq",
    question: "What is the purpose of the softmax function in neural networks?",
    options: ["To introduce non-linearity", "To normalize input data", "To convert outputs to probabilities that sum to 1", "To speed up training"],
    correctAnswer: 2,
    explanation: "The softmax function is used to convert the network's output into a probability distribution, ensuring all values are between 0 and 1 and sum to 1."
  },
  {
    id: 5,
    type: "true/false",
    question: "A higher learning rate always leads to better model performance.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation: "False. A higher learning rate may cause the model to converge too quickly to a suboptimal solution or even diverge. The optimal learning rate depends on the specific problem."
  }
];