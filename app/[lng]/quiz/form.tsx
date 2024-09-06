'use client';

import { Item, ItemProps } from './item';
import { Separator } from '@/components/ui/separator';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import ProcessingDialog from '@/components/processingDialog';
import { answerSheets, SelectQuestion } from '@/lib/db';
import { ScoreChart } from './scoreChart';
import { useTranslation } from '@/i18n/client';

export interface AnswerSheetFormProps {
  items: ItemProps[];
  answerSheetId: number;
  answerSheetScore: number;
  lng: string;
}

export function AnswerSheetForm({
  items,
  answerSheetId,
  answerSheetScore,
  lng
}: AnswerSheetFormProps) {
  const {t} = useTranslation(lng);

  // alert dialog
  const [alertTitle, setAlertTitle] = useState(t('Notice'));
  const [alertMessage, setAlertMessage] = useState(
    t('Please fill in all the required fields')
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // result
  const [score, setScore] = useState(answerSheetScore);
  const [time, setTime] = useState<Date>(new Date());
  const [qItems, setQItems] = useState<ItemProps[]>(items);

  // on submit
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      // extract the answers
      const answers = Object.entries(data).map(([key, value]) => {
        return { question: key, answer: value };
      });
      // iterate through the answers
      let answersToSubmit = items.map((item) => {
        return '';
      });
      answers.forEach((v) => {
        const key = v.question;
        const value = v.answer;
        // split the question number
        const tmp = key.split('-');
        const questionNumber = parseInt(tmp[1], 10) - 1;
        // assign the answer
        let answer = tmp[2];
        if (answer === 'TA') {
          answer = value.toString();
        }
        // append the answer
        answersToSubmit[questionNumber] += answer;
      });
      // check if all questions are answered
      let allAnswered = true;
      answersToSubmit.forEach((v) => {
        if (v === '') {
          allAnswered = false;
        }
      });
      // if not all questions are answered, show alert
      if (!allAnswered) {
        setAlertTitle(t('Notice'));
        setAlertMessage(t('Please fill in all the required fields'));
        setIsProcessing(false);
        setAlertVisible(true);
        return;
      }
      setAlertTitle(t('Processing...'));
      setAlertMessage(t('Please wait while we submit your answers'));
      setIsProcessing(true);
      setAlertVisible(true);
      // submit the answers
      const answersString = answersToSubmit.join(',');
      const response = await fetch('/api/answerSheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answerSheetId: answerSheetId,
          answers: answersString
        })
      });
      if (response.ok) {
        setAlertTitle(t('Success'));
        setAlertMessage(t('Your answers have been submitted'));
        setAlertVisible(true);
        // if the user is a guest, display the result
        const result = await response.json();
        setScore(result.score);
        setTime(new Date());
        setQItems(
          result.questions.map((q: SelectQuestion, idx: number) => {
            return {
              index: idx + 1,
              question: q.question,
              qType: q.qtype,
              rightAnswer: q.answer,
              explanation: q.explanation,
              answer: answersToSubmit[idx]
            };
          })
        );
      } else {
        throw new Error('Failed to submit the answers');
      }
    } catch (error) {
      setAlertTitle(t('Error'));
      setAlertMessage(t('Failed to submit the answers'));
      setAlertVisible(true);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <>
      {score >= 0 && <ScoreChart score={score} time={time} />}
      <form className="pl-5 pr-5 space-y-6" onSubmit={onSubmit}>
        {/* Questions */}
        {qItems.map((question) => (
          <Item {...question} key={question.index} lng={lng}/>
        ))}

        {score < 0 && (
          <CardFooter className="mt-5">
            <Button type="submit" className="w-full">
              {t('Submit')}
            </Button>
          </CardFooter>
        )}
      </form>

      <ProcessingDialog
        title={alertTitle}
        message={alertMessage}
        isOpen={alertVisible}
        setIsOpen={setAlertVisible}
        isProcessing={isProcessing}
        confirmTXT={t('Confirm')}
      />
    </>
  );
}
