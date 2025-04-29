import React from 'react';
import ReactMarkdown from 'react-markdown';

const termsOfServiceContent = `
# Terms of Service

Last updated: ${new Date().toLocaleDateString()}

## 1. Acceptance of Terms

By accessing and using Toilet Guilt, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.

## 2. Description of Service

Toilet Guilt provides a platform that allows users to find nearby public bathrooms and enables businesses to list their facilities for a monthly fee. Our service includes:

- Public bathroom directory and search functionality
- Business listing and management tools
- Payment processing for business subscriptions
- User reviews and ratings
- Location-based search and filtering

## 3. User Accounts

### 3.1 Account Creation

To access certain features, you may need to create an account. You are responsible for:

- Maintaining the confidentiality of your account information
- All activities that occur under your account
- Providing accurate and complete information
- Notifying us of any unauthorized use

### 3.2 Business Listings

Businesses that wish to list their facilities must:

- Provide accurate and complete information
- Maintain current subscription payments
- Comply with all applicable laws and regulations
- Keep listing information up to date
- Respond to user reviews in a professional manner

## 4. Payment Terms

### 4.1 Subscription Fees

Business listings require a monthly subscription fee. By subscribing, you agree to:

- Pay all fees on time
- Provide accurate payment information
- Authorize automatic recurring payments
- Understand that we do not offer refunds, but will cancel and prorate subscriptions upon request

### 4.2 Payment Processing

Payments are processed through Stripe. We are not responsible for:

- Any issues with payment processing
- Bank or credit card fees
- Currency conversion rates

## 5. User Content

### 5.1 Reviews and Ratings

Users may submit reviews, ratings, and other content. By submitting content, you:

- Grant us a license to use and display the content
- Warrant that the content is accurate and lawful
- Agree not to submit false or misleading information
- Accept that we may moderate or remove content at our discretion

### 5.2 Content Guidelines

User content must not:

- Contain false or misleading information
- Include offensive or inappropriate language
- Violate any third-party rights
- Promote illegal activities

We reserve the right to remove any reviews that are:
- Offensive or aggressive
- Inappropriate or irrelevant
- False or misleading
- Violate our content guidelines

## 6. Prohibited Activities

Users are prohibited from:

- Submitting false or misleading information
- Attempting to access unauthorized areas of the service
- Interfering with the proper functioning of the service
- Violating any applicable laws or regulations
- Using automated tools to access the service
- Attempting to bypass security measures

## 7. Intellectual Property

All content and materials on this service, including but not limited to:

- Text, graphics, and logos
- Software and code
- Database structure
- User interface design

are the property of Toilet Guilt and are protected by intellectual property laws.

## 8. Limitation of Liability

We are not liable for:

- Any indirect, incidental, or consequential damages
- Loss of data or profits
- Service interruptions or errors
- Third-party actions or content
- Inaccuracies in business listings
- Bathroom availability or conditions
- Any health or safety issues

## 9. Changes to Terms

We reserve the right to modify these terms at any time. We will notify users of changes by:

- Posting the new terms on this page
- Updating the "Last updated" date
- Sending email notifications for significant changes

## 10. Governing Law

These terms shall be governed by and construed in accordance with the laws of Montreal, Canada, without regard to its conflict of law provisions.

## 11. Contact Information

For any questions about these Terms of Service, please contact us at:

Email: info@toiletguilt.com  
Address: Montreal, Canada
`;

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-lg dark:prose-invert">
      <ReactMarkdown>{termsOfServiceContent}</ReactMarkdown>
    </div>
  );
};

export default TermsOfService; 