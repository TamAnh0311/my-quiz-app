<template>
  <v-container fluid>
    <h1>Questions</h1>

    <div v-if="questions.length">
      <div
        v-for="(question, index) in questions"
        :key="index"
        class="mt-5"
        :ref="'question_' + index"
      >
        <p class="question-description">
          <strong>Question {{ index + 1 }}:</strong> {{ question.question }}
        </p>

        <div class="mt-4">
          <v-checkbox
            style="margin-top: 5px"
            hide-details
            v-for="(choice, letter) in question.choices"
            :key="letter"
            :value="letter"
            :label="letter + ': ' + choice"
            v-model="question.selectedChoices"
            class="answer"
            :class="{
              'correct-answer': isCorrectAnswer(question, letter),
              'correct-answer-reveal': revealAnswer(question, letter),
              'wrong-answer': isWrongAnswer(question, letter),
            }"
          ></v-checkbox>

          <div class="mt-5 d-flex justify-center align-center">
            <v-btn size="large" @click="checkAnswer(index)">Submit</v-btn>
            <v-btn
              class="ml-5"
              color="primary"
              size="large"
              @click="scrollToNext(index)"
            >
              <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
          </div>
        </div>
        <v-divider class="mt-5" :thickness="4"></v-divider>
      </div>
    </div>

    <div v-else>
      <p>Loading questions...</p>
    </div>

    <div class="floating-btn d-flex justify-space-between" :class="alignClass">
      <div class="d-flex flex-column align-center quiz-controls">
        <div class="quiz-tracker" v-if="isTracking">
          <p><strong>Time:</strong> {{ formatTime(timer) }}</p>
          <p>
            <strong>Question:</strong> {{ currentQuestionIndex + 1 }} /
            {{ questions.length }}
          </p>
        </div>

        <v-btn
          color="primary"
          size="large"
          round
          @click="toggleQuiz"
          class="mt-2"
        >
          {{ isTracking ? "Stop Tracking" : "Start Tracking" }}
        </v-btn>
      </div>

      <div class="d-flex">
        <v-btn
          color="primary"
          size="large"
          round
          @click="scrollToTop"
          class="ml-3"
        >
          <v-icon>mdi-arrow-up</v-icon>
        </v-btn>

        <v-btn
          color="secondary"
          round
          size="large"
          class="ml-3"
          @click="reloadPage"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      questions: [],
      isTracking: false,
      timer: 0,
      currentQuestionIndex: 0,
      intervalId: null,
      windowWidth: window.innerWidth, // Initialize the width
    };
  },
  async mounted() {
    const response = await $fetch("/api/questions");
    this.questions = this.shuffleArray(response.questions) || [];

    this.questions.forEach((question) => {
      question.selectedChoices = [];
    });

    window.addEventListener("resize", this.handleResize); // Add resize listener
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize); // Cleanup listener
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth; // Update the width
    },
    toggleQuiz() {
      if (this.isTracking) {
        this.stopQuiz();
      } else {
        this.startQuiz();
      }
    },

    startQuiz() {
      this.isTracking = true;
      this.startTimer();
    },

    stopQuiz() {
      this.isTracking = false;
      this.stopTimer();
      this.resetQuiz();
    },

    startTimer() {
      this.intervalId = setInterval(() => {
        this.timer++;
      }, 1000);
    },

    stopTimer() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },

    resetQuiz() {
      this.timer = 0;
      this.currentQuestionIndex = 0;
      this.questions.forEach((question) => {
        question.isAnswered = false;
        question.selectedChoices = [];
      });
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${
        remainingSeconds < 10 ? "0" : ""
      }${remainingSeconds}`;
    },

    checkAnswer(index) {
      this.questions[index].isAnswered = true;
    },

    isCorrectAnswer(question, letter) {
      return (
        question.isAnswered &&
        question.selectedChoices.includes(letter) &&
        question.answer.includes(letter)
      );
    },

    revealAnswer(question, letter) {
      return question.isAnswered && question.answer.includes(letter);
    },

    isWrongAnswer(question, letter) {
      return (
        question.isAnswered &&
        question.selectedChoices.includes(letter) &&
        !question.answer.includes(letter)
      );
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    reloadPage() {
      window.location.reload();
    },

    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },

    scrollToNext(index) {
      if (index + 1 < this.questions.length) {
        this.currentQuestionIndex++;
        const nextQuestion = this.$refs["question_" + (index + 1)];
        if (nextQuestion) {
          nextQuestion[0].scrollIntoView({ behavior: "smooth" });
        }
      } else {
        this.stopQuiz();
      }
    },
  },
  computed: {
    alignClass() {
      return {
        "align-center": this.windowWidth > 600,
        "align-end": this.windowWidth <= 600,
      };
    },
  },
};
</script>

<style scoped>
.question-description {
  background: #80808026;
  padding: 10px;
  border-radius: 5px;
}

.answer {
  border-radius: 5px;
}
.correct-answer {
  background-color: #b9f0c0;
}

.correct-answer-reveal {
  border: 2px solid #61b96c;
}

.wrong-answer {
  background-color: #f2c3c3;
}

.floating-btn {
  position: fixed;
  bottom: 20px;
  right: 0;
  left: 0;
  z-index: 999;
}

.quiz-tracker {
  background-color: #6c6a6ac7;
  color: #ffffff;
  padding: 5px;
  margin-bottom: 10px; /* Adds space between the tracker and the button */
}
</style>
