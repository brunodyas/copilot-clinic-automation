import './credits.css';

const LINKEDIN = 'https://www.linkedin.com/in/brunodyas/';
const GITHUB = 'https://github.com/brunodyas';

export function CreditsPage() {
  return (
    <section className="credits-page" aria-labelledby="credits-title">
      <header className="credits-header">
        <p className="credits-eyebrow">Créditos</p>
        <h1 id="credits-title">Bruno Dias de Amorim</h1>
        <p className="credits-tagline">
          Backend Architect | Distributed Systems &amp; Cloud (AWS, Kubernetes) | Java,
          .NET (C#), Python, Node.js | RoR &amp; Laravel | Secure &amp; Scalable Systems |
          20+ yrs building production systems | Open to Opportunities
        </p>
      </header>

      <div className="credits-links">
        <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="credits-link">
          LinkedIn — brunodyas
        </a>
        <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="credits-link credits-link--secondary">
          GitHub — brunodyas
        </a>
      </div>

      <p className="credits-note">
        Arquitetura, evolução do produto e entrega técnica conduzidas por Bruno Dias de Amorim.
      </p>
    </section>
  );
}

export default CreditsPage;
