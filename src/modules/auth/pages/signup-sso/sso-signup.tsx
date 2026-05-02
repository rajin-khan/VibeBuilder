import { useTranslation } from 'react-i18next';
import { SsoSignupForm } from '@/modules/auth/components/sso-signup/sso-signup-form';
import { Link, Navigate, useSearchParams } from 'react-router-dom';

export const SsoSignupPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const provider = searchParams.get('provider') ?? '';

  if (!email || !provider) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {t('COMPLETE_SIGNUP')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('ALREADY_HAVE_ACCOUNT')}{' '}
          <Link
            to="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t('LOG_IN')}
          </Link>
        </p>
      </div>
      <SsoSignupForm email={email} provider={provider} />
    </div>
  );
};
