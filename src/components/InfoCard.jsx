import './InfoCard.css';

export default function InfoCard({ project, index, total, onBack }) {
  const show = project !== null && project !== undefined;

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
          ? `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
          : ''}
      </div>

      <h2>{project?.title ?? ''}</h2>
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
    </div>
  );
}
