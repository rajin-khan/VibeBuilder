import { Loader2 } from 'lucide-react';
import {
  DashboardHeader,
  DashboardOverview,
  DashboardUserPlatform,
  DashboardUserActivityGraph,
  DashboardSystemOverview,
} from '@/modules/dashboard';
import { useGetAccount } from '@/modules/profile/hooks/use-account';

const DashboardLoader = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
};

export const DashboardPage = () => {
  const { isLoading } = useGetAccount();

  return (
    <>
      {isLoading ? (
        <DashboardLoader />
      ) : (
        <div className="relative isolate min-h-full overflow-hidden rounded-3xl border border-border/40 bg-transparent">
          <div className="relative z-10 flex flex-col gap-4">
            <div>
              <DashboardHeader />
            </div>
            <div>
              <DashboardOverview />
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
              <div className="min-w-0 flex-1">
                <DashboardUserPlatform />
              </div>
              <div className="min-w-0 flex-1">
                <DashboardUserActivityGraph />
              </div>
            </div>
            <div>
              <DashboardSystemOverview />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
