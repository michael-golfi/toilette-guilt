import React from 'react';
import { imageUrls } from '@/lib/imageUrls';
import { Button } from '@/components/ui/button';

const InjoyPromotion: React.FC = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-blue-800 to-primary text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">Discover Premium Hygiene Products at Injoy Bio</h2>
            <p className="text-lg opacity-90 mb-6">
              We've partnered with Injoy Bio to bring you the highest quality personal hygiene products that enhance comfort and promote wellness.
            </p>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                <span>Eco-friendly formulations that are gentle on your skin and the planet</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                <span>Innovative designs for maximum comfort and convenience</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                <span>Premium ingredients that prioritize your health and well-being</span>
              </li>
            </ul>
            
            <Button 
              asChild
              className="bg-white text-primary hover:bg-gray-100"
            >
              <a 
                href="https://injoy.bio" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center"
              >
                Shop Now at Injoy Bio <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </Button>
          </div>
          
          <div className="md:w-1/2 md:pl-12">
            <img 
              src={imageUrls.hygieneProducts[0]} 
              alt="Premium bathroom hygiene products" 
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InjoyPromotion;
