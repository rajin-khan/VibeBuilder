import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GRANT_TYPES } from '@/constant/auth';
import { Divider } from '@/components/core';
import { SsoSignin } from '../signin-sso';
import { SigninEmail } from '../signin-email';
import { useGetLoginOptions, useGetSignupSettings } from '../../hooks/use-auth';
import { Button } from '@/components/ui-kit/button';
import { useAuthStore } from '@/state/store/auth';
import { LOCAL_DEMO_EMAIL, LOCAL_DEMO_OWNER_ID } from '../../utils/demo-session';

const createLocalDemoToken = () => {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return [
    encode({ alg: 'none', typ: 'JWT' }),
    encode({
      sub: 'local-demo-user',
      email: LOCAL_DEMO_EMAIL,
      org_id: LOCAL_DEMO_OWNER_ID,
      name: 'Demo Builder',
      vibe_builder_demo: true,
    }),
    'local-demo-signature',
  ].join('.');
};

export const Signin = () => {
  const { data: loginOption } = useGetLoginOptions();
  const { data: signupSettings } = useGetSignupSettings();
  const { login, setTokens } = useAuthStore();

  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const ssoError = location.state?.ssoError;

  const passwordGrantAllowed = !!loginOption?.allowedGrantTypes?.includes(GRANT_TYPES.password);
  const socialGrantAllowed =
    !!loginOption?.allowedGrantTypes?.includes(GRANT_TYPES.social) &&
    !!loginOption?.ssoInfo?.length;
  const oidcGrantAllowed = !!loginOption?.allowedGrantTypes?.includes(GRANT_TYPES.oidc);

  const isDivider = passwordGrantAllowed && (socialGrantAllowed || oidcGrantAllowed);

  const isBannerAllowedToVisible = [
    'localhost',
    '127.0.0.1',
    '::1',
    'construct.seliseblocks.com',
    'stg-construct.seliseblocks.com',
    'dev-construct.seliseblocks.com',
  ].some((domain) => window.location.hostname === domain);

  const canUseLocalDemo = import.meta.env.DEV;
  const canSignup =
    signupSettings?.isEmailPasswordSignUpEnabled ||
    signupSettings?.isSSoSignUpEnabled ||
    signupSettings === undefined;

  const continueAsLocalDemo = () => {
    const token = createLocalDemoToken();
    login(token, token);
    setTokens({ accessToken: token, refreshToken: token });
    navigate('/app', { replace: true });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Log in to Vibe
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t('DONT_HAVE_ACCOUNT')}{' '}
          <Link
            to="/signup"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t('SIGN_UP')}
          </Link>
        </p>
        {!canSignup && (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Signup is currently disabled in IAM settings. The route stays available for when
            registration is enabled.
          </p>
        )}
      </div>

      {ssoError && (
        <div className="rounded-lg border border-error/30 bg-error-background p-4">
          <p className="text-xs font-medium text-error-high-emphasis">{ssoError}</p>
        </div>
      )}

      {isBannerAllowedToVisible && (
        <p className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs leading-5 text-muted-foreground">
          Use a Blocks IAM account for this project, or open the local demo workspace.
        </p>
      )}

      <div className="w-full flex flex-col gap-4">
        {passwordGrantAllowed && <SigninEmail />}
        {isDivider && <Divider text={t('AUTH_OR')} />}
        {socialGrantAllowed && loginOption && <SsoSignin loginOption={loginOption} />}
      </div>

      {canUseLocalDemo && (
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <p className="text-xs leading-5 text-muted-foreground">
            Just exploring? Demo mode keeps everything on this device.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full border-white/10 bg-background/70 hover:bg-background"
            onClick={continueAsLocalDemo}
          >
            Continue in demo workspace
          </Button>
        </div>
      )}
    </div>
  );
};
