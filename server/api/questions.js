import mammoth from 'mammoth';
import { resolve } from 'path';
import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

export default defineEventHandler(async (event) => {
  const jsonFilePath = resolve('static/data/questions.json');

  try {
    await stat(jsonFilePath);
    const jsonData = await readFile(jsonFilePath, 'utf8');
    const questions = JSON.parse(jsonData);

    if (Array.isArray(questions) && questions.length > 0) {
      return {
        questions,
      };
    } else {
      console.log('questions.json is empty, generating from questions.docx');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('questions.json not found, generating from questions.docx');
    } else {
      console.error('Error checking questions.json:', error);
      return {
        error: "An unexpected error occurred.",
        details: error.message,
      };
    }
  }

  try {
    const docxFilePath = resolve('static/data/questions.docx');
    console.log('Reading DOCX file from:', docxFilePath);

    const fileBuffer = await readFile(docxFilePath);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    
    const rawText = result.value;
    console.log('Extracted raw text:', rawText);
    const questions = await parseQuestions(rawText);

    await writeQuestionsFile(questions);
    return {
      questions,
    };
  } catch (docxError) {
    console.error('Error processing DOCX file:', docxError);
    return {
      error: "Failed to process DOCX file.",
      details: docxError.message,
    };
  }
});

async function parseQuestions(text) {
  let questions = [];
  const paragraphs = text.split(";");

  for (const paragraph of paragraphs) {
    const [answer, question] = paragraph.split("&&");
    if (question) {
      const questionObj = transformToQuestionObject(question.trim());
      questionObj.answer = answer ? answer.trim() : null;
      questions.push(questionObj);
    }
  }

  return questions;
}

async function writeQuestionsFile(data) {
  const dir = path.join('static/data');

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'questions.json'), JSON.stringify(data, null, 2), 'utf8');
    console.log('JSON file has been saved.');
  } catch (err) {
    console.error('An error occurred while writing JSON to file:', err);
  }
}

function transformToQuestionObject(text) {
  const lines = text.trim().split('\n');
  const choiceLetters = ['A', 'B', 'C', 'D'];
  const choiceStartIndex = lines.findIndex(line => {
    const trimmedLine = line.trim();
    return choiceLetters.some(letter => trimmedLine.startsWith(`${letter}.`));
  });

  const question = lines.slice(0, choiceStartIndex).join(' ').trim();
  const choices = {};
  lines.slice(choiceStartIndex).forEach(line => {
    const [key, value] = line.split('.');
    if (choiceLetters.includes(key.trim())) {
      choices[key.trim()] = value.trim();
    }
  });

  return {
    question,
    choices
  };
}
