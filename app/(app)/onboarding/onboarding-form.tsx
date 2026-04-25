"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_SIZE = 5 * 1024 * 1024;

export function OnboardingForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    const file = formData.get("cv") as File | null;
    if (!file || file.size === 0) {
      toast.error("Sélectionne un fichier PDF.");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Le fichier dépasse 5 Mo.");
      return;
    }

    setPending(true);
    const tid = toast.loading("Analyse de ton CV en cours…");

    try {
      const res = await fetch("/api/upload-cv", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur lors de l'upload");

      toast.success("CV analysé avec succès.", { id: tid });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(msg, { id: tid });
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cv">Fichier PDF</Label>
        <Input
          id="cv"
          name="cv"
          type="file"
          accept="application/pdf"
          required
          disabled={pending}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Analyse en cours…" : "Uploader et analyser"}
      </Button>
    </form>
  );
}
