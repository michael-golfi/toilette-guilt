import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { imageUrls } from '@/lib/imageUrls';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';

const About: React.FC = () => {
  const { t } = useTranslation(['about', 'common']);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('hero.title')}</h1>
          <p className="text-gray-600 text-lg">
            {t('hero.subtitle')}
          </p>
        </div>
        
        {/* Our Mission Section */}
        <section id="mission" className="mb-16">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">{t('mission.title')}</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {t('mission.paragraph1')}
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {t('mission.paragraph2')}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t('mission.paragraph3')}
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src={imageUrls.accessibility[0]} 
                alt={t('mission.imageAlt', {defaultValue: 'Accessible bathroom features including grab bars and raised toilet seat'})} 
                className="rounded-lg shadow-md w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">{t('story.title')}</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {t('story.paragraph1')}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t('story.paragraph2')}
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src={imageUrls.restrooms[1]} 
                alt={t('story.imageAlt', {defaultValue: 'A modern, clean public restroom with multiple stalls'})} 
                className="rounded-lg shadow-md w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        {/* <section id="contact" className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">{t('contact.title')}</h2>
          
          <Card className="shadow-md">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('contact.description')}</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <i className="fas fa-envelope text-primary mt-1 mr-3 w-5 text-center"></i>
                      <div>
                        <p className="font-medium">{t('contact.emailLabel', {defaultValue: 'Email'})}</p>
                        <a href={`mailto:${t('contact.emailAddress')}`} className="text-gray-600 hover:text-primary transition">{t('contact.emailAddress')}</a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-map-marker-alt text-primary mt-1 mr-3 w-5 text-center"></i>
                      <div>
                        <p className="font-medium">{t('contact.addressLabel', {defaultValue: 'Address'})}</p>
                        <p className="text-gray-600">{t('contact.addressValue')}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-phone text-primary mt-1 mr-3 w-5 text-center"></i>
                      <div>
                        <p className="font-medium">{t('contact.phoneLabel', {defaultValue: 'Phone'})}</p>
                        <a href={`tel:${t('contact.phoneNumber')}`} className="text-gray-600 hover:text-primary transition">{t('contact.phoneNumber')}</a>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">{t('contact.followUs')}</h4>
                    <div className="flex space-x-4">
                      <a href="#" aria-label={t('common:social.facebook')} className="text-gray-500 hover:text-primary transition">
                        <i className="fab fa-facebook-f text-xl"></i>
                      </a>
                      <a href="#" aria-label={t('common:social.twitter')} className="text-gray-500 hover:text-primary transition">
                        <i className="fab fa-twitter text-xl"></i>
                      </a>
                      <a href="#" aria-label={t('common:social.instagram')} className="text-gray-500 hover:text-primary transition">
                        <i className="fab fa-instagram text-xl"></i>
                      </a>
                      <a href="#" aria-label={t('common:social.linkedin', {defaultValue: 'Visit our LinkedIn page'})} className="text-gray-500 hover:text-primary transition">
                        <i className="fab fa-linkedin-in text-xl"></i>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t('contact.form.title')}</h3>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert(t('contact.form.submitAlert', {defaultValue: 'Form submission placeholder'})); }}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t('contact.form.name')}</label>
                      <input 
                        type="text" 
                        id="name" 
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2"
                        placeholder={t('contact.form.namePlaceholder', {defaultValue: 'Your Name'})}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('contact.form.email')}</label>
                      <input 
                        type="email" 
                        id="email" 
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2"
                        placeholder={t('contact.form.emailPlaceholder', {defaultValue: 'your.email@example.com'})}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">{t('contact.form.message')}</label>
                      <textarea 
                        id="message" 
                        rows={4}
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2"
                        placeholder={t('contact.form.messagePlaceholder', {defaultValue: 'Your message here...'})}
                      ></textarea>
                    </div>
                    <Button type="submit" className="w-full">{t('contact.form.submit')}</Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </section> */}
        
        {/* Call to Action */}
        {/* <section className="text-center bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-lg shadow-inner">
          <h2 className="text-2xl font-bold mb-3 text-primary">{t('cta.title')}</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <Button 
            className="bg-secondary text-white hover:bg-green-700 px-6 py-2"
            asChild
          >
            <Link href="/submit-listing">{t('cta.button')}</Link>
          </Button>
        </section> */}
      </div>
    </div>
  );
};

export default About;
