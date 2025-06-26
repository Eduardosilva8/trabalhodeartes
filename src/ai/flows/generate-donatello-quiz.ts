'use server';
/**
 * @fileOverview A flow for generating a quiz about Donatello.
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
    .describe('Optional topic to focus the quiz on, such as sculptures, life, or period.'),
  numQuestions: z
    .number()
    .default(5)
    .describe('The number of questions to generate for the quiz.'),
});
export type GenerateDonatelloQuizInput = z.infer<
  typeof GenerateDonatelloQuizInputSchema
>;

const GenerateDonatelloQuizOutputSchema = z.object({
  quiz: z
    .array(
      z.object({
        question: z.string().describe('The quiz question.'),
        options: z.array(z.string()).describe('The multiple-choice options.'),
        answer: z.string().describe('The correct answer to the question.'),
      })
    )
    .describe('A list of quiz questions, options, and answers.'),
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
  prompt: `You are an expert quiz generator specializing in the Italian Renaissance sculptor Donatello. Create a quiz with the specified number of questions. For each question, provide multiple choice options and ensure the correct answer is one of the provided options. The quiz should be entirely in Portuguese and focused exclusively on the artist, not other figures with the same name.

      {{#if topic}}
      The quiz should focus on the following topic: {{topic}}.
      {{/if}}

      Number of questions: {{numQuestions}}
      `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const generateDonatelloQuizFlow = ai.defineFlow(
  {
    name: 'generateDonatelloQuizFlow',
    inputSchema: GenerateDonatelloQuizInputSchema,
    outputSchema: GenerateDonatelloQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate the quiz. Please try again.');
    }
    return output;
  }
);
