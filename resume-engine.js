// resume-engine.js — template definitions + rendering logic for the Free Resume Builder.
// 15 templates, organized by role/industry archetype, built on 5 distinct layout structures.
// No template claims endorsement by any named company — guidance describes genuine
// industry hiring conventions only.

const RESUME_TEMPLATES = [
  {id:'tech', name:'Tech & Software Engineering', category:'Technology', layout:'L2', accent:'#1759A8',
   tagline:'Skills-forward layout that puts your stack and projects front and center.',
   tips:'Lead with technologies and quantified project impact (e.g. "cut API latency 40%"). Keep bullet points action-first and avoid walls of text — engineering recruiters skim fast.'},
  {id:'data', name:'Data Science & Analytics', category:'Technology', layout:'L3', accent:'#4338CA',
   tagline:'Dense, metrics-driven layout for highlighting impact across several short projects.',
   tips:'Quantify everything possible — model accuracy, revenue impact, time saved. List tools (Python, SQL, etc.) in a dedicated skills block so they’re easy for both humans and ATS parsers to find.'},
  {id:'finance', name:'Finance & Investment Banking', category:'Finance & Business', layout:'L1', accent:'#0F2A44',
   tagline:'The conservative one-page chronological format common in banking and corporate finance recruiting.',
   tips:'Keep it to one page, reverse-chronological, no graphics. Lead each bullet with hard numbers — deal size, AUM, % growth — this field rewards precision over prose.'},
  {id:'consulting', name:'Management Consulting', category:'Finance & Business', layout:'L1', accent:'#1F2937',
   tagline:'Clean, structured, achievement-led format suited to consulting-style recruiting.',
   tips:'Use the situation-action-result pattern in every bullet. Consulting resumes are screened fast and heavily on structure — consistent formatting matters as much as content.'},
  {id:'marketing', name:'Marketing & Brand', category:'Finance & Business', layout:'L2', accent:'#DB5A42',
   tagline:'A confident layout with room to showcase campaigns, channels, and growth numbers.',
   tips:'Name the channels you’ve owned (paid social, SEO, lifecycle) and attach a number to each campaign — reach, conversion lift, CAC reduction. Specifics beat adjectives.'},
  {id:'sales', name:'Sales & Business Development', category:'Finance & Business', layout:'L2', accent:'#15803D',
   tagline:'Built to foreground quota attainment, revenue numbers, and client wins.',
   tips:'Quota attainment % and revenue figures belong at the top of your bullets, not buried at the end. Recruiters in sales hiring scan for numbers first.'},
  {id:'hr', name:'Human Resources', category:'Finance & Business', layout:'L3', accent:'#0E7C99',
   tagline:'Balanced two-column format for both people-process expertise and HR metrics.',
   tips:'Pair "soft" achievements (culture, retention programs) with hard numbers (retention rate, time-to-hire, headcount managed) — HR resumes that skip metrics tend to blend together.'},
  {id:'creative', name:'Creative & Design', category:'Creative', layout:'L4', accent:'#7C3AED',
   tagline:'A bolder, portfolio-adjacent layout with personality.',
   tips:'Link your portfolio prominently near the top — for creative roles, the resume’s job is to get someone to click through, not to tell the whole story itself.'},
  {id:'academic', name:'Academic & Research', category:'Academic & Specialized', layout:'L5', accent:'#1F2937',
   tagline:'Traditional CV format for publications, research experience, and multi-page academic records.',
   tips:'Unlike other fields, academic CVs can run multiple pages. Lead with research focus and publications; teaching and grants typically follow, ordered by relevance to the specific role.'},
  {id:'healthcare', name:'Healthcare & Nursing', category:'Academic & Specialized', layout:'L4', accent:'#0E8F6F',
   tagline:'Clear, credential-forward layout for licenses, certifications, and clinical experience.',
   tips:'Put license numbers, certifications, and clinical hours where they’re impossible to miss — credentialing is usually the first filter in healthcare hiring.'},
  {id:'government', name:'Government & Civil Services', category:'Academic & Specialized', layout:'L1', accent:'#7A1F2B',
   tagline:'A formal, conservative single-column format suited to government and public-sector applications.',
   tips:'Follow the exact format requested in the job notification where one exists — many government roles require specific bio-data formats. Use this as a strong general-purpose base.'},
  {id:'legal', name:'Legal', category:'Academic & Specialized', layout:'L1', accent:'#1A2B4C',
   tagline:'Precise, formal structure consistent with legal industry conventions.',
   tips:'List matters, clients (where permitted), and practice areas precisely. Legal hiring rewards exactness over creative framing — keep language formal throughout.'},
  {id:'operations', name:'Operations & Project Management', category:'Finance & Business', layout:'L3', accent:'#475569',
   tagline:'Process- and metrics-oriented layout for showcasing cross-functional delivery.',
   tips:'Name the methodology (Agile, Six Sigma, PMP) and the scale you managed (budget, team size, timeline) — operations hiring screens heavily for scale and process fluency.'},
  {id:'fresher', name:'Entry-Level / Fresher', category:'Career Stage', layout:'L4', accent:'#2563EB',
   tagline:'Skills- and education-forward format for candidates with limited work history.',
   tips:'Put education and relevant coursework/projects near the top since work history is short. Internships, academic projects, and certifications carry real weight here — don’t undersell them.'},
  {id:'executive', name:'Executive / Leadership', category:'Career Stage', layout:'L5', accent:'#111827',
   tagline:'A senior-level format with room for a leadership narrative and career-spanning achievements.',
   tips:'Open with a brief leadership narrative, not just a job list. Board roles, P&L scale, and org size matter more at this level than day-to-day task descriptions.'},
];

function esc(s){return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function dateRange(e){return `${esc(e.start)} – ${e.current?'Present':esc(e.end)}`;}

function expBlock(exp){
  return (exp||[]).map(e=>`
    <div class="r-entry">
      <div class="r-entry-top"><span class="r-entry-title">${esc(e.role)} · ${esc(e.company)}</span><span class="r-entry-date">${dateRange(e)}</span></div>
      ${e.location?`<div class="r-entry-sub">${esc(e.location)}</div>`:''}
      <ul class="r-bullets">${(e.bullets||[]).filter(b=>b.trim()).map(b=>`<li>${esc(b)}</li>`).join('')}</ul>
    </div>`).join('');
}
function eduBlock(edu){
  return (edu||[]).map(e=>`
    <div class="r-entry">
      <div class="r-entry-top"><span class="r-entry-title">${esc(e.degree)} · ${esc(e.school)}</span><span class="r-entry-date">${esc(e.start)} – ${esc(e.end)}</span></div>
      ${e.details?`<div class="r-entry-sub">${esc(e.details)}</div>`:''}
    </div>`).join('');
}
function projBlock(proj){
  return (proj||[]).map(p=>`<div class="r-entry"><div class="r-entry-top"><span class="r-entry-title">${esc(p.name)}</span></div><div class="r-entry-sub">${esc(p.description)}</div></div>`).join('');
}
function certBlock(certs){
  return (certs||[]).map(c=>`<li>${esc(c.name)}${c.issuer?' — '+esc(c.issuer):''}${c.year?' ('+esc(c.year)+')':''}</li>`).join('');
}
function skillsList(skills){return (skills||[]).filter(s=>s.trim()).map(s=>`<span class="r-pill">${esc(s)}</span>`).join('');}
function contactLine(d){return [d.email,d.phone,d.location,d.linkedin,d.website].filter(Boolean).map(esc).join('  ·  ');}

// ---------- LAYOUT L1: Classic Single-Column ----------
function layoutL1(d,t){
  return `<div class="resume-doc layout-L1" style="--r-accent:${t.accent}">
    <header class="r-header r-header-classic"><h1>${esc(d.name)||'Your Name'}</h1><div class="r-title">${esc(d.title)}</div><div class="r-contact">${contactLine(d)}</div></header>
    ${d.summary?`<section class="r-section"><h2>Summary</h2><p class="r-summary">${esc(d.summary)}</p></section>`:''}
    ${d.experience&&d.experience.length?`<section class="r-section"><h2>Experience</h2>${expBlock(d.experience)}</section>`:''}
    ${d.education&&d.education.length?`<section class="r-section"><h2>Education</h2>${eduBlock(d.education)}</section>`:''}
    ${d.skills&&d.skills.length?`<section class="r-section"><h2>Skills</h2><div class="r-pills">${skillsList(d.skills)}</div></section>`:''}
    ${d.certifications&&d.certifications.length?`<section class="r-section"><h2>Certifications</h2><ul class="r-bullets">${certBlock(d.certifications)}</ul></section>`:''}
  </div>`;
}
// ---------- LAYOUT L2: Modern Sidebar ----------
function layoutL2(d,t){
  return `<div class="resume-doc layout-L2" style="--r-accent:${t.accent}">
    <aside class="r-sidebar">
      <h1>${esc(d.name)||'Your Name'}</h1><div class="r-title">${esc(d.title)}</div>
      <div class="r-side-block"><h3>Contact</h3><div class="r-side-contact">${[d.email,d.phone,d.location,d.linkedin,d.website].filter(Boolean).map(esc).join('<br>')}</div></div>
      ${d.skills&&d.skills.length?`<div class="r-side-block"><h3>Skills</h3><div class="r-pills">${skillsList(d.skills)}</div></div>`:''}
      ${d.languages&&d.languages.length?`<div class="r-side-block"><h3>Languages</h3><div class="r-pills">${skillsList(d.languages)}</div></div>`:''}
    </aside>
    <main class="r-main">
      ${d.summary?`<section class="r-section"><h2>Summary</h2><p class="r-summary">${esc(d.summary)}</p></section>`:''}
      ${d.experience&&d.experience.length?`<section class="r-section"><h2>Experience</h2>${expBlock(d.experience)}</section>`:''}
      ${d.education&&d.education.length?`<section class="r-section"><h2>Education</h2>${eduBlock(d.education)}</section>`:''}
      ${d.projects&&d.projects.length?`<section class="r-section"><h2>Projects</h2>${projBlock(d.projects)}</section>`:''}
    </main>
  </div>`;
}
// ---------- LAYOUT L3: Two-Column Compact ----------
function layoutL3(d,t){
  return `<div class="resume-doc layout-L3" style="--r-accent:${t.accent}">
    <header class="r-header r-header-compact"><h1>${esc(d.name)||'Your Name'}</h1><div class="r-title">${esc(d.title)}</div><div class="r-contact">${contactLine(d)}</div></header>
    ${d.summary?`<section class="r-section r-full"><h2>Summary</h2><p class="r-summary">${esc(d.summary)}</p></section>`:''}
    <div class="r-cols">
      <div class="r-col-main">
        ${d.experience&&d.experience.length?`<section class="r-section"><h2>Experience</h2>${expBlock(d.experience)}</section>`:''}
        ${d.projects&&d.projects.length?`<section class="r-section"><h2>Projects</h2>${projBlock(d.projects)}</section>`:''}
      </div>
      <div class="r-col-side">
        ${d.education&&d.education.length?`<section class="r-section"><h2>Education</h2>${eduBlock(d.education)}</section>`:''}
        ${d.skills&&d.skills.length?`<section class="r-section"><h2>Skills</h2><div class="r-pills">${skillsList(d.skills)}</div></section>`:''}
        ${d.certifications&&d.certifications.length?`<section class="r-section"><h2>Certifications</h2><ul class="r-bullets">${certBlock(d.certifications)}</ul></section>`:''}
      </div>
    </div>
  </div>`;
}
// ---------- LAYOUT L4: Minimal Timeline ----------
function layoutL4(d,t){
  return `<div class="resume-doc layout-L4" style="--r-accent:${t.accent}">
    <header class="r-header r-header-minimal"><h1>${esc(d.name)||'Your Name'}</h1><div class="r-title">${esc(d.title)}</div><div class="r-contact">${contactLine(d)}</div></header>
    ${d.summary?`<section class="r-section"><p class="r-summary">${esc(d.summary)}</p></section>`:''}
    ${d.skills&&d.skills.length?`<section class="r-section"><h2>Skills</h2><div class="r-pills">${skillsList(d.skills)}</div></section>`:''}
    ${d.experience&&d.experience.length?`<section class="r-section r-timeline"><h2>Experience</h2>${expBlock(d.experience)}</section>`:''}
    ${d.education&&d.education.length?`<section class="r-section r-timeline"><h2>Education</h2>${eduBlock(d.education)}</section>`:''}
    ${d.certifications&&d.certifications.length?`<section class="r-section"><h2>Certifications</h2><ul class="r-bullets">${certBlock(d.certifications)}</ul></section>`:''}
  </div>`;
}
// ---------- LAYOUT L5: Academic / Executive CV ----------
function layoutL5(d,t){
  return `<div class="resume-doc layout-L5" style="--r-accent:${t.accent}">
    <header class="r-header r-header-cv"><h1>${esc(d.name)||'Your Name'}</h1><div class="r-title">${esc(d.title)}</div><div class="r-contact">${contactLine(d)}</div></header>
    ${d.summary?`<section class="r-section"><h2>Profile</h2><p class="r-summary">${esc(d.summary)}</p></section>`:''}
    ${d.experience&&d.experience.length?`<section class="r-section"><h2>Experience</h2>${expBlock(d.experience)}</section>`:''}
    ${d.education&&d.education.length?`<section class="r-section"><h2>Education</h2>${eduBlock(d.education)}</section>`:''}
    ${d.projects&&d.projects.length?`<section class="r-section"><h2>Projects / Publications</h2>${projBlock(d.projects)}</section>`:''}
    ${d.certifications&&d.certifications.length?`<section class="r-section"><h2>Certifications & Affiliations</h2><ul class="r-bullets">${certBlock(d.certifications)}</ul></section>`:''}
    ${d.skills&&d.skills.length?`<section class="r-section"><h2>Skills</h2><div class="r-pills">${skillsList(d.skills)}</div></section>`:''}
  </div>`;
}

const LAYOUT_FNS={L1:layoutL1,L2:layoutL2,L3:layoutL3,L4:layoutL4,L5:layoutL5};

function renderResume(data, templateId){
  const t = RESUME_TEMPLATES.find(x=>x.id===templateId) || RESUME_TEMPLATES[0];
  const fn = LAYOUT_FNS[t.layout] || layoutL1;
  return fn(data||{}, t);
}

function getTemplate(id){return RESUME_TEMPLATES.find(t=>t.id===id)||RESUME_TEMPLATES[0];}
