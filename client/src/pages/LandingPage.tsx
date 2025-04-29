import React from 'react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useTranslation } from 'react-i18next';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation('business');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {t('landing.hero.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('landing.hero.description')}
        </p>
        <Link href="/business/register">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            {t('landing.hero.cta')}
          </Button>
        </Link>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('landing.benefits.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">{t('landing.benefits.revenue.title')}</h3>
            <p className="text-gray-600">
              {t('landing.benefits.revenue.description')}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">{t('landing.benefits.traffic.title')}</h3>
            <p className="text-gray-600">
              {t('landing.benefits.traffic.description')}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">{t('landing.benefits.impact.title')}</h3>
            <p className="text-gray-600">
              {t('landing.benefits.impact.description')}
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">{t('landing.howItWorks.title')}</h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{t('landing.howItWorks.steps.signup.number')}</div>
            <h3 className="text-lg font-semibold mb-2">{t('landing.howItWorks.steps.signup.title')}</h3>
            <p className="text-gray-600">{t('landing.howItWorks.steps.signup.description')}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{t('landing.howItWorks.steps.hours.number')}</div>
            <h3 className="text-lg font-semibold mb-2">{t('landing.howItWorks.steps.hours.title')}</h3>
            <p className="text-gray-600">{t('landing.howItWorks.steps.hours.description')}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{t('landing.howItWorks.steps.payment.number')}</div>
            <h3 className="text-lg font-semibold mb-2">{t('landing.howItWorks.steps.payment.title')}</h3>
            <p className="text-gray-600">{t('landing.howItWorks.steps.payment.description')}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{t('landing.howItWorks.steps.members.number')}</div>
            <h3 className="text-lg font-semibold mb-2">{t('landing.howItWorks.steps.members.title')}</h3>
            <p className="text-gray-600">{t('landing.howItWorks.steps.members.description')}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">{t('landing.cta.title')}</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('landing.cta.description')}
        </p>
        <Link href="/business/register">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            {t('landing.cta.button')}
          </Button>
        </Link>
      </section>
    </div>
  );
}; 