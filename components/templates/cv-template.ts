import type { CvProfile, TemplateId } from "@/lib/types";
import { THEMES, type CvTheme } from "./themes";

function escape(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escape(s);
}

export function renderCvHtml(profile: CvProfile, templateId: TemplateId): string {
  const theme = THEMES[templateId];
  const css = buildCss(theme);
  const sidebar = renderSidebar(profile, theme);
  const main = renderMain(profile, theme);

  return `<style>${css}</style><div class="cv"><aside class="sidebar">${sidebar}</aside><main class="main">${main}</main></div>`;
}

export function renderCvDocument(profile: CvProfile, templateId: TemplateId): string {
  const inner = renderCvHtml(profile, templateId);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"/><title>${escape(profile.fullName)} — CV</title></head><body>${inner}</body></html>`;
}

function renderSidebar(profile: CvProfile, theme: CvTheme): string {
  const initials = profile.fullName
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const parts: string[] = [];

  parts.push(`<div class="photo-wrapper"><div class="profile-avatar">${escape(initials)}</div></div>`);
  parts.push(`<h1>${escape(profile.fullName)}</h1>`);
  if (profile.headline) {
    parts.push(`<div class="role">${escape(profile.headline)}</div>`);
  }

  const contactItems: string[] = [];
  if (profile.contact.location) {
    contactItems.push(`<li><span class="icon">📍</span>${escape(profile.contact.location)}</li>`);
  }
  if (profile.contact.phone) {
    contactItems.push(`<li><span class="icon">📞</span>${escape(profile.contact.phone)}</li>`);
  }
  if (profile.contact.email) {
    contactItems.push(`<li><span class="icon">✉</span>${escape(profile.contact.email)}</li>`);
  }
  for (const link of profile.contact.links ?? []) {
    contactItems.push(
      `<li><span class="icon">🌐</span><a href="${escapeAttr(link.url)}">${escape(link.label || link.url)}</a></li>`
    );
  }
  if (contactItems.length) {
    parts.push(`<h2>Contact</h2><ul class="contact-list">${contactItems.join("")}</ul>`);
  }

  if (profile.skills.technical.length > 0) {
    const tags = profile.skills.technical
      .map((s) => `<span class="tag">${escape(s)}</span>`)
      .join("");
    parts.push(`<h2>Stack</h2><div class="skill-tags">${tags}</div>`);
  }

  if (profile.skills.soft.length > 0) {
    const items = profile.skills.soft.map((s) => `<li>${escape(s)}</li>`).join("");
    parts.push(`<h2>Soft Skills</h2><ul class="soft-list">${items}</ul>`);
  }

  if (profile.certifications.length > 0) {
    const items = profile.certifications
      .map((s) => `<li><span class="check">✓</span> ${escape(s)}</li>`)
      .join("");
    parts.push(`<h2>Certifications</h2><ul class="cert-list">${items}</ul>`);
  }

  if (profile.skills.languages.length > 0) {
    const items = profile.skills.languages
      .map((s) => `<li>${escape(s)}</li>`)
      .join("");
    parts.push(`<h2>Langues</h2><ul class="soft-list">${items}</ul>`);
  }

  void theme;
  return parts.join("");
}

function renderMain(profile: CvProfile, theme: CvTheme): string {
  const parts: string[] = [];

  parts.push(`<div class="badge">⚡ ${escape(theme.badge)}</div>`);

  if (profile.summary) {
    parts.push(`<h2>Profil</h2><p class="profile-text">${escape(profile.summary)}</p>`);
  }

  if (profile.experiences.length > 0) {
    parts.push(`<h2>Expériences</h2>`);
    for (const exp of profile.experiences) {
      const company = exp.company
        ? ` · <span class="exp-company">${escape(exp.company)}</span>`
        : "";
      const location = exp.location
        ? `<div class="exp-location">${escape(exp.location)}</div>`
        : "";
      const achievements =
        exp.achievements.length > 0
          ? `<ul class="achievements">${exp.achievements
              .map((a) => `<li>${escape(a)}</li>`)
              .join("")}</ul>`
          : "";
      const stack =
        exp.stack && exp.stack.length > 0
          ? `<div class="stack">${exp.stack
              .map((s) => `<span>${escape(s)}</span>`)
              .join("")}</div>`
          : "";
      parts.push(
        `<div class="exp"><div class="exp-header"><span><span class="exp-title">${escape(
          exp.title
        )}</span>${company}</span><span class="exp-date">${escape(
          exp.period
        )}</span></div>${location}${achievements}${stack}</div>`
      );
    }
  }

  if (profile.projects.length > 0) {
    parts.push(`<h2>Projets</h2>`);
    for (const p of profile.projects) {
      const stack =
        p.stack && p.stack.length > 0
          ? `<div class="stack">${p.stack
              .map((s) => `<span>${escape(s)}</span>`)
              .join("")}</div>`
          : "";
      parts.push(
        `<div class="project"><div class="project-header"><span class="project-title">${escape(
          p.name
        )}</span></div><div class="project-desc">${escape(p.description)}</div>${stack}</div>`
      );
    }
  }

  if (profile.education.length > 0) {
    parts.push(`<h2>Formation</h2>`);
    for (const e of profile.education) {
      const period = e.period ? ` — ${escape(e.period)}` : "";
      const details = e.details
        ? `<div class="details">${escape(e.details)}</div>`
        : "";
      parts.push(
        `<div class="formation-item"><div class="title">${escape(
          e.degree
        )}</div><div class="school">${escape(e.school)}${period}</div>${details}</div>`
      );
    }
  }

  return parts.join("");
}

function buildCss(theme: CvTheme): string {
  const c = theme.colors;
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: ${c.text};
      background: ${c.bg};
      line-height: 1.5;
      font-size: 14px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cv {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      display: grid;
      grid-template-columns: 35% 65%;
      overflow: hidden;
    }
    .sidebar {
      background: linear-gradient(160deg, ${c.sidebarBg} 0%, ${c.sidebarBgEnd} 100%);
      color: ${c.sidebarText};
      padding: 32px 22px;
    }
    .photo-wrapper { display: flex; justify-content: center; margin-bottom: 18px; }
    .profile-avatar {
      width: 110px; height: 110px; border-radius: 50%;
      background: linear-gradient(135deg, ${c.primary}, ${c.accent});
      color: white; font-size: 36px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid ${c.primaryLight};
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .sidebar h1 {
      font-size: 26px; font-weight: 900; letter-spacing: -0.5px;
      margin-bottom: 4px; color: white;
    }
    .sidebar .role {
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 1px; margin-bottom: 24px;
      color: ${c.primaryLight};
    }
    .sidebar h2 {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 2px; color: ${c.primaryLight};
      margin: 22px 0 10px; padding-bottom: 6px;
      border-bottom: 1px solid ${c.primaryLight}40;
    }
    .contact-list, .cert-list, .soft-list { list-style: none; }
    .contact-list li {
      font-size: 11.5px; margin-bottom: 7px; color: ${c.sidebarText};
      word-break: break-word; display: flex; gap: 7px; align-items: flex-start;
    }
    .contact-list .icon { color: ${c.primaryLight}; flex-shrink: 0; width: 14px; }
    .contact-list a { color: ${c.sidebarText}; text-decoration: none; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tag {
      font-size: 10px; background: ${c.primaryLight}26;
      color: ${c.primaryLight}; padding: 3px 8px; border-radius: 4px;
      border: 1px solid ${c.primaryLight}50; font-weight: 500;
    }
    .cert-list li {
      font-size: 11px; padding: 5px 0; color: ${c.sidebarText};
      border-bottom: 1px dashed ${c.sidebarText}20;
    }
    .cert-list li:last-child { border: none; }
    .cert-list .check { color: ${c.primaryLight}; font-weight: bold; }
    .soft-list li {
      font-size: 11px; padding: 3px 0; color: ${c.sidebarText};
      position: relative; padding-left: 12px;
    }
    .soft-list li::before {
      content: "▸"; color: ${c.primaryLight};
      position: absolute; left: 0;
    }
    .main { padding: 36px 32px; }
    .badge {
      display: inline-block;
      background: linear-gradient(90deg, ${c.primary}, ${c.accent});
      color: white; font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1.2px;
      padding: 6px 12px; border-radius: 20px; margin-bottom: 12px;
    }
    .main h2 {
      font-size: 13px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 1.5px; margin: 18px 0 8px;
      color: ${c.primary}; padding-bottom: 5px;
      border-bottom: 2px solid ${c.primary};
      display: inline-block;
    }
    .main h2:first-of-type { margin-top: 0; }
    .profile-text {
      font-size: 12.5px; color: ${c.text};
      line-height: 1.65; margin-bottom: 8px;
    }
    .exp, .project {
      margin-bottom: 14px; padding-left: 14px;
      border-left: 3px solid ${c.primaryLight}; position: relative;
    }
    .exp::before, .project::before {
      content: ""; width: 8px; height: 8px;
      background: ${c.primary}; border-radius: 50%;
      position: absolute; left: -5.5px; top: 4px;
      box-shadow: 0 0 0 2.5px white;
    }
    .exp-header, .project-header {
      display: flex; justify-content: space-between;
      align-items: baseline; flex-wrap: wrap; gap: 5px; margin-bottom: 3px;
    }
    .exp-title, .project-title {
      font-size: 12.5px; font-weight: 700; color: ${c.text};
    }
    .exp-company { font-size: 11.5px; color: ${c.primary}; font-weight: 600; }
    .exp-date {
      font-size: 10.5px; color: ${c.textMuted};
      font-weight: 500; font-style: italic;
    }
    .exp-location { font-size: 10.5px; color: ${c.textMuted}; margin-bottom: 3px; }
    .achievements { list-style: none; margin-top: 4px; }
    .achievements li {
      font-size: 11.5px; color: ${c.text}; line-height: 1.55;
      padding: 1px 0 1px 12px; position: relative;
    }
    .achievements li::before {
      content: "•"; color: ${c.primary};
      position: absolute; left: 0; font-weight: bold;
    }
    .project-desc {
      font-size: 11.5px; color: ${c.text};
      line-height: 1.55; margin-top: 3px;
    }
    .stack { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
    .stack span {
      font-size: 9.5px; background: ${c.primaryLight}33;
      color: ${c.primaryDark}; padding: 2px 7px; border-radius: 3px;
      font-weight: 500;
    }
    .formation-item { margin-bottom: 9px; }
    .formation-item .title { font-size: 12px; font-weight: 700; }
    .formation-item .school { font-size: 11px; color: ${c.textMuted}; }
    .formation-item .details { font-size: 10.5px; color: ${c.textMuted}; margin-top: 2px; }
    @media print {
      body { background: white; }
      .cv { margin: 0; box-shadow: none; max-width: 100%; }
      @page { size: A4; margin: 0; }
    }
  `;
}
