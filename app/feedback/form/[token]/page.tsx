'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'text' | 'rating' | 'choice' | 'textarea';
  options: any;
  required: boolean;
  question_order: number;
}

interface FeedbackForm {
  id: string;
  type: 'sales' | 'product';
  title: string;
  description: string;
  template: string;
  questions: Question[];
}

// Create a dynamic form schema based on the questions
const createFormSchema = (questions: Question[]) => {
  const schemaFields: Record<string, any> = {};
  
  questions.forEach(question => {
    if (question.required) {
      if (question.type === 'text' || question.type === 'textarea') {
        schemaFields[question.id] = z.string().min(1, 'این فیلد الزامی است');
      } else if (question.type === 'rating') {
        schemaFields[question.id] = z.string().min(1, 'لطفا یک امتیاز انتخاب کنید');
      } else if (question.type === 'choice') {
        schemaFields[question.id] = z.string().min(1, 'لطفا یک گزینه انتخاب کنید');
      }
    } else {
      schemaFields[question.id] = z.string().optional();
    }
  });
  
  return z.object(schemaFields);
};

export default function FeedbackFormPage() {
  const { token } = useParams();
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Always call useForm hook - this prevents the "Rendered more hooks than during the previous render" error
  const formMethods = useForm<any>({
    resolver: form ? zodResolver(createFormSchema(form.questions)) : undefined,
    defaultValues: {},
  });

  // Fetch the form data
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/feedback/form/${token}`);
        const data = await response.json();
        
        if (data.success) {
          setForm(data.data);
          // Update form default values when form data is loaded
          const defaultValues = data.data.questions.reduce((acc: Record<string, string>, question: Question) => {
            acc[question.id] = '';
            return acc;
          }, {});
          formMethods.reset(defaultValues);
        } else {
          setError(data.message || 'خطا در دریافت فرم بازخورد');
        }
      } catch (error) {
        setError('خطا در ارتباط با سرور');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchForm();
    }
  }, [token, formMethods]);

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Convert the form values to the format expected by the API
      const responses = Object.entries(values).map(([questionId, response]) => ({
        questionId,
        response,
      }));

      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          responses,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'خطا در ثبت بازخورد');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // If the form is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">در حال بارگذاری فرم بازخورد...</p>
        </div>
      </div>
    );
  }

  // If there was an error, show an error message
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">خطا</h1>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-gray-600">این فرم ممکن است منقضی شده یا قبلاً تکمیل شده باشد.</p>
            <p className="text-sm text-gray-500 mt-4">در صورت نیاز به کمک، با پشتیبانی تماس بگیرید.</p>
          </div>
        </Card>
      </div>
    );
  }

  // If the form has been submitted, show a success message
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-600 mb-4">با تشکر از شما</h1>
            <p className="text-gray-700 mb-4">بازخورد شما با موفقیت ثبت شد.</p>
            <p className="text-gray-600">نظرات شما به ما کمک می‌کند تا خدمات خود را بهبود بخشیم.</p>
            <div className="mt-6 text-sm text-gray-500">
              <p>شرکت رابین تجارت</p>
              <p>سیستم مدیریت ارتباط با مشتریان</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
            <p className="text-muted-foreground">{form.description}</p>
          </div>

          <Form {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6">
              {form.questions.sort((a, b) => a.question_order - b.question_order).map((question) => (
                <FormField
                  key={question.id}
                  control={formMethods.control}
                  name={question.id}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {question.question}
                        {question.required && <span className="text-red-500 mr-1">*</span>}
                      </FormLabel>
                      {(() => {
                        let inputComponent;
                        
                        if (question.type === 'text') {
                          inputComponent = <Input {...field} placeholder="پاسخ خود را وارد کنید" />;
                        } else if (question.type === 'textarea') {
                          inputComponent = (
                            <Textarea
                              {...field}
                              placeholder="پاسخ خود را وارد کنید"
                              className="min-h-[100px]"
                            />
                          );
                        } else if (question.type === 'rating') {
                          inputComponent = (
                            <div className="flex flex-wrap gap-2">
                              {Array.from({ length: question.options?.max || 5 }, (_, i) => i + 1).map((rating) => (
                                <Button
                                  key={rating}
                                  type="button"
                                  variant={field.value === rating.toString() ? "default" : "outline"}
                                  className="w-12 h-12"
                                  onClick={() => field.onChange(rating.toString())}
                                >
                                  {rating}
                                </Button>
                              ))}
                            </div>
                          );
                        } else if (question.type === 'choice') {
                          inputComponent = (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="یک گزینه انتخاب کنید" />
                              </SelectTrigger>
                              <SelectContent>
                                {question.options?.options?.map((option: string) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          );
                        }
                        
                        return <FormControl>{inputComponent}</FormControl>;
                      })()}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      در حال ثبت...
                    </>
                  ) : (
                    'ثبت بازخورد'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    );
  }

  return null;
}
