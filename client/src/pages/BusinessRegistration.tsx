import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { loadStripe } from '@stripe/stripe-js';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const MONTHLY_FEE = 50; // $50 per month

// Initialize Stripe with the publishable key from environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

type DayOfWeek = typeof DAYS_OF_WEEK[number];

interface BusinessHours {
  open: string;
  close: string;
}

interface BathroomFeatures {
  accessible: boolean;
  genderNeutral: boolean;
  babyChanging: boolean;
  familyRestroom: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  businessHours: Record<DayOfWeek, BusinessHours>;
  bathroomFeatures: BathroomFeatures;
}

export const BusinessRegistration: React.FC = () => {
  const { t } = useTranslation('business');
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    businessHours: DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: { open: '', close: '' }
    }), {} as Record<DayOfWeek, BusinessHours>),
    bathroomFeatures: {
      accessible: false,
      genderNeutral: false,
      babyChanging: false,
      familyRestroom: false
    }
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Stripe Buy Button script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Validate form whenever formData changes
  useEffect(() => {
    const isValid = 
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.state.trim() !== '' &&
      formData.postalCode.trim() !== '' &&
      formData.country.trim() !== '' &&
      Object.values(formData.businessHours).every(hours => 
        hours.open.trim() !== '' && hours.close.trim() !== ''
      );
    
    setIsFormValid(isValid);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // First, create the business record
      const response = await fetch('/api/business/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register business');
      }

      const data = await response.json();
      
      // Initialize Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      // Handle payment
      const { error: stripeError } = await stripe.confirmPayment({
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/business/success`,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // If this is a retry, show success message
      if (data.isRetry) {
        setLocation('/business/success');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
  };

  const handleBusinessHoursChange = (day: DayOfWeek, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleBathroomFeatureChange = (feature: keyof BathroomFeatures) => {
    setFormData(prev => ({
      ...prev,
      bathroomFeatures: {
        ...prev.bathroomFeatures,
        [feature]: !prev.bathroomFeatures[feature]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold text-center mb-8">{t('registration.title')}</h1>
          <p className="text-gray-600 text-center mb-8">
            {t('registration.description')}
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">{t('registration.form.businessName')}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">{t('registration.form.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">{t('registration.form.phone')}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="address">{t('registration.form.address')}</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">{t('registration.form.city')}</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">{t('registration.form.state')}</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">{t('registration.form.postalCode')}</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">{t('registration.form.country')}</Label>
                <Select value={formData.country} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('registration.form.country')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t('countries', { returnObjects: true })).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>{t('registration.form.businessHours.label')}</Label>
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{day}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={formData.businessHours[day].open}
                        onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                        placeholder={t('registration.form.businessHours.open')}
                      />
                      <Input
                        type="time"
                        value={formData.businessHours[day].close}
                        onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                        placeholder={t('registration.form.businessHours.close')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label>{t('registration.form.bathroomFeatures.label')}</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessible"
                    checked={formData.bathroomFeatures.accessible}
                    onCheckedChange={() => handleBathroomFeatureChange('accessible')}
                  />
                  <Label htmlFor="accessible">{t('registration.form.bathroomFeatures.accessible')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="genderNeutral"
                    checked={formData.bathroomFeatures.genderNeutral}
                    onCheckedChange={() => handleBathroomFeatureChange('genderNeutral')}
                  />
                  <Label htmlFor="genderNeutral">{t('registration.form.bathroomFeatures.genderNeutral')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="babyChanging"
                    checked={formData.bathroomFeatures.babyChanging}
                    onCheckedChange={() => handleBathroomFeatureChange('babyChanging')}
                  />
                  <Label htmlFor="babyChanging">{t('registration.form.bathroomFeatures.babyChanging')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyRestroom"
                    checked={formData.bathroomFeatures.familyRestroom}
                    onCheckedChange={() => handleBathroomFeatureChange('familyRestroom')}
                  />
                  <Label htmlFor="familyRestroom">{t('registration.form.bathroomFeatures.familyRestroom')}</Label>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? t('registration.form.submitting') : t('registration.form.submit')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}; 