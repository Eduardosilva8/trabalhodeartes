
'use server';
import {
  generateDonatelloQuiz as generateDonatelloQuizFlow,
  type GenerateDonatelloQuizInput,
  type GenerateDonatelloQuizOutput,
} from '@/ai/flows/generate-donatello-quiz';

export async function generateDonatelloQuiz(
  input: GenerateDonatelloQuizInput
): Promise<GenerateDonatelloQuizOutput> {
  return await generateDonatelloQuizFlow(input);
}
