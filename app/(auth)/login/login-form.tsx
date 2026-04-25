"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    login,
    null
  );
  const params = useSearchParams();
  const justSignedUp = params.get("signup") === "success";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Connecte-toi pour générer tes CVs adaptés.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {justSignedUp && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            Compte créé. Vérifie ta boîte mail pour confirmer ton adresse.
          </div>
        )}
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-medium text-foreground underline">
            S&apos;inscrire
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
