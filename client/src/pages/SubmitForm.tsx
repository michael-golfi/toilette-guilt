import React from 'react';
import { useLocation } from 'wouter';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { insertRestroomSchema } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import type { i18n as I18nType } from 'i18next';

// Function to create the schema, accepting the t function
// Note: Validation keys now need prefixes like 'restrooms:submit.validation...'
const createSubmitFormSchema = (t: I18nType['t']) => 
  insertRestroomSchema.extend({
    name: z.string().min(3, { message: t('restrooms:submit.validation.nameMin') }),
    address: z.string().min(5, { message: t('restrooms:submit.validation.addressMin') }),
    city: z.string().min(2, { message: t('restrooms:submit.validation.cityRequired') }),
    state: z.string().min(2, { message: t('restrooms:submit.validation.stateRequired') }),
    zipCode: z.string().min(5, { message: t('restrooms:submit.validation.zipCodeMin') }),
    description: z.string().min(10, { message: t('restrooms:submit.validation.descriptionMin') }),
    hours: z.string().min(3, { message: t('restrooms:submit.validation.hoursRequired') }),
    latitude: z.string().optional().default("0"),
    longitude: z.string().optional().default("0"),
    imageUrl: z.string().url({ message: t('restrooms:submit.validation.imageUrlInvalid') }).optional().or(z.literal('')),
    createdBy: z.number().optional().default(1), 
  });

// Infer type from the schema creator function's return type
type FormValues = z.infer<ReturnType<typeof createSubmitFormSchema>>;

// List of feature/amenity fields from the schema (excluding non-booleans)
const featureFields: (keyof FormValues)[] = [
  'accessibilityFeatures', 'babyChanging', 'genderNeutral', 'freeToUse', 'changingRoom',
  'singleOccupancy', 'customerOnly', 'codeRequired', 'attendantPresent', 'familyFriendly',
  'soapAvailable', 'wellStocked', 'premiumProducts'
];

const SubmitForm: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  // Load restrooms and common namespaces
  const { t } = useTranslation(['restrooms', 'common']); 

  const submitFormSchema = createSubmitFormSchema(t);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(submitFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      description: "",
      hours: "",
      imageUrl: "",
      latitude: "0",
      longitude: "0",
      createdBy: 1, 
      accessibilityFeatures: false,
      babyChanging: false,
      genderNeutral: false,
      freeToUse: true,
      changingRoom: false,
      singleOccupancy: false,
      customerOnly: false,
      codeRequired: false,
      attendantPresent: false,
      familyFriendly: false,
      soapAvailable: true,
      wellStocked: true,
      premiumProducts: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log("Submitting data:", data);
    try {
      const result = await apiRequest('POST', '/api/restrooms', data);
      
      if (result.ok) {
        toast({
          // Keys now need appropriate namespace prefix (e.g., common or restrooms)
          title: t('common:toast.successTitle', { defaultValue: 'Submission Successful!' }),
          description: t('common:toast.successDescription', { defaultValue: 'Thank you for contributing!' }),
        });
        queryClient.invalidateQueries({ queryKey: ['/api/restrooms'] });
        setTimeout(() => {
          setLocation('/');
        }, 2000);
      } else {
         const errorData = await result.json().catch(() => ({}));
         console.error('Submission error response:', errorData);
         toast({
            title: t('common:toast.errorTitle', { defaultValue: 'Submission Failed' }),
            description: t('common:toast.errorDescription', { error: errorData.message || 'Unknown error', defaultValue: 'An error occurred.' }),
            variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: t('common:toast.errorTitle', { defaultValue: 'Submission Failed' }),
        description: t('common:toast.errorDescription', { error: (error as Error).message || 'Network error', defaultValue: 'An error occurred.' }),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
           {/* Keys now need restrooms:submit... prefix */}
          <h1 className="text-3xl font-bold mb-3">{t('restrooms:submit.title')}</h1>
          <p className="text-gray-600">
            {t('restrooms:submit.subtitle')}
          </p>
        </div>
        
        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('restrooms:submit.locationInfo')}</CardTitle> 
            <CardDescription>
               {t('restrooms:submit.cardDescription', {defaultValue: 'Please provide accurate details.'})}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4 border-b pb-6 mb-6">
                 {/* Section title might be restrooms:submit.locationInfo already used in CardTitle? Or add a new key */}
                 {/* <h3 className="text-lg font-medium mb-1">{t('restrooms:submit.locationInfo')}</h3> */} 
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('restrooms:submit.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('restrooms:submit.namePlaceholder')} {...field} />
                        </FormControl>
                        {/* Optional: Add description key if needed: t('restrooms:submit.nameDescription') */}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('restrooms:submit.address')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('restrooms:submit.addressPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('restrooms:submit.city')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('restrooms:submit.cityPlaceholder', {defaultValue: 'City'})} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('restrooms:submit.state')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('restrooms:submit.statePlaceholder', {defaultValue: 'State/Province'})} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('restrooms:submit.zipCode')}</FormLabel>
                          <FormControl>
                            <Input type="text" inputMode="numeric" placeholder={t('restrooms:submit.zipCodePlaceholder', {defaultValue: 'Zip/Postal Code'})} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Operating Hours */}
                  <FormField
                    control={form.control}
                    name="hours"
                    render={({ field }) => (
                      <FormItem>
                         {/* Add hours label key if needed: t('restrooms:submit.hoursLabel') */}
                         <FormLabel>{t('restrooms:detail.hours')}</FormLabel> 
                        <FormControl>
                          <Input placeholder={t('restrooms:submit.hoursPlaceholder', {defaultValue: 'e.g., 6AM-10PM Daily'})} {...field} />
                        </FormControl>
                         {/* Optional: Add hours description key if needed: t('restrooms:submit.hoursDescription') */}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                         <FormLabel>{t('restrooms:submit.descriptionLabel', {defaultValue: 'Description'})}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('restrooms:submit.descriptionPlaceholder', {defaultValue: 'Describe the facilities...'})} 
                            {...field} 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div> 

                {/* Features & Amenities Section */}
                <div className="space-y-4 border-b pb-6 mb-6">
                  <h3 className="text-lg font-medium mb-3">{t('restrooms:submit.featuresTitle', {defaultValue: 'Features & Amenities'})}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                    {featureFields.map((featureName) => (
                      <FormField
                        key={featureName}
                        control={form.control}
                        name={featureName as keyof FormValues}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0 bg-gray-50 p-3 rounded-md border">
                            <FormControl>
                              <Checkbox
                                checked={field.value as boolean | undefined}
                                onCheckedChange={field.onChange}
                                id={featureName}
                              />
                            </FormControl>
                            <FormLabel htmlFor={featureName} className="font-normal cursor-pointer">
                               {/* Use keys from restrooms:features namespace */}
                               {t(`restrooms:features.${featureName}`, { 
                                   defaultValue: featureName 
                               }) }
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Optional Information Section */}
                <div className="space-y-4">
                 <h3 className="text-lg font-medium mb-1">{t('restrooms:submit.optionalInfoTitle', {defaultValue: 'Optional Information'})}</h3>
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('restrooms:submit.imageUrlLabel', {defaultValue: 'Image URL'})}</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder={t('restrooms:submit.imageUrlPlaceholder', {defaultValue: 'https://example.com/image.jpg'})} {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('restrooms:submit.imageUrlDescription', {defaultValue: 'Link to an image (optional).'})}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Submission Button */}
                <div className="pt-6 border-t mt-6">
                  <Button 
                     type="submit" 
                     className="w-full sm:w-auto" 
                     disabled={form.formState.isSubmitting}
                   >
                     {form.formState.isSubmitting 
                       ? t('common:submitting', { defaultValue: 'Submitting...' }) 
                       : t('restrooms:submit.submit')}
                   </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitForm;
