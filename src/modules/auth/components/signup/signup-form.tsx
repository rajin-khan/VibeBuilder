import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui-kit/form';
import { Input } from '@/components/ui-kit/input';
import { Button } from '@/components/ui-kit/button';
import { Captcha, useCaptcha } from '@/components/core';
import { signupFormDefaultValue, signupFormType, getSignupFormValidationSchema } from './utils';
import { useSignupByEmail } from '../../hooks/use-auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui-kit/checkbox';
import { HttpError } from '@/lib/https';

/**
 * SignupForm Component
 *
 * A user registration form component that collects username (email) and handles user registration.
 * It ensures basic validation using a Zod schema for secure form submission.
 *
 * Features:
 * - Username (email) field with validation
 * - Form validation using Zod and React Hook Form
 * - Terms of Service and Privacy Policy acknowledgement checkbox
 * - Loading state handling during async submission
 *
 */

export const SignupForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [signupErrorMessage, setSignupErrorMessage] = useState('');

  const form = useForm<signupFormType>({
    defaultValues: signupFormDefaultValue,
    resolver: zodResolver(getSignupFormValidationSchema(t)),
  });

  const { mutateAsync } = useSignupByEmail();
  const googleSiteKey = import.meta.env.VITE_CAPTCHA_SITE_KEY || '';
  const captchaEnabled = googleSiteKey !== '';
  const captchaType =
    import.meta.env.VITE_CAPTCHA_TYPE === 'reCaptcha' ? 'reCaptcha-v2-checkbox' : 'hCaptcha';

  const {
    code: captchaCode,
    captcha,
    reset: resetCaptcha,
  } = useCaptcha({
    siteKey: googleSiteKey,
    type: captchaType,
  });

  const { isValid } = form.formState;

  const getSignupFailureMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    const errorBody = error instanceof HttpError ? error.error : null;
    const backendErrors =
      errorBody && typeof errorBody === 'object' && 'errors' in errorBody
        ? (errorBody.errors as Record<string, string>)
        : null;

    if (backendErrors?.already_signup || message.includes('already_signup')) {
      return t('EMAIL_ALREADY_REGISTERED');
    }

    if (message.includes('sign-up is disabled')) {
      return 'Blocks IAM returned: sign-up is disabled for this environment.';
    }

    const firstBackendMessage = backendErrors ? Object.values(backendErrors)[0] : undefined;
    return firstBackendMessage || message || t('SOMETHING_WENT_WRONG');
  };

  const onSubmitHandler = async (values: signupFormType) => {
    try {
      setSignupErrorMessage('');
      const response = await mutateAsync({
        ...values,
        captchaCode,
      });
      if (response?.isSuccess === false) {
        const message =
          response.errors?.already_signup ||
          Object.values(response.errors ?? {})[0] ||
          t('SOMETHING_WENT_WRONG');
        setSignupErrorMessage(message);
        resetCaptcha();
        return undefined;
      }
      return navigate(`/sent-email`);
    } catch (error) {
      const message = getSignupFailureMessage(error);
      setSignupErrorMessage(message);
      resetCaptcha();
      toast({ variant: 'destructive', title: t('ERROR'), description: message });
      return undefined;
    }
  };

  useEffect(() => {
    if (!isValid && captchaCode) resetCaptcha();
  }, [captchaCode, isValid, resetCaptcha]);

  return (
    <>
      {signupErrorMessage !== '' && (
        <div className="w-full">
          <div className="rounded-lg bg-error-background border border-error p-4">
            <p className="text-xs font-normal text-error-high-emphasis">
              {signupErrorMessage}
            </p>
          </div>
        </div>
      )}
      <Form {...form}>
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmitHandler)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-high-emphasis font-normal">{t('EMAIL')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('ENTER_YOUR_EMAIL')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center">
            <div className="flex items-start gap-2 mt-5 mb-2">
              <Checkbox
                id="terms-checkbox"
                checked={isTermsAccepted}
                onCheckedChange={(checked: boolean) => setIsTermsAccepted(checked)}
                className="mt-1"
              />
              <label
                htmlFor="terms-checkbox"
                className="text-medium-emphasis font-normal leading-5 cursor-pointer"
              >
                {t('I_AGREE_TO')}{' '}
                <span className="text-primary underline hover:text-primary-600">
                  <a href="https://selisegroup.com/software-development-terms/">
                    {t('TERM_OF_SERVICE')}
                  </a>
                </span>{' '}
                {t('ACKNOWLEDGE_I_HAVE_READ')}{' '}
                <span className="text-primary underline hover:text-primary-600">
                  <a href="https://selisegroup.com/privacy-policy/">{t('PRIVACY_POLICY')}</a>
                </span>
              </label>
            </div>
          </div>

          {captchaEnabled && (
            <div className="my-4">
              <Captcha {...captcha} theme="light" size="normal" />
            </div>
          )}

          <div className="flex gap-10 mt-2">
            <Button
              className="flex-1 font-extrabold"
              size="lg"
              type="submit"
              disabled={!isTermsAccepted || (captchaEnabled && !captchaCode)}
            >
              {t('SIGN_UP')}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
