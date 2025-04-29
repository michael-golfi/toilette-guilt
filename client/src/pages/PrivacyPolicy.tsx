import React from 'react';
import ReactMarkdown from 'react-markdown';

const privacyPolicyContent = `
# Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

## 1. Introduction

Welcome to Toilet Guilt, a public bathroom directory service. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.

## 2. Information We Collect

### 2.1 Personal Information

We collect the following personal information:

- Name and contact information for business listings
- Payment information (processed securely through Stripe)
- Location data (with your permission)
- Email address for account creation and communication
- Business details for listing verification

### 2.2 Usage Data

We use Google Analytics to collect information about how you interact with our website, including:

- Pages visited and time spent
- Device and browser information
- IP address (anonymized)
- Search queries and filters used
- Click patterns and navigation paths

## 3. How We Use Your Information

We use the collected information to:

- Provide and maintain our services
- Process payments for business listings
- Improve user experience and service quality
- Send important updates and notifications
- Analyze website usage patterns
- Verify business listings
- Respond to user inquiries and support requests

## 4. Data Security

We implement appropriate security measures to protect your personal information, including:

- Encryption of sensitive data
- Secure payment processing through Stripe
- Regular security audits
- Access controls and authentication
- Secure data storage practices

However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.

## 5. Third-Party Services

We use the following third-party services:

- Google Analytics for website analytics
- Stripe for payment processing
- Cloud hosting providers for data storage
- Email service providers for communications

These services have their own privacy policies, and we encourage you to review them.

## 6. Your Rights

You have the right to:

- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Opt-out of marketing communications
- Export your data in a portable format
- Restrict or object to data processing

## 7. Data Retention

We do not maintain user accounts. For business information:
- We retain business listing information while the subscription is active
- We will delete business information upon request
- We may retain certain information as required by law or for legitimate business purposes

## 8. Children's Privacy

Our service is available to users of all ages. We do not collect age information from our users.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by:

- Posting the new policy on this page
- Updating the "Last updated" date
- Sending email notifications for significant changes

## 10. Contact Us

If you have any questions about this Privacy Policy, please contact us at:

Email: info@toiletguilt.com  
Address: Montreal, Canada
`;

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-lg dark:prose-invert">
      <ReactMarkdown>{privacyPolicyContent}</ReactMarkdown>
    </div>
  );
};

export default PrivacyPolicy; 