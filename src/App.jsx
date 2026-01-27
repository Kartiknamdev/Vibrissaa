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

            <div className="footer-links">
              <span>Instagram</span>
              <span>Twitter</span>
              <span>Artsy</span>
            </div>

            <p className="copyright">© 2026 Vibrissa. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
