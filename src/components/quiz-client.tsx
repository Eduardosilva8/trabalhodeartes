"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Loader2, Trophy, Palette, Users, Scroll, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { generateDonatelloQuiz } from '@/app/actions';
import type { GenerateDonatelloQuizOutput } from '@/ai/flows/generate-donatello-quiz';

type QuizQuestion = GenerateDonatelloQuizOutput['quiz'][0];
type QuizState = 'setup' | 'loading' | 'active' | 'results';

const formSchema = z.object({
  topic: z.string().default('geral'),
});

const QUESTION_TIME = 20;

export function QuizClient() {
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | 'unanswered'>('unanswered');
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: 'geral',
    },
  });

  const currentQuestion = useMemo(() => quiz?.[currentQuestionIndex], [quiz, currentQuestionIndex]);

  const options = useMemo(() => {
    if (!currentQuestion) {
      return [];
    }
    return [...currentQuestion.options].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  const handleStartQuiz = async (values: z.infer<typeof formSchema>) => {
    setQuizState('loading');
    try {
      const result = await generateDonatelloQuiz({
        topic: values.topic === 'geral' ? undefined : values.topic,
        numQuestions: 12,
      });
      setQuiz(result.quiz);
      setScore(0);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswerStatus('unanswered');
      setQuizState('active');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar o quiz',
        description: 'Não foi possível buscar as perguntas. Tente novamente.',
      });
      setQuizState('setup');
    }
  };

  const handlePlayAgain = () => {
    setQuizState('setup');
    form.reset();
  };

  const proceedToNextQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    if (quiz && nextIndex < quiz.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setAnswerStatus('unanswered');
      setTimeLeft(QUESTION_TIME);
    } else {
      setQuizState('results');
    }
  }, [currentQuestionIndex, quiz]);

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setTimeout(proceedToNextQuestion, 1500);
  };
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizState === 'active' && answerStatus === 'unanswered') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setAnswerStatus('incorrect');
            setTimeout(proceedToNextQuestion, 1500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizState, currentQuestionIndex, answerStatus, proceedToNextQuestion]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  const renderContent = () => {
    switch (quizState) {
      case 'setup':
        return (
          <motion.div key="setup" initial="hidden" animate="visible" exit="exit" variants={cardVariants}>
            <Card className="w-full max-w-lg shadow-xl">
              <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-3">
                  <Hammer className="w-10 h-10 text-primary" />
                  <CardTitle className="text-3xl font-headline">Mestre do Quiz Donatello</CardTitle>
                </div>
                <CardDescription className="pt-2">Teste seus conhecimentos sobre o grande mestre do Renascimento. Selecione um tópico e comece!</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleStartQuiz)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escolha um Tópico</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um tópico..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="geral"><Scroll className="inline mr-2 h-4 w-4" />Geral</SelectItem>
                              <SelectItem value="esculturas"><Palette className="inline mr-2 h-4 w-4" />Esculturas</SelectItem>
                              <SelectItem value="vida"><Users className="inline mr-2 h-4 w-4" />Vida e Carreira</SelectItem>
                              <SelectItem value="periodo"><Calendar className="inline mr-2 h-4 w-4" />Período Histórico</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full text-lg" size="lg">Iniciar Quiz</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'loading':
        return (
          <div className="text-center flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <p className="text-xl font-semibold font-headline">Gerando seu quiz...</p>
          </div>
        );
      
      case 'active':
        if (!currentQuestion) return null;
        
        return (
          <motion.div key={currentQuestionIndex} initial="hidden" animate="visible" exit="exit" variants={cardVariants}>
            <Card className="w-full max-w-2xl shadow-xl">
              <CardHeader>
                <p className="text-sm text-muted-foreground font-headline">Pergunta {currentQuestionIndex + 1} de {quiz?.length}</p>
                <CardTitle className="text-2xl pt-2 font-headline">{currentQuestion.question}</CardTitle>
                <div className="pt-4">
                  <Progress value={(timeLeft / QUESTION_TIME) * 100} className="w-full" />
                  <p className="text-right text-xs text-muted-foreground pt-1">{timeLeft}s restantes</p>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswer ?? ''}
                  onValueChange={setSelectedAnswer}
                  disabled={answerStatus !== 'unanswered'}
                >
                  {options.map((option, index) => {
                    const isCorrect = option === currentQuestion.answer;
                    const isSelected = option === selectedAnswer;
                    
                    let optionSpecificClasses = '';
                    if (answerStatus !== 'unanswered') {
                      if (isCorrect) {
                        optionSpecificClasses = 'border-success bg-success/20';
                      } else if (isSelected) {
                        optionSpecificClasses = 'border-destructive bg-destructive/20';
                      }
                    }
                    
                    return (
                      <div key={index} className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors duration-300 ${optionSpecificClasses}`}>
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 text-base cursor-pointer">
                          {option}
                          {answerStatus !== 'unanswered' && isCorrect && <CheckCircle className="inline ml-2 text-success" />}
                          {answerStatus !== 'unanswered' && isSelected && !isCorrect && <XCircle className="inline ml-2 text-destructive" />}
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAnswerSubmit} 
                  disabled={!selectedAnswer || answerStatus !== 'unanswered'}
                  className="w-full"
                >
                  Enviar Resposta
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );

      case 'results':
        const finalScore = score;
        const totalQuestions = quiz?.length ?? 0;
        const percentage = totalQuestions > 0 ? (finalScore / totalQuestions) * 100 : 0;
        let feedbackMessage = "Continue estudando para se tornar um mestre!";

        if (percentage >= 80) {
          feedbackMessage = "Excelente trabalho! Você é um verdadeiro mestre de Donatello!";
        } else if (percentage > 50) {
          feedbackMessage = "Bom trabalho! Você está no caminho certo.";
        }
        
        return (
          <motion.div key="results" initial="hidden" animate="visible" exit="exit" variants={cardVariants}>
            <Card className="w-full max-w-lg text-center shadow-xl">
              <CardHeader>
                <div className="flex justify-center items-center gap-3">
                  <Trophy className="w-12 h-12 text-yellow-500" />
                  <CardTitle className="text-3xl font-headline">Quiz Finalizado!</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xl">Sua pontuação final é:</p>
                <p className="text-6xl font-bold text-primary">{finalScore} / {totalQuestions}</p>
                <p className="text-muted-foreground">{feedbackMessage}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePlayAgain} className="w-full" size="lg">Jogar Novamente</Button>
              </CardFooter>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderContent()}
    </AnimatePresence>
  );
}
