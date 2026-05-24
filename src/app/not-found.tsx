import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  return (
    <Section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-grid bg-grid-fade" aria-hidden />
      <Container>
        <div className="mx-auto flex max-w-xl flex-col items-center text-center gap-6">
          <Badge variant="outline">404</Badge>
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
            We couldn&apos;t find <span className="text-gradient">that page.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The link may be broken, the page may have moved, or it may never
            have existed. Let&apos;s get you back on track.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button href="/">
              Back to home <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/docs" variant="outline">
              Read the docs
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
