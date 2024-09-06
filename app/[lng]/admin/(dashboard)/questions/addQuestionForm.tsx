'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { event } from 'next/dist/build/output/log';
import { useTranslation } from '@/i18n/client';

// === add question form schema ===
export const generateSchema = (lng: string) => {
  const { t } = useTranslation(lng);
  return z
    .object({
      question: z
        .string()
        .min(1, t('Question must be at least 1 characters long')),
      qtype: z.enum(['choice', 'judge', 'short answer']),
      answer: z.string().min(1, t('Answer must be at least 1 characters long')),
      explanation: z
        .string()
        .min(1, t('Explanation must be at least 1 characters long'))
    })
    .superRefine((data, ctx) => {
      // refine the schema by question type
      if (data.qtype === 'choice') {
        // use regex to check whether the answer should only contain A, B, C, D
        if (!/^[A-Z]+$/.test(data.answer)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answer'],
            message: t('Choice answer must only contain A, B, C, D')
          });
        }

        // check whether the choices the question contains are in the format of A. B. C. D.
        // and whether the number of choices is proper
        const choiceRegex = /([A-Z])[.、:：]/g;
        const choicesInQuestion = [
          ...Array.from(data.question.toString().matchAll(choiceRegex))
        ];
        const choiceLabels = choicesInQuestion.map((choice) => choice[1]);

        let minChoiceNum = 1;
        if (data.answer.includes('B')) minChoiceNum = 2;
        if (data.answer.includes('C')) minChoiceNum = 3;
        if (data.answer.includes('D')) minChoiceNum = 4;
        if (data.answer.includes('E')) minChoiceNum = 5;
        if (data.answer.includes('F')) minChoiceNum = 6;
        if (data.answer.includes('G')) minChoiceNum = 7
        if (data.answer.includes('H')) minChoiceNum = 8;
        if (data.answer.includes('I')) minChoiceNum = 9;
        if (data.answer.includes('J')) minChoiceNum = 10;
        if (data.answer.includes('K')) minChoiceNum = 11;
        if (data.answer.includes('L')) minChoiceNum = 12;
        if (data.answer.includes('M')) minChoiceNum = 13;
        if (data.answer.includes('N')) minChoiceNum = 14;
        if (data.answer.includes('O')) minChoiceNum = 15;
        if (data.answer.includes('P')) minChoiceNum = 16;
        if (data.answer.includes('Q')) minChoiceNum = 17;
        if (data.answer.includes('R')) minChoiceNum = 18;
        if (data.answer.includes('S')) minChoiceNum = 19;
        if (data.answer.includes('T')) minChoiceNum = 20;
        if (data.answer.includes('U')) minChoiceNum = 21;
        if (data.answer.includes('V')) minChoiceNum = 22;
        if (data.answer.includes('W')) minChoiceNum = 23;
        if (data.answer.includes('X')) minChoiceNum = 24;
        if (data.answer.includes('Y')) minChoiceNum = 25;
        if (data.answer.includes('Z')) minChoiceNum = 26;

        // check whether the choices are unique
        const uniqueChoices = new Set(choiceLabels);

        if (uniqueChoices.size < choiceLabels.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['question'],
            message: t(`Choice question must contain unique choices.`)
          });
        } else {
          if (uniqueChoices.size < minChoiceNum) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['question'],
              message: `${t("Choice question must contain at least")} ${minChoiceNum} ${t("choices")}.
          ${t('Choices should be in the format of A. B. C. D.')}`
            });
          }
        }
      } else if (data.qtype === 'judge') {
        // check whether the answer is A or B
        if (!['A', 'B'].includes(data.answer)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answer'],
            message: t('Judge question answer must be A or B')
          });
        }
        // check whether the question contains A. and B.
        if (
          /A[.、:：]/.test(data.question) ||
          /B[.、:：]/.test(data.question)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['question'],
            message: t('Judge question should not contain labels A. and B.')
          });
        }
      }
    });
};

// === end of add question form schema ===

export interface AddQuestionFormProps {
  onSubmit: SubmitHandler<any>;
  form: UseFormReturn<
    {
      question: string;
      qtype: 'choice' | 'judge' | 'short answer';
      answer: string;
      explanation: string;
    },
    any,
    undefined
  >;
  lng: string;
}

export function AddQuestionForm(props: AddQuestionFormProps) {
  const { onSubmit, form, lng } = props;
  const [isJudge, setIsJudge] = useState(
    form.formState.defaultValues?.qtype === 'judge'
  );
  const { t } = useTranslation(lng);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Question')}</FormLabel>
              <FormControl>
                <Textarea placeholder="Question" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="qtype"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Question Type')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(event) => {
                    if (event === 'judge') {
                      setIsJudge(true);
                    } else {
                      setIsJudge(false);
                    }
                    return field.onChange(event);
                  }}
                  defaultValue={field.value}
                  className="flex items-center space-x-2"
                >
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="choice" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('Choice')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="judge" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('Judge')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="short answer" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('Short answer')}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Answer')}</FormLabel>
              <FormControl>
                {isJudge ? (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-2"
                  >
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="A" />
                      </FormControl>
                      <FormLabel className="font-normal">√</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="B" />
                      </FormControl>
                      <FormLabel className="font-normal">×</FormLabel>
                    </FormItem>
                  </RadioGroup>
                ) : (
                  <Input placeholder="A" {...field} />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Explanation')}</FormLabel>
              <FormControl>
                <Textarea placeholder="Explanation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Submit Button */}
        <Button type="submit" className="w-full">
          {t('Submit')}
        </Button>
      </form>
    </Form>
  );
}
