import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  // Load common namespace for 404 page text
  const { t } = useTranslation('common'); 

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-6 text-center">
           <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
           {/* Use keys from common namespace, e.g., common:notFound.title */}
           <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('notFound.title', {defaultValue: 'Page Not Found'})}</h1>
           <p className="text-gray-600">
            {t('notFound.message', {defaultValue: 'The page you requested could not be found.'})}
          </p>
          {/* Optionally add a button to go back home */}
          {/* 
          <Button variant="link" onClick={() => window.location.href = '/'} className="mt-4">
            {t('notFound.goHome', {defaultValue: 'Go Home'})}
          </Button>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
