import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">
            CV Adaptatif
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Connexion
            </Link>
            <Link href="/signup" className={buttonVariants()}>
              S&apos;inscrire
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-3xl text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Un CV ciblé pour chaque offre,{" "}
            <span className="text-primary">en quelques secondes.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload ton CV une seule fois. Colle l&apos;offre d&apos;emploi.
            Notre IA génère un CV adapté, pertinent et téléchargeable en PDF.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className={buttonVariants({ size: "lg" })}
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Construit par Koudous DAOUDA · MVP 2026
      </footer>
    </div>
  );
}
