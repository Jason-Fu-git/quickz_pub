'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { judge } from '@/lib/utils';
import { useTranslation } from '@/i18n/client';

export interface ItemProps {
  index: number;
  question: string;
  qType: 'choice' | 'judge' | 'short answer' | 'deleted';
  rightAnswer: string | null;
  explanation: string;
  answer: string;
  lng: string;
}

// split option text into an array
function splitOptions(optionsText: string) {
  const optionPattern = /(?:[A-Z][:：.、])\s*([\s\S]*?)(?=[A-Z][:：.、]|$)/g;
  const options = [];
  let match;

  while ((match = optionPattern.exec(optionsText)) !== null) {
    const option = match[1].trim();
    //@ts-ignore
    options.push(option);
  }

  return options;
}

function ChoiceItem({
  index,
  question,
  qType,
  rightAnswer,
  explanation,
  answer,
  lng
}: ItemProps) {
  const { t } = useTranslation(lng);

  // split question and options
  const pattern = /([A-Z][.、:：])[\s\S]*/g;
  const match = pattern.exec(question);

  const optionLetters = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ];

  let optionSelectedColor = 'bg-black';
  if (rightAnswer !== null) {
    if (judge('choice', rightAnswer, answer)) {
      optionSelectedColor = 'bg-green-600';
    } else {
      optionSelectedColor = 'bg-red-600';
    }
  }

  // if has answer, map answer to index
  let selectedIdxes: number[] = [];
  if (answer !== '') {
    selectedIdxes = answer
      .split('')
      .map((letter: string) => optionLetters.indexOf(letter));
  }

  // if match, split question and options
  if (match) {
    const ques = question.slice(0, match.index).trim();
    const optionText = question.slice(match.index).trim();
    const options = splitOptions(optionText);

    return (
      <div className="space-y-4">
        {/* Question */}
        <p className={`text-sm text-gray-700 whitespace-pre-wrap`}>
          <span className="font-semibold text-lg">{index}. </span>
          {ques}
        </p>
        {/* Options */}
        {options.map((option, i) => (
          <label
            className="flex items-center"
            key={`question-${index}-${optionLetters[i]}`}
          >
            {/* Option i */}
            <input
              name={`question-${index}-${optionLetters[i]}`}
              type="checkbox"
              disabled={rightAnswer !== null}
              className="hidden peer" // hide default checkbox
              aria-selected={selectedIdxes.includes(i)}
            />
            <span
              className={`flex items-center justify-center w-6 h-6 min-w-6 
            border border-gray-400 rounded-full 
            peer-checked:text-white text-black text-md
            ${selectedIdxes.includes(i) ? 'text-white' : 'text-black'}
            ${selectedIdxes.includes(i) ? optionSelectedColor : 'peer-checked:bg-black'}`}
            >
              {optionLetters[i]}
            </span>
            <p className="ml-4 text-sm text-gray-800 whitespace-pre-wrap">
              {option}
            </p>
          </label>
        ))}
        {/* Right answer */}
        {rightAnswer !== null && (
          <p className="text-sm text-gray-500 whitespace-pre-wrap">
            <span className="text-md text-gray-600">{t('Right answer: ')}</span>
            {rightAnswer}
          </p>
        )}
        {/* Explanation */}
        {rightAnswer !== null && (
          <p className="text-sm text-gray-500 whitespace-pre-wrap">
            <span className="text-md text-gray-600">{t('Explanation: ')}</span>
            {explanation}
          </p>
        )}
        <Separator />
      </div>
    );
  } else {
    return (
      <div className="space-y-4">
        {/* Question */}
        <p className={`text-sm text-gray-700 whitespace-pre-wrap`}>
          <span className="font-semibold text-lg">{index}. </span>
          {question}
        </p>
        {/* Options */}
        {optionLetters.map((letter, i) => (
          <label
            className="flex items-center"
            key={`question-${index}-${letter}`}
          >
            {/* Option i */}
            <input
              name={`question-${index}-${letter}`}
              type="checkbox"
              disabled={rightAnswer !== null}
              className="hidden peer" // hide default checkbox
            />
            <span
              className={`flex items-center justify-center w-6 h-6 min-w-6
            border border-gray-400 rounded-full
            peer-checked:text-white text-black text-md
            ${selectedIdxes.includes(i) ? 'text-white' : 'text-black'}
            ${selectedIdxes.includes(i) ? optionSelectedColor : 'peer-checked:bg-black'}
            `}
            >
              {letter}
            </span>
          </label>
        ))}
        {/* Right answer */}
        {rightAnswer !== null && (
          <p className="text-sm text-gray-500 whitespace-pre-wrap">
            <span className="text-md text-gray-600">{t('Right answer: ')}</span>
            {rightAnswer}
          </p>
        )}
        {/* Explanation */}
        {rightAnswer !== null && (
          <p className="text-sm text-gray-500 whitespace-pre-wrap">
            <span className="text-md text-gray-600">{t('Explanation: ')}</span>
            {explanation}
          </p>
        )}
        <Separator />
      </div>
    );
  }
}

function JudgeItem({
  index,
  question,
  qType,
  rightAnswer,
  explanation,
  answer,
  lng
}: ItemProps) {
  const { t } = useTranslation(lng);

  let optionSelectedColor = 'bg-black';
  if (rightAnswer !== null) {
    if (judge('judge', rightAnswer, answer)) {
      optionSelectedColor = 'bg-green-600';
    } else {
      optionSelectedColor = 'bg-red-600';
    }
  }

  return (
    <div className="space-y-4">
      {/* Question */}
      <p className={`text-sm text-gray-700 whitespace-pre-wrap`}>
        <span className="font-semibold text-lg">{index}. </span>
        {question}
      </p>

      {/* Options */}

      <div className="flex items-center space-x-4">
        {/* Option right */}
        <label className="flex items-center">
          <input
            key={`question-${index}-A`}
            name={`question-${index}-A`}
            type="checkbox"
            disabled={rightAnswer !== null}
            className="hidden peer" // hide default checkbox
          />
          <span
            className={`flex items-center justify-center w-6 h-6 min-w-6 border 
          border-gray-400 rounded-full
          peer-checked:text-white text-black text-md
          ${answer === 'A' ? 'text-white' : ''}
          ${answer === 'A' ? optionSelectedColor : 'peer-checked:bg-black'}
          `}
          >
            √
          </span>
        </label>

        {/* Option wrong */}
        <label className="flex items-center">
          <input
            key={`question-${index}-B`}
            name={`question-${index}-B`}
            type="checkbox"
            disabled={rightAnswer !== null}
            className="hidden peer" // hide default checkbox
          />
          <span
            className={`flex items-center justify-center w-6 h-6 min-w-6 
          border border-gray-400 rounded-full
          ${answer === 'B' ? 'text-white' : ''}
          ${answer === 'B' ? optionSelectedColor : 'peer-checked:bg-black'}
          peer-checked:text-white text-black text-md`}
          >
            ×
          </span>
        </label>
      </div>

      {/* Right answer */}
      {rightAnswer !== null && (
        <p className="text-sm text-gray-500 whitespace-pre-wrap">
          <span className="text-md text-gray-600">{t('Right answer: ')}</span>
          {rightAnswer === 'A' ? '√' : '×'}
        </p>
      )}

      {/* Explanation */}
      {explanation !== '' && (
        <p className="text-sm text-gray-500 whitespace-pre-wrap">
          <span className="text-md text-gray-600">{t('Explanation: ')}</span>
          {explanation}
        </p>
      )}

      <Separator />
    </div>
  );
}

function ShortAnswerItem({
  index,
  question,
  qType,
  rightAnswer,
  explanation,
  answer,
  lng
}: ItemProps) {
  const { t } = useTranslation(lng);
  let textColor = 'text-black';
  if (rightAnswer !== null) {
    if (judge('short answer', rightAnswer, answer)) {
      textColor = 'text-green-700 font-semibold';
    } else {
      textColor = 'text-red-700 font-semibold';
    }
  }

  return (
    <div className="space-y-4">
      {/* Question */}
      <p className={`text-sm text-gray-700 whitespace-pre-wrap`}>
        <span className="font-semibold text-lg">{index}. </span>
        {question}
      </p>

      {/* Answer */}
      <Textarea
        name={`question-${index}-TA`}
        disabled={rightAnswer !== null}
        className={`w-full p-2 border border-gray-400 rounded-md ${textColor}`}
        placeholder="Answer"
        defaultValue={answer}
      />

      {/* Right answer */}
      {rightAnswer !== null && (
        <p className="text-sm text-gray-500 whitespace-pre-wrap">
          <span className="text-md text-gray-600">{t('Right answer: ')}</span>
          {rightAnswer}
        </p>
      )}

      {/* Explanation */}
      {explanation !== '' && (
        <p className="text-sm text-gray-500 whitespace-pre-wrap">
          <span className="text-md text-gray-600">{t('Explanation: ')}</span>
          {explanation}
        </p>
      )}

      <Separator />
    </div>
  );
}

// Item component
export function Item({
  index,
  question,
  qType,
  rightAnswer,
  explanation,
  answer,
  lng
}: ItemProps) {
  const { t } = useTranslation(lng);

  if (qType === 'choice') {
    return (
      <ChoiceItem
        index={index}
        question={question}
        qType={qType}
        rightAnswer={rightAnswer}
        explanation={explanation}
        answer={answer}
        lng={lng}
      />
    );
  } else if (qType === 'judge') {
    return (
      <JudgeItem
        index={index}
        question={question}
        qType={qType}
        rightAnswer={rightAnswer}
        explanation={explanation}
        answer={answer}
        lng={lng}
      />
    );
  } else if (qType === 'short answer') {
    return (
      <ShortAnswerItem
        index={index}
        question={question}
        qType={qType}
        rightAnswer={rightAnswer}
        explanation={explanation}
        answer={answer}
        lng={lng}
      />
    );
  } else if (qType === 'deleted') {
    return (
      <div className="space-y-4">
        {/* Question */}
        <p className={`text-sm text-red-700 whitespace-pre-wrap`}>
          <span className="font-semibold text-lg">{index}. </span>
          {t('This question has been deleted.')}
        </p>

        <Separator />
      </div>
    );
  }
  return (
    <div>
      <Label>
        {t('Error while loading question')} {index}
        {t('. Please contact the admin.')}
      </Label>
    </div>
  );
}
