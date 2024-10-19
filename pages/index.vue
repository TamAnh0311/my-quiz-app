<template>
  <v-container fluid>
    <h1>Questions</h1>
    <div v-if="questions.length" class="">
      <div v-for="(question, index) in questions" :key="index" class="mt-5">
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
            v-model="question.selectedChoice"
            :class="{
              'correct-answer': isCorrectAnswer(question, letter),
              'wrong-answer': isWrongAnswer(question, letter),
            }"
          >
          </v-checkbox>

          <v-btn class="mt-5" block @click="checkAnswer(question)">
            Submit
          </v-btn>
        </div>
        <v-divider class="mt-5" :thickness="4"></v-divider>
      </div>
    </div>

    <div v-else>
      <p>Loading questions...</p>
    </div>

    <div class="floating-btn"> 
      <v-btn
        color="primary"
        size="large"
        round
        @click="scrollToTop"
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

  </v-container>
</template>

<script>
export default {
  data() {
    return {
      questions: [],
      selectedChoices: [],
    };
  },
  async mounted() {
    const response = await $fetch("/api/questions");
    this.questions = response.questions || []; 
  },

  methods: {
    checkAnswer(question) {
      question.isAnswered = true;
    },
    isCorrectAnswer(question, letter) {
      return question.isAnswered && question.answer.includes(letter);
    },
    isWrongAnswer(question, letter) {
      return question.isAnswered && !question.answer.includes(letter);
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    reloadPage() {
      window.location.reload();
    },
  },
};
</script>

<style scoped>
.question-description {
  background: #80808026;
  padding: 10px;
  border-radius: 5%;
}

.correct-answer {
  background-color: #b9f0c0;
}

.wrong-answer {
  background-color: #f2c3c3;
}

.floating-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  margin-left: 10px;
  z-index: 999;
}

.floating-btn:nth-child(2) {
  right: 80px; 
}
</style
