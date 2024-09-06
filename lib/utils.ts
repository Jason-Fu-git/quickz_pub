import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function judge(
  qType: 'choice' | 'judge' | 'short answer',
  standard: string,
  answer: string
) {
  if (qType === 'choice') {
    // sort the answer and the standard answer
    standard = standard.split('').sort().join('');
    answer = answer.split('').sort().join('');
  }
  return standard === answer;
}

export interface Question {
  question: string;
  qtype: 'choice' | 'judge' | 'short answer';
  answer: string;
  explanation: string;
}

/**
 * Split the text into questions
 * The question must be organized in the following format:
 *
 * Line 1: Question Type (choice, judge, short answer)
 * Line 2: Empty
 * Line 3~x: Question
 * Line x+1: Empty
 * Line (x+2)~y: Answer
 * Line y+1: Empty
 * Line (y+2)~z: Explanation
 * Line z+1: Empty
 * Line z+2: Empty
 */
export function splitQuestions(text: string) {
  // split the text into lines
  const lines = text.split('\n');
  const questions: Question[] = [];
  let i = 0;
  while (i < lines.length) {
    if (
      lines[i] != 'choice' &&
      lines[i] != 'judge' &&
      lines[i] != 'short answer'
    ) {
      throw new Error(`At line ${i} ${lines[i]}: Question Type expected`);
    }
    const qtype = lines[i] as 'choice' | 'judge' | 'short answer';
    ++i;
    if (i >= lines.length || lines[i] != '') {
      throw new Error(`At line ${i}: Empty line expected `);
    }
    ++i;
    let j = i;
    while (j < lines.length && lines[j] != '') {
      ++j;
    }
    if (i == j) {
      throw new Error(`At line ${i}: Question expected`);
    }
    const question = lines.slice(i, j).join('\n');
    i = j;
    if (i >= lines.length || lines[i] != '') {
      throw new Error(`At line ${i}: Empty line expected`);
    }
    ++i;
    j = i;
    while (j < lines.length && lines[j] != '') {
      ++j;
    }
    if (i == j) {
      throw new Error(`At line ${i}: Answer expected`);
    }
    const answer = lines.slice(i, j).join('\n');
    // check answer format
    if (qtype === 'choice') {
      if (answer.split('').some((c) => c < 'A' || c > 'Z')) {
        throw new Error(`At line ${i}: Choice answer must be uppercase A~Z.`);
      }
    } else if (qtype === 'judge') {
      if (answer != 'A' && answer != 'B') {
        throw new Error(`At line ${i}: Judge answer must be A or B.`);
      }
    }
    i = j;
    if (i >= lines.length || lines[i] != '') {
      throw new Error(`At line ${i}: Empty line expected`);
    }
    ++i;
    j = i;
    while (j < lines.length && lines[j] != '') {
      ++j;
    }
    if (i == j) {
      throw new Error(`At line ${i}: Explanation expected`);
    }
    const explanation = lines.slice(i, j).join('\n');
    i = j;
    if (i >= lines.length || lines[i] != '') {
      throw new Error(`At line ${i}: Empty line expected`);
    }
    ++i;
    if (i < lines.length && lines[i] != '') {
      throw new Error(`At line ${i}: Empty line expected`);
    }
    ++i;
    questions.push({ question, qtype, answer, explanation });
  }
  return questions;
}

// truncate the text to the specified length
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}
