import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';

export default function Portfolio() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleTheme = () => setIsDark(!isDark);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const pages = ['home', 'about', 'projects', 'cv'];
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Me' },
    { id: 'projects', label: 'Projects' },
    { id: 'cv', label: 'Digital CV' }
  ];

  return (
    <div className={isDark ? 'dark' : 'light'} style={getThemeStyles(isDark)}>
      {/* Navigation */}
      <nav style={styles.nav(isDark)}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>Portfolio</div>
          
          {/* Desktop Menu */}
          {!isMobile && (
            <div style={styles.desktopMenu}>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  style={styles.navButton(currentPage === item.id, isDark)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Theme Toggle & Mobile Menu */}
          <div style={styles.navControls}>
            <button
              onClick={toggleTheme}
              style={styles.themeToggle(isDark)}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={styles.mobileMenuBtn(isDark)}
                className="mobile-menu-btn"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <div style={styles.mobileMenu(isDark)}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  closeMobileMenu();
                }}
                style={styles.mobileMenuItem(currentPage === item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Content */}
      <main style={styles.main}>
        {currentPage === 'home' && <HomePage isDark={isDark} scroll={scrollPosition} />}
        {currentPage === 'about' && <AboutPage isDark={isDark} />}
        {currentPage === 'projects' && <ProjectsPage isDark={isDark} />}
        {currentPage === 'cv' && <CVPage isDark={isDark} />}
      </main>

      {/* Footer */}
      <footer style={styles.footer(isDark)}>
        <p>© 2024 Jason. All rights reserved.</p>
      </footer>
    </div>
  );
}

function HomePage({ isDark, scroll }) {
  const parallaxOffset = scroll * 0.5;

  return (
    <div>
      {/* Hero Section with Parallax */}
      <section style={styles.heroSection(isDark, parallaxOffset)}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Jason</h1>
          <p style={styles.heroSubtitle}>Software Engineering Programme Leader</p>
          <p style={styles.heroDescription}>
            Curriculum design • Educational technology • Digital skills training
          </p>
          <button style={styles.cta}>Get in touch</button>
        </div>
      </section>

      {/* Intro Section */}
      <section style={styles.sectionWithBg(isDark, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop')}>
        <div style={styles.sectionOverlay(isDark)}></div>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle(isDark)}>Welcome</h2>
          <p style={styles.sectionText(isDark)}>
            I lead software engineering education at Blackpool and The Fylde College, 
            developing curricula and interactive tools for aspiring developers. My focus 
            is on practical, hands-on learning that bridges education and industry.
          </p>
        </div>
      </section>

      {/* Parallax Section 2 */}
      <section style={styles.parallaxSectionWithBg(isDark, scroll * 0.3, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop')}>
        <div style={styles.parallaxOverlay(isDark)}></div>
        <div style={styles.parallaxContent}>
          <h2 style={styles.parallaxText}>Building the next generation of developers</h2>
        </div>
      </section>

      {/* Featured Work Preview */}
      <section style={styles.sectionWithBg(isDark, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop')}>
        <div style={styles.sectionOverlay(isDark)}></div>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle(isDark)}>Featured Work</h2>
          <div style={styles.cardsGrid}>
            {[
              { title: 'Flutter Masterclass', desc: 'Interactive tutorial platform for mobile development' },
              { title: 'ToyBox E-Commerce', desc: 'Full-stack e-commerce application' },
              { title: 'Canvas Integration', desc: 'LMS automation with Power Automate' }
            ].map((card, i) => (
              <div key={i} style={styles.card(isDark)}>
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardDesc}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AboutPage({ isDark }) {
  return (
    <section style={styles.fullPageSectionWithBg(isDark, 'https://images.unsplash.com/photo-1522202176988-66695d0d4d34?w=1200&h=600&fit=crop')}>
      <div style={styles.pageOverlay(isDark)}></div>
      <div style={styles.pageContent}>
        <h1 style={styles.pageTitle(isDark)}>About Me</h1>
        
        <div style={styles.aboutGrid}>
          <div>
            <h2 style={styles.subsectionTitle(isDark)}>Background</h2>
            <p style={styles.bodyText(isDark)}>
              I'm the Programme Leader for Software Engineering at Blackpool and The Fylde College, 
              where I design and deliver Level 4+ curricula in modern software development. 
              My teaching spans databases, C++, Python, Flutter, and data analysis.
            </p>
          </div>

          <div>
            <h2 style={styles.subsectionTitle(isDark)}>Focus Areas</h2>
            <ul style={styles.list(isDark)}>
              <li>Curriculum design & development</li>
              <li>Educational technology tools</li>
              <li>Digital skills training</li>
              <li>Cross-functional integration</li>
              <li>Modern development practices</li>
            </ul>
          </div>

          <div>
            <h2 style={styles.subsectionTitle(isDark)}>Tech Stack</h2>
            <ul style={styles.list(isDark)}>
              <li>Frontend: React, Flutter, HTML/CSS</li>
              <li>Backend: Python, C++, databases</li>
              <li>Tools: Canvas LMS, Power Automate, Git</li>
              <li>Platforms: Web, mobile, cloud</li>
            </ul>
          </div>

          <div>
            <h2 style={styles.subsectionTitle(isDark)}>Interests</h2>
            <p style={styles.bodyText(isDark)}>
              Beyond education, I'm passionate about gaming, exploring emerging technologies, 
              and creating tools that make learning more accessible and engaging.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectsPage({ isDark }) {
  const projects = [
    {
      title: 'Flutter Masterclass',
      description: 'Interactive web-based tutorial platform for teaching Flutter development',
      tags: ['Flutter', 'React', 'Education'],
      url: 'daci-learn.uk'
    },
    {
      title: 'ToyBox E-Commerce',
      description: 'Full-stack e-commerce application with modern development practices',
      tags: ['Frontend', 'Backend', 'Full-stack'],
      url: '#'
    },
    {
      title: 'Canvas LMS Integration',
      description: 'Automated workflow integration with Power Automate for Canvas learning management',
      tags: ['LMS', 'Automation', 'Integration'],
      url: '#'
    },
    {
      title: 'Student Booking System',
      description: 'Session booking platform for summer digital skills enrichment programme',
      tags: ['Booking', 'Scheduling', 'Web'],
      url: '#'
    },
    {
      title: 'Wyre Council Presentation',
      description: 'Interactive presentation showcasing B&FC digital training offerings',
      tags: ['Presentation', 'Training', 'Web'],
      url: '#'
    },
    {
      title: 'Educational Tools Suite',
      description: 'Collection of interactive tools built for Software Engineering curriculum delivery',
      tags: ['Education', 'Tools', 'Interactive'],
      url: '#'
    }
  ];

  return (
    <section style={styles.fullPageSectionWithBg(isDark, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop')}>
      <div style={styles.pageOverlay(isDark)}></div>
      <div style={styles.pageContent}>
        <h1 style={styles.pageTitle(isDark)}>Projects</h1>
        <p style={styles.introText(isDark)}>
          A selection of projects from curriculum development, educational tools, and full-stack applications.
        </p>

        <div style={styles.projectsGrid}>
          {projects.map((project, i) => (
            <div key={i} style={styles.projectCard(isDark)}>
              <h3 style={styles.projectTitle}>{project.title}</h3>
              <p style={styles.projectDesc}>{project.description}</p>
              <div style={styles.tags}>
                {project.tags.map((tag, j) => (
                  <span key={j} style={styles.tag(isDark)}>{tag}</span>
                ))}
              </div>
              {project.url !== '#' && (
                <a href={`https://${project.url}`} style={styles.projectLink} target="_blank" rel="noopener noreferrer">
                  View →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CVPage({ isDark }) {
  return (
    <section style={styles.fullPageSectionWithBg(isDark, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop')}>
      <div style={styles.pageOverlay(isDark)}></div>
      <div style={styles.pageContent}>
        <h1 style={styles.pageTitle(isDark)}>Digital CV</h1>

        <div style={styles.cvSection}>
          <h2 style={styles.subsectionTitle(isDark)}>Current Position</h2>
          <div style={styles.cvItem}>
            <h3 style={styles.cvTitle}>Programme Leader - Software Engineering</h3>
            <p style={styles.cvMeta}>Blackpool and The Fylde College | Blackpool, UK</p>
            <p style={styles.bodyText(isDark)}>
              Leading curriculum development and delivery for Level 4+ Software Engineering programmes. 
              Responsible for course design, student instruction, and integration of modern development practices 
              into educational frameworks.
            </p>
          </div>
        </div>

        <div style={styles.cvSection}>
          <h2 style={styles.subsectionTitle(isDark)}>Expertise</h2>
          <div style={styles.skillsGrid}>
            <div>
              <h3 style={styles.skillCategory}>Languages</h3>
              <p style={styles.bodyText(isDark)}>Python, C++, JavaScript, SQL, Dart</p>
            </div>
            <div>
              <h3 style={styles.skillCategory}>Frontend</h3>
              <p style={styles.bodyText(isDark)}>React, Flutter, HTML, CSS, Responsive Design</p>
            </div>
            <div>
              <h3 style={styles.skillCategory}>Backend & Tools</h3>
              <p style={styles.bodyText(isDark)}>Databases, Canvas LMS, Power Automate, Git</p>
            </div>
            <div>
              <h3 style={styles.skillCategory}>Teaching</h3>
              <p style={styles.bodyText(isDark)}>Curriculum Design, Technical Training, Mentoring</p>
            </div>
          </div>
        </div>

        <div style={styles.cvSection}>
          <h2 style={styles.subsectionTitle(isDark)}>Download</h2>
          <button style={styles.downloadBtn}>
            Download Full CV (PDF)
          </button>
        </div>
      </div>
    </section>
  );
}

// Theme and Style Functions
function getThemeStyles(isDark) {
  return {
    '--bg-primary': isDark ? '#0a0e27' : '#ffffff',
    '--bg-secondary': isDark ? '#151c3a' : '#f8f9fa',
    '--text-primary': isDark ? '#e8eaed' : '#1a1a1a',
    '--text-secondary': isDark ? '#9ca3af' : '#666666',
    '--accent': '#06d6a0',
    '--accent-dark': '#04a876',
    '--border': isDark ? '#2d3748' : '#e0e0e0',
    '--card-bg': isDark ? '#1f2a4a' : '#f5f5f5',
  };
}

const styles = {
  nav: (isDark) => ({
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: isDark ? 'var(--bg-secondary)' : 'var(--bg-primary)',
    borderBottom: '1px solid var(--border)',
    backdropFilter: 'blur(10px)',
    backgroundColor: isDark ? 'rgba(21, 28, 58, 0.95)' : 'rgba(255, 255, 255, 0.95)',
  }),

  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--accent)',
    letterSpacing: '0.05em',
  },

  desktopMenu: {
    display: 'flex',
    gap: '2rem',
  },

  navButton: (isActive, isDark) => ({
    background: 'none',
    border: 'none',
    color: isActive ? 'var(--accent)' : 'var(--text-primary)',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontWeight: isActive ? 600 : 400,
    transition: 'color 0.3s ease',
    paddingBottom: '0.5rem',
    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
  }),

  navControls: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },

  themeToggle: (isDark) => ({
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  mobileMenuBtn: (isDark) => ({
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '0.5rem',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  mobileMenu: (isDark) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 2rem',
    borderTop: '1px solid var(--border)',
    gap: '0.5rem',
  }),

  mobileMenuItem: (isActive) => ({
    background: 'none',
    border: 'none',
    color: isActive ? 'var(--accent)' : 'var(--text-primary)',
    fontSize: '1rem',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0.75rem 0',
    fontWeight: isActive ? 600 : 400,
  }),

  main: {
    minHeight: 'calc(100vh - 70px)',
  },

  heroSection: (isDark, offset) => ({
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url(https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundPositionY: `${offset}px`,
    position: 'relative',
    overflow: 'hidden',
  }),

  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 39, 0.7)',
    zIndex: 1,
  },

  heroContent: {
    textAlign: 'center',
    zIndex: 2,
    maxWidth: '600px',
    padding: '2rem',
    position: 'relative',
  },

  sectionWithBg: (isDark, bgImage) => ({
    padding: '6rem 2rem',
    backgroundColor: 'var(--bg-primary)',
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    position: 'relative',
  }),

  sectionOverlay: (isDark) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDark ? 'rgba(10, 14, 39, 0.75)' : 'rgba(255, 255, 255, 0.85)',
    zIndex: 0,
  }),

  heroTitle: {
    fontSize: 'clamp(3rem, 10vw, 6rem)',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    marginBottom: '1rem',
  },

  heroSubtitle: {
    fontSize: 'clamp(1.25rem, 3vw, 2rem)',
    color: 'var(--accent)',
    fontWeight: 600,
    marginBottom: '1rem',
  },

  heroDescription: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
    lineHeight: 1.6,
  },

  cta: {
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: 'var(--accent)',
    color: '#000',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: 'var(--accent-dark)',
    },
  },



  parallaxContent: {
    textAlign: 'center',
    zIndex: 2,
    position: 'relative',
  },

  fullPageSectionWithBg: (isDark, bgImage) => ({
    minHeight: '100vh',
    padding: '6rem 2rem',
    backgroundColor: 'var(--bg-primary)',
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    position: 'relative',
  }),

  pageOverlay: (isDark) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDark ? 'rgba(10, 14, 39, 0.75)' : 'rgba(255, 255, 255, 0.85)',
    zIndex: 0,
  }),

  parallaxText: {
    fontSize: 'clamp(2rem, 6vw, 4rem)',
    color: 'var(--accent)',
    fontWeight: 700,
    maxWidth: '700px',
    lineHeight: 1.2,
  },



  sectionContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },

  parallaxSectionWithBg: (isDark, offset, bgImage) => ({
    height: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundPositionY: `${offset}px`,
    position: 'relative',
  }),

  parallaxOverlay: (isDark) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDark ? 'rgba(10, 14, 39, 0.6)' : 'rgba(255, 255, 255, 0.8)',
    zIndex: 0,
  }),

  sectionTitle: (isDark) => ({
    fontSize: '2.5rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '2rem',
  }),

  sectionText: (isDark) => ({
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
    maxWidth: '700px',
  }),

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
    position: 'relative',
    zIndex: 1,
  },

  card: (isDark) => ({
    padding: '2rem',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '0.75rem',
    border: '1px solid var(--border)',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: isDark ? '#252f4a' : '#ececec',
      borderColor: 'var(--accent)',
    },
  }),

  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.75rem',
  },

  cardDesc: {
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },



  pageContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },

  pageTitle: (isDark) => ({
    fontSize: '3.5rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: '2rem',
    letterSpacing: '-0.02em',
  }),

  aboutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '3rem',
    marginTop: '3rem',
    position: 'relative',
    zIndex: 1,
  },

  subsectionTitle: (isDark) => ({
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--accent)',
    marginBottom: '1rem',
  }),

  bodyText: (isDark) => ({
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
    fontSize: '1rem',
  }),

  list: (isDark) => ({
    listStyle: 'none',
    padding: 0,
  }),

  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
    position: 'relative',
    zIndex: 1,
  },

  projectCard: (isDark) => ({
    padding: '2rem',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '0.75rem',
    border: '1px solid var(--border)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  }),

  projectTitle: {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.75rem',
  },

  projectDesc: {
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
    flex: 1,
  },

  tags: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },

  tag: (isDark) => ({
    display: 'inline-block',
    padding: '0.35rem 0.75rem',
    backgroundColor: isDark ? '#1f2a4a' : '#e8e8e8',
    color: isDark ? 'var(--accent)' : '#04a876',
    fontSize: '0.85rem',
    borderRadius: '0.35rem',
    border: `1px solid ${isDark ? '#2d3a5a' : '#d0d0d0'}`,
  }),

  projectLink: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
    transition: 'color 0.3s ease',
  },

  introText: (isDark) => ({
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    maxWidth: '600px',
    lineHeight: 1.8,
  }),

  cvItem: {
    marginTop: '1.5rem',
    position: 'relative',
    zIndex: 1,
  },

  cvTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },

  cvMeta: {
    color: 'var(--accent)',
    fontSize: '0.95rem',
    marginBottom: '1rem',
    fontWeight: 500,
  },

  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginTop: '1.5rem',
    position: 'relative',
    zIndex: 1,
  },

  cvSection: {
    marginTop: '3rem',
    paddingBottom: '3rem',
    borderBottom: '1px solid var(--border)',
    position: 'relative',
    zIndex: 1,
  },

  skillCategory: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--accent)',
    marginBottom: '0.5rem',
  },

  downloadBtn: {
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: 'var(--accent)',
    color: '#000',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'all 0.3s ease',
  },

  footer: (isDark) => ({
    backgroundColor: isDark ? '#0a0e27' : '#f5f5f5',
    borderTop: '1px solid var(--border)',
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--text-secondary)',
  }),
};
