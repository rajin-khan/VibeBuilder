import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Divider } from '@/components/core';
import { SignupForm } from '@/modules/auth/components/signup';
import { useGetSignupSettings, useGetLoginOptions } from '@/modules/auth/hooks/use-auth';
import { SsoSignin } from '@/modules/auth/components/signin-sso';
import { Input } from '@/components/ui-kit/input';
import { Button } from '@/components/ui-kit/button';
import { useAuthStore } from '@/state/store/auth';
import { LOCAL_DEMO_OWNER_ID } from '@/modules/auth/utils/demo-session';

const createLocalSignupToken = (email: string, name: string) => {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return [
    encode({ alg: 'none', typ: 'JWT' }),
    encode({
      sub: LOCAL_DEMO_OWNER_ID,
      email,
      org_id: LOCAL_DEMO_OWNER_ID,
      name,
      vibe_builder_demo: true,
    }),
    'local-demo-signature',
  ].join('.');
};

const LocalDemoSignup = () => {
  const navigate = useNavigate();
  const { login, setTokens } = useAuthStore();
  const [name, setName] = useState('Demo Builder');
  const [email, setEmail] = useState('demo@blockloom.local');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = createLocalSignupToken(email.trim(), name.trim() || 'Demo Builder');
    login(token, token);
    setTokens({ accessToken: token, refreshToken: token });
    navigate('/app', { replace: true });
  };

  return (
    <div className="rounded-xl border border-white/12 bg-[#12151f] p-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Hosted signup is disabled for this project right now. Create a local demo workspace to test
        the builder without sending account data to the identity service.
      </p>
      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-high-emphasis" htmlFor="local-signup-name">
            Name
          </label>
          <Input
            id="local-signup-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-high-emphasis" htmlFor="local-signup-email">
            Email
          </label>
          <Input
            id="local-signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Create demo workspace
        </Button>
      </form>
    </div>
  );
};

export const SignupPage = () => {
  const { t } = useTranslation();
  const { data: signupSettings, isLoading: loadingSignupSettings } = useGetSignupSettings();
  const { data: loginOption } = useGetLoginOptions();

  const hasSignupSettings = signupSettings !== undefined;
  const isEmailPasswordSignUpEnabled = signupSettings?.isEmailPasswordSignUpEnabled === true;
  const isSSoSignUpEnabled = signupSettings?.isSSoSignUpEnabled === true;
  const showSsoSignup = isSSoSignUpEnabled && !!loginOption?.ssoInfo?.length;
  const showEmailSignup =
    isEmailPasswordSignUpEnabled ||
    (import.meta.env.DEV && !loadingSignupSettings && !hasSignupSettings);
  const showLocalDemoSignup =
    import.meta.env.DEV &&
    !loadingSignupSettings &&
    hasSignupSettings &&
    !isEmailPasswordSignUpEnabled &&
    !isSSoSignUpEnabled;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Start building
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t('ALREADY_HAVE_ACCOUNT')}{' '}
          <Link
            to="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t('LOG_IN')}
          </Link>
        </p>
      </div>
      {loadingSignupSettings ? (
        <div className="rounded-xl border border-white/10 bg-[#141820] p-4 text-sm text-muted-foreground">
          Checking Blocks IAM signup settings...
        </div>
      ) : null}
      {showEmailSignup ? (
        <div>
          <SignupForm />
        </div>
      ) : null}
      {showLocalDemoSignup ? <LocalDemoSignup /> : null}
      {!import.meta.env.DEV &&
      hasSignupSettings &&
      !isEmailPasswordSignUpEnabled &&
      !isSSoSignUpEnabled ? (
        <div className="rounded-xl border border-white/10 bg-[#141820] p-4 text-sm text-muted-foreground">
          Signup is currently disabled in Blocks IAM settings. Ask the project admin to enable email
          signup or create an IAM account for you.
        </div>
      ) : null}
      <p className="text-xs leading-5 text-muted-foreground">
        Accounts include a private workspace, media library, draft pages, and a live publishing
        route once IAM activation is complete.
      </p>
      <div>
        {showEmailSignup && showSsoSignup ? <Divider text={t('OR_CONTINUE_WITH')} /> : null}
        {showSsoSignup && loginOption ? <SsoSignin loginOption={loginOption} /> : null}
      </div>
    </div>
  );
};
