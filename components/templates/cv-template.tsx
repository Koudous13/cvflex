import type { CvProfile } from "@/lib/types";
import { THEMES, type CvTheme } from "./themes";
import type { TemplateId } from "@/lib/types";

type Props = {
  profile: CvProfile;
  templateId: TemplateId;
};

export function CvTemplate({ profile, templateId }: Props) {
  const theme = THEMES[templateId];
  const sidebarItems = renderSidebar(profile);
  const mainItems = renderMain(profile, theme);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: buildCss(theme) }} />
      <div className="cv">
        <aside className="sidebar">{sidebarItems}</aside>
        <main className="main">{mainItems}</main>
      </div>
    </>
  );
}

function renderSidebar(profile: CvProfile) {
  const initials = profile.fullName
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <div className="photo-wrapper">
        <div className="profile-avatar">{initials}</div>
      </div>
      <h1>{profile.fullName}</h1>
      {profile.headline && <div className="role">{profile.headline}</div>}

      <h2>Contact</h2>
      <ul className="contact-list">
        {profile.contact.location && (
          <li>
            <span className="icon">📍</span>
            {profile.contact.location}
          </li>
        )}
        {profile.contact.phone && (
          <li>
            <span className="icon">📞</span>
            {profile.contact.phone}
          </li>
        )}
        {profile.contact.email && (
          <li>
            <span className="icon">✉</span>
            {profile.contact.email}
          </li>
        )}
        {(profile.contact.links ?? []).map((link, i) => (
          <li key={i}>
            <span className="icon">🌐</span>
            <a href={link.url}>{link.label || link.url}</a>
          </li>
        ))}
      </ul>

      {profile.skills.technical.length > 0 && (
        <>
          <h2>Stack</h2>
          <div className="skill-tags">
            {profile.skills.technical.map((s, i) => (
              <span key={i} className="tag">
                {s}
              </span>
            ))}
          </div>
        </>
      )}

      {profile.skills.soft.length > 0 && (
        <>
          <h2>Soft Skills</h2>
          <ul className="soft-list">
            {profile.skills.soft.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}

      {profile.certifications.length > 0 && (
        <>
          <h2>Certifications</h2>
          <ul className="cert-list">
            {profile.certifications.map((s, i) => (
              <li key={i}>
                <span className="check">✓</span> {s}
              </li>
            ))}
          </ul>
        </>
      )}

      {profile.skills.languages.length > 0 && (
        <>
          <h2>Langues</h2>
          <ul className="soft-list">
            {profile.skills.languages.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function renderMain(profile: CvProfile, theme: CvTheme) {
  return (
    <>
      <div className="badge">⚡ {theme.badge}</div>

      {profile.summary && (
        <>
          <h2>Profil</h2>
          <p className="profile-text">{profile.summary}</p>
        </>
      )}

      {profile.experiences.length > 0 && (
        <>
          <h2>Expériences</h2>
          {profile.experiences.map((exp, i) => (
            <div key={i} className="exp">
              <div className="exp-header">
                <span>
                  <span className="exp-title">{exp.title}</span>
                  {exp.company && (
                    <>
                      {" · "}
                      <span className="exp-company">{exp.company}</span>
                    </>
                  )}
                </span>
                <span className="exp-date">{exp.period}</span>
              </div>
              {exp.location && <div className="exp-location">{exp.location}</div>}
              {exp.achievements.length > 0 && (
                <ul className="achievements">
                  {exp.achievements.map((a, j) => (
                    <li key={j}>{a}</li>
                  ))}
                </ul>
              )}
              {exp.stack && exp.stack.length > 0 && (
                <div className="stack">
                  {exp.stack.map((s, j) => (
                    <span key={j}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {profile.projects.length > 0 && (
        <>
          <h2>Projets</h2>
          {profile.projects.map((p, i) => (
            <div key={i} className="project">
              <div className="project-header">
                <span className="project-title">{p.name}</span>
              </div>
              <div className="project-desc">{p.description}</div>
              {p.stack && p.stack.length > 0 && (
                <div className="stack">
                  {p.stack.map((s, j) => (
                    <span key={j}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {profile.education.length > 0 && (
        <>
          <h2>Formation</h2>
          {profile.education.map((e, i) => (
            <div key={i} className="formation-item">
              <div className="title">{e.degree}</div>
              <div className="school">
                {e.school}
                {e.period ? ` — ${e.period}` : ""}
              </div>
              {e.details && <div className="details">{e.details}</div>}
            </div>
          ))}
        </>
      )}
    </>
  );
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
    .achievements {
      list-style: none; margin-top: 4px;
    }
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
