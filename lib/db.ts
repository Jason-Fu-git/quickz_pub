import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from 'drizzle-orm/pg-core';
import { and, count, eq, sql, inArray } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { ITEMS_PER_PAGE } from './constants';
import { desc } from 'drizzle-orm/sql/expressions/select';

const KEY_LENGTH = 16;
const DEFAULT_PASSWORD = '88880000';
const POSTGRES_URL = process.env.POSTGRES_URL!;

export const db = drizzle(neon(POSTGRES_URL));

// ========= users table ===========
const fromEnum = pgEnum('source', ['github', 'password']);
const privilegesEnum = pgEnum('privileges', ['admin', 'user']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  source: fromEnum('source').notNull(),
  privileges: privilegesEnum('privileges').notNull(),
  orgId: integer('orgid').notNull(),
  password: text('password').notNull()
});
export type SelectUser = typeof users.$inferSelect;

// insert user
export async function insertUser(
  username: string,
  password: string,
  orgId: number,
  privileges: 'admin' | 'user',
  source: 'github' | 'password'
) {
  await db.insert(users).values({
    name: username,
    source: source,
    privileges: privileges,
    orgId,
    password
  });
}

// get user by name
export async function getUserByName(
  name: string,
  source: 'github' | 'password'
) {
  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.name, name), eq(users.source, source)))
    .limit(1);
  return user.length > 0 ? user[0] : null;
}

// get user by id
export async function getUserById(id: number) {
  const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user.length > 0 ? user[0] : null;
}

// get user by orgId
export async function getUserByOrgId(
  orgId: number,
  offset: number | null
): Promise<{
  members: SelectUser[];
  newOffset: number | null;
  totalMembers: number;
}> {
  let totalMembers = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.orgId, orgId));

  if (offset === null) {
    let allMembers = await db
      .select()
      .from(users)
      .where(eq(users.orgId, orgId))
      .orderBy(users.id);
    return {
      members: allMembers,
      newOffset: null,
      totalMembers: totalMembers[0].count
    };
  }

  let moreMembers = await db
    .select()
    .from(users)
    .where(eq(users.orgId, orgId))
    .orderBy(users.id)
    .limit(ITEMS_PER_PAGE)
    .offset(offset);
  let newOffset =
    moreMembers.length >= ITEMS_PER_PAGE ? offset + ITEMS_PER_PAGE : null;

  return {
    members: moreMembers,
    newOffset,
    totalMembers: totalMembers[0].count
  };
}

// reset password
export async function resetPassword(id: number) {
  await db
    .update(users)
    .set({ password: DEFAULT_PASSWORD })
    .where(eq(users.id, id));
}

// update password
export async function updatePassword(id: number, password: string) {
  await db
    .update(users)
    .set({ password })
    .where(eq(users.id, id));
}

// delete user by id
export async function deleteUserById(id: number) {
  await db.delete(users).where(eq(users.id, id));
}

// orgs table
export const orgs = pgTable('orgs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  secret: text('secret').notNull()
});

// insert org
export async function insertOrg(name: string) {
  await db.insert(orgs).values({
    name,
    secret: randomBytes(KEY_LENGTH).toString('hex')
  });
}

// get org by name
export async function getOrgByName(name: string) {
  const org = await db.select().from(orgs).where(eq(orgs.name, name)).limit(1);
  return org.length > 0 ? org[0] : null;
}

// get org by id
export async function getOrgById(id: number) {
  const org = await db.select().from(orgs).where(eq(orgs.id, id)).limit(1);
  return org.length > 0 ? org[0] : null;
}

// delete org by id
export async function deleteOrgById(id: number) {
  await db.delete(orgs).where(eq(orgs.id, id));
}

// ==== question table ====

const qtypeEnum = pgEnum('qtype', ['choice', 'judge', 'short answer']);

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(), // for judge question, A is correct, B is wrong
  qtype: qtypeEnum('qtype').notNull(),
  answer: text('answer').notNull(),
  explanation: text('explanation').notNull(),
  orgId: integer('orgid').notNull()
});

export type SelectQuestion = typeof questions.$inferSelect;

// get questions by orgId and offset
export async function getQuestionsByOrgId(
  orgId: number,
  offset: number | null
): Promise<{
  questions: SelectQuestion[];
  newOffset: number | null;
  totalQuestions: number;
}> {
  let totalQuestions = await db
    .select({ count: count() })
    .from(questions)
    .where(eq(questions.orgId, orgId));
  if(offset === null) {
    let allQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.orgId, orgId))
      .orderBy(questions.id);
    return {
      questions: allQuestions,
      newOffset: null,
      totalQuestions: totalQuestions[0].count
    };
  }
  let moreQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.orgId, orgId))
    .orderBy(questions.id)
    .limit(ITEMS_PER_PAGE)
    .offset(offset);
  let newOffset =
    moreQuestions.length >= ITEMS_PER_PAGE ? offset + ITEMS_PER_PAGE : null;

  return {
    questions: moreQuestions,
    newOffset,
    totalQuestions: totalQuestions[0].count
  };
}

// get question by id
export async function getQuestionById(id: number) {
  const question = await db
    .select()
    .from(questions)
    .where(eq(questions.id, id))
    .limit(1);
  return question.length > 0 ? question[0] : null;
}

// insert a question
export async function insertQuestion(
  question: string,
  qtype: 'choice' | 'judge' | 'short answer',
  answer: string,
  explanation: string,
  orgId: number
) {
  await db.insert(questions).values({
    question,
    qtype,
    answer,
    explanation,
    orgId
  });
}

// get question count by orgId
export async function getQuestionCountByOrgId(orgId: number) {
  const totalQuestions = await db
    .select({ count: count() })
    .from(questions)
    .where(eq(questions.orgId, orgId));
  return totalQuestions[0].count;
}

// delete question by id
export async function deleteQuestion(id: number) {
  await db.delete(questions).where(eq(questions.id, id));
}

// edit question by id
export async function editQuestion(
  id: number,
  question: string,
  qtype: 'choice' | 'judge' | 'short answer',
  answer: string,
  explanation: string
) {
  await db
    .update(questions)
    .set({ question, qtype, answer, explanation })
    .where(eq(questions.id, id));
}

// get random questions by orgId and limit
export async function getRandomQuestionsByOrgId(
  orgId: number,
  limit: number
): Promise<SelectQuestion[]> {
  return db
    .select()
    .from(questions)
    .where(eq(questions.orgId, orgId))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}

// get question by id array
export async function getQuestionsByIdArray(
  idArray: number[]
): Promise<SelectQuestion[]> {
  return db.select().from(questions).where(inArray(questions.id, idArray));
}

// ==== quiz table ====

export const quizModeEnum = pgEnum('quiz_mode', ['all random', 'random once']);

export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  orgId: integer('orgid').notNull(),
  questionNum: integer('question_num').notNull(),
  quizMode: quizModeEnum('quiz_mode').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull()
});

export type SelectQuiz = typeof quizzes.$inferSelect;

// insert a quiz
export async function insertQuiz(
  name: string,
  orgId: number,
  questionNum: number,
  quizMode: 'all random' | 'random once',
  startTime: Date,
  endTime: Date
) {
  await db.insert(quizzes).values({
    name,
    orgId,
    questionNum,
    quizMode,
    startTime,
    endTime
  });
}

// get a quiz by name, orgId, startTime and endTime
export async function getQuizByNameOrgIdStartTimeEndTime(
  name: string,
  orgId: number,
  startTime: Date,
  endTime: Date
) {
  const quiz = await db
    .select()
    .from(quizzes)
    .where(
      and(
        eq(quizzes.name, name),
        eq(quizzes.orgId, orgId),
        eq(quizzes.startTime, startTime),
        eq(quizzes.endTime, endTime)
      )
    )
    .limit(1);
  return quiz.length > 0 ? quiz[0] : null;
}

// get a quiz by id
export async function getQuizById(id: number) {
  const quiz = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, id))
    .limit(1);
  return quiz.length > 0 ? quiz[0] : null;
}

// get quizzes by orgId and offset
export async function getQuizzesByOrgId(
  orgId: number,
  offset: number,
  status?: string
): Promise<{
  quizzes: SelectQuiz[];
  newOffset: number | null;
  totalQuizzes: number;
}> {
  // filter string
  let filter = sql`1=1`;
  if (status === 'active') {
    filter = sql`${quizzes.endTime} > NOW() AND ${quizzes.startTime} < NOW()`;
  } else if (status === 'scheduled') {
    filter = sql`${quizzes.startTime} > NOW()`;
  } else if (status === 'closed') {
    filter = sql`${quizzes.endTime} < NOW()`;
  }
  // fetch data
  let totalQuizzes = await db
    .select({ count: count() })
    .from(quizzes)
    .where(and(eq(quizzes.orgId, orgId), filter));
  let moreQuizzes = await db
    .select()
    .from(quizzes)
    .where(and(eq(quizzes.orgId, orgId), filter))
    .orderBy(desc(quizzes.startTime))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);
  let newOffset =
    moreQuizzes.length >= ITEMS_PER_PAGE ? offset + ITEMS_PER_PAGE : null;

  return {
    quizzes: moreQuizzes,
    newOffset,
    totalQuizzes: totalQuizzes[0].count
  };
}

// delete quiz by id
export async function deleteQuiz(id: number) {
  await db.delete(quizzes).where(eq(quizzes.id, id));
}

// delete quizzes by orgId
export async function deleteQuizzesByOrgId(orgId: number) {
  await db.delete(quizzes).where(eq(quizzes.orgId, orgId));
}

// ==== answer sheet table ====

export const answerSheets = pgTable('answer_sheets', {
  id: serial('id').primaryKey(),
  userId: integer('userid').notNull(),
  quizId: integer('quizid').notNull(),
  questions: text('questions').notNull(),
  answers: text('answers').notNull(),
  score: numeric('score').notNull(), // score = -1 means not completed
  completed_at: timestamp('completed_at').notNull()
});

export type SelectAnswerSheet = typeof answerSheets.$inferSelect;

// generate a answer sheet
export async function generateAnswerSheet(
  userId: number,
  quizId: number,
  questions: string,
  answers: string,
  score: string,
  completed_at: Date
) {
  await db.insert(answerSheets).values({
    userId,
    quizId,
    questions,
    answers,
    score,
    completed_at
  });
}

// update answer sheet
export async function updateAnswerSheet(
  answerSheetId: number,
  answers: string,
  score: string,
  completed_at: Date
) {
  await db
    .update(answerSheets)
    .set({ answers, score, completed_at })
    .where(eq(answerSheets.id, answerSheetId));
}

// delete answer sheets by quiz id
export async function deleteAnswerSheetsByQuizId(quizId: number) {
  await db.delete(answerSheets).where(eq(answerSheets.quizId, quizId));
}

// delete answer sheets by user id
export async function deleteAnswerSheetsByUserId(userId: number) {
  await db.delete(answerSheets).where(eq(answerSheets.userId, userId));
}

// get answer sheet by id
export async function getAnswerSheetById(id: number) {
  const answerSheet = await db
    .select()
    .from(answerSheets)
    .where(eq(answerSheets.id, id))
    .limit(1);
  return answerSheet.length > 0 ? answerSheet[0] : null;
}

// get answer sheets by quiz id
export async function getAnswerSheetsByQuizId(quizId: number) {
  return db.select().from(answerSheets).where(eq(answerSheets.quizId, quizId));
}

// get answer sheets by user id
export async function getAnswerSheetsByUserId(userId: number) {
  return db
    .select()
    .from(answerSheets)
    .where(eq(answerSheets.userId, userId))
    .orderBy(desc(answerSheets.completed_at));
}

// get answer sheet by user id and quiz id
export async function getAnswerSheetByUserIdQuizId(
  userId: number,
  quizId: number
) {
  const answerSheet = await db
    .select()
    .from(answerSheets)
    .where(
      and(eq(answerSheets.userId, userId), eq(answerSheets.quizId, quizId))
    )
    .limit(1);
  return answerSheet.length > 0 ? answerSheet[0] : null;
}
