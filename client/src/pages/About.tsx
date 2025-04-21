import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { imageUrls } from '@/lib/imageUrls';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Toilette Guilt</h1>
          <p className="text-gray-600 text-lg">
            Destigmatizing bathroom-related topics and making it easier to find clean, accessible facilities.
          </p>
        </div>
        
        {/* Our Mission Section */}
        <section id="mission" className="mb-16">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                At Toilette Guilt, we're committed to breaking the silence around bathroom-related topics. We believe that access to clean, safe restrooms is a basic necessity that everyone deserves, yet it's something rarely discussed openly.
              </p>
              <p className="text-gray-700 mb-4">
                Our mission is three-fold:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>To create a comprehensive directory of public restrooms that helps people find facilities when they need them most</li>
                <li>To provide educational content that promotes better hygiene practices and wellness</li>
                <li>To destigmatize conversations around bathroom needs and create a more inclusive world</li>
              </ul>
              <p className="text-gray-700">
                By fostering open discussions and providing practical resources, we're working to eliminate the "guilt" and anxiety many people feel about a basic human need.
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src={imageUrls.accessibility[0]} 
                alt="Accessible bathroom features" 
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4">
                Toilette Guilt was born from a simple realization: despite being a universal need, finding clean restrooms while out and about is unnecessarily difficult, and discussing bathroom-related topics is often considered taboo.
              </p>
              <p className="text-gray-700 mb-4">
                Our team has experienced the anxiety of desperately searching for a restroom in an unfamiliar area, the discomfort of using poorly maintained facilities, and the frustration of finding restrooms that aren't accessible to all. 
              </p>
              <p className="text-gray-700">
                We created this platform to solve these problems while also normalizing conversations around bathroom needs. By bringing these topics into the open, we hope to create a more comfortable world for everyone.
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src={imageUrls.restrooms[1]} 
                alt="Modern public restroom" 
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
          </div>
        </section>
        
        {/* Our Partnership Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-blue-800 to-primary text-white overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8">
                <h2 className="text-3xl font-bold mb-4">Our Partnership with Injoy Bio</h2>
                <p className="mb-4 opacity-90">
                  We've partnered with Injoy Bio to bring you premium hygiene products that complement our mission of promoting wellness and comfort.
                </p>
                <p className="mb-6 opacity-90">
                  Injoy Bio shares our commitment to breaking taboos around personal hygiene and offers innovative products that enhance comfort and well-being.
                </p>
                <Button 
                  asChild
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  <a 
                    href="https://injoy.bio" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Discover Injoy Bio
                  </a>
                </Button>
              </div>
              <div className="md:w-1/2">
                <img 
                  src={imageUrls.hygieneProducts[1]}
                  alt="Injoy Bio products" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Get In Touch</h2>
          
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <i className="fas fa-envelope text-primary mt-1 mr-3"></i>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">contact@toiletteguilt.com</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-map-marker-alt text-primary mt-1 mr-3"></i>
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-gray-600">123 Bathroom Blvd, New York, NY 10001</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-phone text-primary mt-1 mr-3"></i>
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-600">(555) 123-4567</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Follow Us</h4>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-500 hover:text-primary transition">
                        <i className="fab fa-facebook-f text-xl"></i>
                      </a>
                      <a href="#" className="text-gray-500 hover:text-primary transition">
                        <i className="fab fa-twitter text-xl"></i>
                      </a>
                      <a href="#" className="text-gray-500 hover:text-primary transition">
                        <i className="fab fa-instagram text-xl"></i>
                      </a>
                      <a href="#" className="text-gray-500 hover:text-primary transition">
                        <i className="fab fa-linkedin-in text-xl"></i>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Send Us a Message</h3>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea 
                        id="message" 
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      ></textarea>
                    </div>
                    <Button className="w-full">Send Message</Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Call to Action */}
        <section className="text-center bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-3">Join Our Mission</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Help us grow our directory and destigmatize bathroom-related topics. Together, we can create a more accessible and comfortable world for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-primary text-white hover:bg-blue-700"
              onClick={() => window.location.href = '/submit-listing'}
            >
              Submit a Restroom
            </Button>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
              asChild
            >
              <a href="https://injoy.bio" target="_blank" rel="noopener noreferrer">
                Visit Injoy Bio
              </a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
