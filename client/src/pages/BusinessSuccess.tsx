import React from 'react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useTranslation } from 'react-i18next';

export const BusinessSuccess: React.FC = () => {
  const { t } = useTranslation('business');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">{t('success.title')}</h1>
        <p className="text-xl text-gray-600 mb-8">
          {t('success.message')}
        </p>
        <div className="space-y-4 mb-8">
          <p className="text-gray-600">
            {t('success.nextSteps')}
          </p>
          <ul className="text-left space-y-2 max-w-md mx-auto">
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('success.steps.email')}
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('success.steps.profile')}
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('success.steps.welcome')}
            </li>
          </ul>
        </div>
        <div className="space-x-4">
          <Link href="/business/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              {t('success.dashboard')}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              {t('success.home')}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}; 