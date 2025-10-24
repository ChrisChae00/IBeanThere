import { useTranslations } from 'next-intl';

export function useErrorTranslator() {
  const t = useTranslations('errors');

  const translateError = (errorMessage: string): string => {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': t('invalid_credentials'),
      'Email not confirmed': t('email_not_confirmed'),
      'Too many requests': t('too_many_requests'),
      'User not found': t('user_not_found'),
      'Invalid email': t('invalid_email'),
      'Password should be at least 6 characters': t('weak_password'),
      'Unable to validate email address: invalid format': t('invalid_email'),
      'Signup requires a valid password': t('signup_password_required'),
      'User already registered': t('email_already_exists'),
    };
    
    return errorMap[errorMessage] || errorMessage;
  };

  return { translateError };
}
