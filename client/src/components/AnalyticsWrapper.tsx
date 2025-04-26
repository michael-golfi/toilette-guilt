import { useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '@/lib/analytics';

interface AnalyticsWrapperProps {
  children: ReactNode;
}

const AnalyticsWrapper = ({ children }: AnalyticsWrapperProps) => {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view when location changes
    trackPageView(location);
  }, [location]);

  return <>{children}</>;
};

export default AnalyticsWrapper; 