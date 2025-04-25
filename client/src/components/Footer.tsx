import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-primary text-2xl"><i className="fas fa-toilet"></i></span>
              <span className="font-bold text-xl">{t('brandName', {defaultValue: 'Toilette Guilt'})}</span>
            </div>
            <p className="text-gray-400 mb-4">
              {t('footer.tagline', { defaultValue: 'Destigmatizing bathroom conversations one review at a time. Find clean, accessible restrooms wherever you go.'})}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('footer.links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/find-restrooms">
                  <a className="text-gray-400 hover:text-white transition">{t('navigation.findRestrooms')}</a>
                </Link>
              </li>
              {/* <li>
                <Link href="/submit-listing">
                  <a className="text-gray-400 hover:text-white transition">{t('navigation.submitListing')}</a>
                </Link>
              </li> */}
              <li>
                <Link href="/find-restrooms?sort=most-reviewed">
                  <a className="text-gray-400 hover:text-white transition">{t('navigation.mostReviewed', {defaultValue: 'Most Reviewed'})}</a>
                </Link>
              </li>
              <li>
                <Link href="/find-restrooms?sort=top-rated">
                  <a className="text-gray-400 hover:text-white transition">{t('navigation.topRated', {defaultValue: 'Top Rated'})}</a>
                </Link>
              </li>
              <li>
                <Link href="/find-restrooms?sort=recent">
                  <a className="text-gray-400 hover:text-white transition">{t('navigation.recentlyAdded', {defaultValue: 'Recently Added'})}</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/articles?category=Hygiene%20Tips">
                  <a className="text-gray-400 hover:text-white transition">{t('footer.hygieneArticles', {defaultValue: 'Hygiene Articles'})}</a>
                </Link>
              </li>
              <li>
                <Link href="/articles?category=Accessibility">
                  <a className="text-gray-400 hover:text-white transition">{t('footer.accessibilityGuide', {defaultValue: 'Accessibility Guide'})}</a>
                </Link>
              </li>
              <li>
                <Link href="/articles">
                  <a className="text-gray-400 hover:text-white transition">{t('footer.bathroomEtiquette', {defaultValue: 'Bathroom Etiquette'})}</a>
                </Link>
              </li>
              <li>
                <Link href="/articles">
                  <a className="text-gray-400 hover:text-white transition">{t('footer.travelTips', {defaultValue: 'Travel Tips'})}</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('footer.about')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-gray-400 hover:text-white transition">{t('footer.about')}</a>
                </Link>
              </li>
              <li>
                <Link href="/about#mission">
                  <a className="text-gray-400 hover:text-white transition">{t('footer.ourMission', {defaultValue: 'Our Mission'})}</a>
                </Link>
              </li>
              <li>
                <Link href="/about#contact">
                  <a className="text-gray-400 hover:text-white transition">{t('footer.contact')}</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-gray-400 hover:text-white transition">{t('footer.privacy')}</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-gray-400 hover:text-white transition">{t('footer.terms')}</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
               {t('footer.copyright', { year: currentYear })}
            </p>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-4 right-4 md:hidden z-40">
        <a 
          href="https://injoy.bio" 
          className="bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('footer.mobileCtaAriaLabel', {defaultValue: 'Visit Injoy Bio'})}
        >
          <i className="fas fa-external-link-alt text-xl"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
