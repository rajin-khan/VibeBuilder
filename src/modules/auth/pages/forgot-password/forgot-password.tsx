import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ForgotpasswordForm } from '@/modules/auth/components/forgot-password';
import { Button } from '@/components/ui-kit/button';

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {t('FORGOT_YOUR_PASSWORD')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('ENTER_YOUR_REGISTERED_EMAIL')}</p>
      </div>
      <ForgotpasswordForm />
      <Link to="/login">
        <Button className="w-full font-semibold text-primary" size="lg" variant="ghost">
          {t('GO_TO_LOGIN')}
        </Button>
      </Link>
    </div>
  );
};
