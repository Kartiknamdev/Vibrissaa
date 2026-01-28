import { useState, useEffect } from 'react'
import './App.css'
import HeroAnimation from './components/HeroAnimation';
import InteractiveSketchbook from './components/InteractiveSketchbook';
import ArtistStories from './components/ArtistStories';

// Import artwork images
import artworkAbstract from './assets/artwork_abstract_gold.png'
import artworkGeometric from './assets/artwork_geometric.png'
import artworkPortrait from './assets/artwork_portrait.png'

function App() {
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroTransform, setHeroTransform] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeStart = 300; // Approx 12 frames in

      let newOpacity = 1;
      let newTransform = 0;

      if (scrollY > fadeStart) {
        // Fade out over next 400px
        newOpacity = Math.max(0, 1 - (scrollY - fadeStart) / 400);
        newTransform = (scrollY - fadeStart) * 0.35;
      }

      setHeroOpacity(newOpacity);
      setHeroTransform(newTransform);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero">
        <HeroAnimation />
        <div
          className="hero-content"
          style={{
            opacity: heroOpacity,
            transform: `translateY(-${heroTransform}px)`,
            pointerEvents: heroOpacity === 0 ? 'none' : 'auto'
          }}
        >
          <p className="hero-subtitle">Curated Excellence</p>
          <h1 className="hero-title">Vibrissa</h1>
          <p className="hero-description">
            Where timeless artistry meets contemporary elegance. Discover a curated collection
            of extraordinary works that transcend the ordinary.
          </p>

          {/* Scroll Indicator */}
          <div className="scroll-indicator">
            <div className="mouse">
              <div className="wheel"></div>
            </div>
            <div className="arrow-scroll"></div>
          </div>
        </div>
      </section>

      {/* Features Section (Sketchbook) */}
      <section className="features section">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">From the Sketchbook</p>
            <h2 className="section-title">Process & Practice</h2>
            <p className="hero-description">
              Explore the raw, unfiltered creative process behind the masterpieces.
            </p>
          </div>

          <InteractiveSketchbook />
        </div>
      </section>

      {/* Artist Stories Section */}
      <section className="section">
        <ArtistStories />
      </section>

      

      {/* Footer - Artist Story */}
      <footer className="footer">
        <div className="container">
          {/* Artist Story Section */}
          <div className="artist-story-section">
            <p className="artist-intro">
              Welcome to <strong>Vibrissa</strong>, a space where technology meets creativity.
              This gallery belongs to <strong>Kartik Namdev</strong>, a cybersecurity student from Bhopal
              who finds art in the balance between logic and imagination.
            </p>

            <h3 className="artist-story-title">The Artist's Journey</h3>
            <p className="artist-description">
              Kartik's work is a blend of three passions that define his perspective:
            </p>

            <div className="pillars-grid">
              <div className="pillar">
                <div className="pillar-icon">📷</div>
                <h4 className="pillar-title">Photography</h4>
                <p className="pillar-description">
                  He uses his camera to capture the hidden geometry of the world.
                  By focusing on structure and light, he finds a sense of order in everyday moments.
                </p>
              </div>

              <div className="pillar">
                <div className="pillar-icon">🎵</div>
                <h4 className="pillar-title">Music</h4>
                <p className="pillar-description">
                  For Kartik, music is the rhythm behind the work. It sets the mood for every project,
                  acting as the bridge that connects his technical mind to his creative soul.
                </p>
              </div>

              <div className="pillar">
                <div className="pillar-icon">✏️</div>
                <h4 className="pillar-title">Drawing</h4>
                <p className="pillar-description">
                  This is where everything comes together. Kartik deconstructs complex subjects into
                  simple shapes, carefully layering details until a unique vision emerges on the page.
                </p>
              </div>
            </div>

            <p className="artist-closing">
              At <strong>Vibrissa</strong>, the art is more than just a picture—it's a look at the world
              through a lens of precision and passion.
            </p>
          </div>
          {/* Final CTA Section */}
      <section className="final-cta section">
        <div className="container">
          <div className="final-cta-content">
            <h2 className="final-cta-title">Curate Your World</h2>
            <p className="final-cta-description">
              Join our collector's circle. Receive exclusive early access to new releases.
            </p>

            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" className="newsletter-input" />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-links">
              <a
                href="https://github.com/Kartiknamdev"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                GitHub
              </a>
              <a
                href="https://instagram.com/kartikknamdev"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Instagram
              </a>
            </div>
            

            <p className="copyright">© 2026 Vibrissa by Kartik Namdev. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
