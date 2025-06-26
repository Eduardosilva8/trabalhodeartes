'use server';
/**
 * @fileOverview AI flow to generate a quiz about Donatello.
 *
 * - generateDonatelloQuiz - A function that generates a quiz about Donatello.
 * - GenerateDonatelloQuizInput - The input type for the generateDonatelloQuiz function.
 * - GenerateDonatelloQuizOutput - The return type for the generateDonatelloQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDonatelloQuizInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe('Optional topic to focus the quiz on, such as sculptures, life, or time period.'),
  numQuestions: z
    .number()
    .default(5)
    .describe('The number of questions to generate for the quiz.'),
});
export type GenerateDonatelloQuizInput = z.infer<
  typeof GenerateDonatelloQuizInputSchema
>;

const GenerateDonatelloQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The multiple-choice options.'),
      answer: z.string().describe('The correct answer to the question.'),
    })
  ).
describe('A list of quiz questions, options and answers.'),
});
export type GenerateDonatelloQuizOutput = z.infer<
  typeof GenerateDonatelloQuizOutputSchema
>;

export async function generateDonatelloQuiz(
  input: GenerateDonatelloQuizInput
): Promise<GenerateDonatelloQuizOutput> {
  return generateDonatelloQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDonatelloQuizPrompt',
  input: {schema: GenerateDonatelloQuizInputSchema},
  output: {schema: GenerateDonatelloQuizOutputSchema},
  prompt: `You are an expert quiz generator specializing in Donatello. Create a quiz with the specified number of questions. Each question should have multiple-choice options, with one correct answer.

      {{#if topic}}
      The quiz should focus on the following topic: {{topic}}.
      {{/if}}

      Number of questions: {{numQuestions}}

      The quiz should be in JSON format and conform to the following schema:
      ${JSON.stringify(GenerateDonatelloQuizOutputSchema.describe)}
      `, // Ensure schema is correctly stringified for the prompt.
});

const generateDonatelloQuizFlow = ai.defineFlow(
  {
    name: 'generateDonatelloQuizFlow',
    inputSchema: GenerateDonatelloQuizInputSchema,
    outputSchema: GenerateDonatelloQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
