'use server';
/**
 * @fileOverview Fluxo de IA para gerar um quiz sobre Donatello.
 *
 * - generateDonatelloQuiz - Uma função que gera um quiz sobre Donatello.
 * - GenerateDonatelloQuizInput - O tipo de entrada para a função generateDonatelloQuiz.
 * - GenerateDonatelloQuizOutput - O tipo de retorno para a função generateDonatelloQuiz.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDonatelloQuizInputSchema = z.object({
  topic: z
    .string()
    .optional()
    .describe('Tópico opcional para focar o quiz, como esculturas, vida ou período.'),
  numQuestions: z
    .number()
    .default(5)
    .describe('O número de perguntas a serem geradas para o quiz.'),
});
export type GenerateDonatelloQuizInput = z.infer<
  typeof GenerateDonatelloQuizInputSchema
>;

const GenerateDonatelloQuizOutputSchema = z.object({
  quiz: z
    .array(
      z.object({
        question: z.string().describe('A pergunta do quiz.'),
        options: z.array(z.string()).describe('As opções de múltipla escolha.'),
        answer: z.string().describe('A resposta correta para a pergunta.'),
      })
    )
    .describe('Uma lista de perguntas, opções e respostas do quiz.'),
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
  prompt: `Você é um especialista em gerar quizzes especializado no escultor renascentista italiano Donatello. Crie um quiz com o número especificado de perguntas. Cada pergunta deve ter opções de múltipla escolha, com uma resposta correta. O quiz deve ser inteiramente em português e focado exclusivamente no artista, não em outras figuras com o mesmo nome.

      {{#if topic}}
      O quiz deve focar no seguinte tópico: {{topic}}.
      {{/if}}

      Número de perguntas: {{numQuestions}}

      Gere o quiz no formato JSON solicitado.
      `,
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
