"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TEMPLATES, type TemplateId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function GenerateForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [templateId, setTemplateId] = useState<TemplateId>(TEMPLATES[0].id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const jobOffer = String(fd.get("jobOffer") ?? "").trim();
    const extraInfo = String(fd.get("extraInfo") ?? "").trim();

    if (jobOffer.length < 50) {
      toast.error("L'offre est trop courte (min 50 caractères).");
      return;
    }

    setPending(true);
    const tid = toast.loading("L'IA adapte ton CV à l'offre…");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobOffer,
          extraInfo: extraInfo || undefined,
          templateId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur de génération");

      toast.success("CV adapté généré.", { id: tid });
      router.push(`/cv/${json.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(msg, { id: tid });
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="jobOffer">Offre d&apos;emploi</Label>
        <Textarea
          id="jobOffer"
          name="jobOffer"
          rows={10}
          placeholder="Colle ici le texte de l'offre d'emploi…"
          required
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="extraInfo">
          Infos / projets supplémentaires{" "}
          <span className="text-muted-foreground">(optionnel)</span>
        </Label>
        <Textarea
          id="extraInfo"
          name="extraInfo"
          rows={4}
          placeholder="Ex: nouveau projet récent, certification, mission, etc."
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Template</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplateId(t.id)}
              disabled={pending}
              className={`text-left rounded-lg border p-3 transition-colors ${
                templateId === t.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted"
              }`}
            >
              <div className="font-medium text-sm">{t.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {t.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Génération…" : "Générer mon CV adapté"}
      </Button>
    </form>
  );
}
