import {
  ArrowRightIcon,
  Component1Icon,
  ImageIcon,
  RocketIcon,
} from '@radix-ui/react-icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui-kit/dialog';
import { Button } from '@/components/ui-kit/button';

const GUIDE_IMAGE = '/vibe-assets/onboarding-guide.webp';

const guideSteps = [
  {
    icon: Component1Icon,
    title: 'Start from a structure',
    body: 'Pick a blank canvas or a template that already has the right story arc.',
  },
  {
    icon: ImageIcon,
    title: 'Tune the blocks',
    body: 'Drag, reorder, edit copy, choose media, and adjust style from the studio sidebar.',
  },
  {
    icon: RocketIcon,
    title: 'Publish deliberately',
    body: 'Draft changes stay private until you publish the page to its live route.',
  },
];

export const OnboardingGuideDialog = ({
  open,
  onOpenChange,
  onStart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl overflow-hidden border-border bg-card p-0 shadow-[0_28px_90px_-44px_rgba(0,0,0,0.95)]">
      <div className="grid md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[18rem] overflow-hidden bg-[#070A12]">
          <img
            src={GUIDE_IMAGE}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,18,0.04),rgba(7,10,18,0.72))]" />
          <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-[rgba(247,244,234,0.12)] bg-[#070A12]/82 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Launch path
            </p>
            <p className="mt-1 text-sm font-semibold text-[#f7f4ea]">
              Template → edit → publish
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
              Build a polished site in one focused pass.
            </DialogTitle>
            <DialogDescription className="leading-6">
              Vibe is designed around a short, repeatable workflow so you can move from idea to
              live page without hunting through settings.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-3">
            {guideSteps.map((step, index) => (
              <div
                key={step.title}
                className="grid grid-cols-[2rem_1fr] gap-3 rounded-xl border border-border bg-background p-3"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-primary-50 text-primary">
                  <step.icon className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              I&apos;ll explore
            </Button>
            <Button type="button" onClick={onStart}>
              Start with templates
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
