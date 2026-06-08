import './InfoCard.css';

export default function InfoCard({ project, index, total, onBack }) {
  const show    = project !== null && project !== undefined;
  const isAbout = project?.type === 'about';
  // Total shown in counter excludes the About card (always last)
  const projectCount = total - 1;

  return (
    <div
      className={`card${show ? ' show' : ''}`}
      style={show ? { '--accent': project.accent } : {}}
    >
      <svg className="leaf" viewBox="0 0 40 40">
        <path
          d="M20 2 C28 10 34 14 36 26 C30 22 26 26 20 38 C14 26 10 22 4 26 C6 14 12 10 20 2Z"
          fill="var(--accent, #1b3fd4)"
        />
      </svg>

      <div className="idx">
        {show
          ? isAbout
            ? 'ABOUT ME'
            : `${String(index + 1).padStart(2, '0')} / ${String(projectCount).padStart(2, '0')}`
          : ''}
      </div>

      <h2>{project?.title ?? ''}</h2>

      {isAbout ? (
        <>
          <p className="role">{project.role}</p>
          <p>{project.bio}</p>
          <div className="skills">
            {project.skills.map(s => (
              <span key={s} className="skill">{s}</span>
            ))}
          </div>
          <div className="row">
            <a
              className="btn visit"
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
            <a
              className="btn email"
              href={project.links.email}
            >
              Email ↗
            </a>
            <button className="btn back" onClick={onBack}>Back</button>
          </div>
        </>
      ) : (
        <>
          <p>{project?.subtitle ?? ''}</p>
          <div className="row">
            {show && (
              <a
                className="btn visit"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit site ↗
              </a>
            )}
            <button className="btn back" onClick={onBack}>Back</button>
          </div>
        </>
      )}
    </div>
  );
}
