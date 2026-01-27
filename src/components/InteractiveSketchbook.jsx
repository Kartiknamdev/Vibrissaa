import { useState, useEffect, useRef } from 'react';
import './InteractiveSketchbook.css';
import useContentful from '../hooks/useContentful';

// Import sketch assets for fallback
import sketchArchitectural from '../assets/sketch_architectural.png';
import sketchFigure from '../assets/sketch_figure.png';
import sketchBotanical from '../assets/sketch_botanical.png';

const localArtworks = [
    {
        id: 1,
        image: sketchArchitectural,
        title: "Structural Rhythms",
        description: "A study of baroque architecture, exploring the dynamic interplay of light and shadow on stone facades. The rough charcoal texture captures the weight and history of the structure."
    },
    {
        id: 2,
        image: sketchFigure,
        title: "Motion in Graphite",
        description: "Capturing the fleeting essence of movement through gestural lines. This piece focuses on the energy of the dancer rather than anatomical precision, using loose strokes to imply velocity."
    },
    {
        id: 3,
        image: sketchBotanical,
        title: "Botanical Decay",
        description: "An ink and wash illustration examining the delicate beauty of a dried flower. Sepia tones and precise lining evoke the aesthetic of vintage scientific manuscripts."
    }
];

const InteractiveSketchbook = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGridOpen, setIsGridOpen] = useState(false);

    // Fetch remote data
    const { data: remoteArtworks, loading } = useContentful();

    // Use remote data if available, otherwise fallback to local
    const artworks = (remoteArtworks && remoteArtworks.length > 0) ? remoteArtworks : localArtworks;
    const currentArt = artworks[currentIndex] || localArtworks[0];

    // Reset index if data source changes
    useEffect(() => {
        if (currentIndex >= artworks.length) {
            setCurrentIndex(0);
        }
    }, [artworks, currentIndex]);


    // --- 3D Tilt Logic ---
    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();

        // Calculate mouse position (-0.5 to 0.5)
        // Constrain width/height to avoid extreme angles if mouse leaves quickly
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;

        // Set CSS variables for tilt (Max 15deg)
        // Note: RotateY relates to X movement, RotateX relates to Y movement (inverted)
        currentTarget.style.setProperty('--tx', `${-y * 15}deg`);
        currentTarget.style.setProperty('--ty', `${x * 15}deg`);

        // Lighting gradient position
        currentTarget.style.setProperty('--mx', `${50 + x * 80}%`);
        currentTarget.style.setProperty('--my', `${50 + y * 80}%`);
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.setProperty('--tx', `0deg`);
        e.currentTarget.style.setProperty('--ty', `0deg`);
        e.currentTarget.style.setProperty('--mx', `50%`);
        e.currentTarget.style.setProperty('--my', `50%`);
    };

    const handleBookClick = () => {
        if (!isExpanded) {
            setIsExpanded(true);
        }
    };

    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        touchEndX.current = null;
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) handleNext();
        if (isRightSwipe) handlePrev();
    };

    const handleNext = (e) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % artworks.length);
    };

    const handlePrev = (e) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
    };

    const toggleGrid = () => setIsGridOpen(!isGridOpen);

    const handleGridSelect = (index) => {
        setCurrentIndex(index);
        setIsGridOpen(false);
    };

    return (
        <div className="sketchbook-section">
            {/* Structural Glass Backdrop */}
            <div className="glass-backdrop" />

            <div className="sketchbook-container">

                {/* Left Panel: Description */}
                <div className={`description-panel ${isExpanded ? 'visible' : ''}`}>
                    <h3 className="sketch-title">{currentArt?.title}</h3>
                    <p className="sketch-description">{currentArt?.description}</p>
                    {loading && <p style={{ opacity: 0.5, fontSize: '0.8rem', marginTop: 'var(--spacing-md)' }}>Loading from Contentful...</p>}

                    {/* Grid Trigger */}
                    <button className="view-grid-btn" onClick={toggleGrid}>
                        <span className="grid-icon">▦</span> View Collection
                    </button>
                </div>

                {/* Right/Center Panel: Sketchbook */}
                <div
                    className={`sketchbook-wrapper ${isExpanded ? 'expanded' : ''}`}
                    onClick={handleBookClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="sketchbook">
                        <img
                            src={currentArt?.image}
                            alt={currentArt?.title}
                            className="sketch-image"
                            key={currentIndex}
                        />

                        {/* Paper Texture Overlay */}
                        <div className="paper-texture"></div>

                        {!isExpanded && (
                            <div className="interaction-hint">Click to Open</div>
                        )}

                        {isExpanded && artworks.length > 1 && (
                            <>
                                <button className="nav-button nav-prev" onClick={handlePrev} aria-label="Previous Artwork">
                                    ←
                                </button>
                                <button className="nav-button nav-next" onClick={handleNext} aria-label="Next Artwork">
                                    →
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>

            {/* Fluid Grid Overlay */}
            <div className={`grid-overlay ${isGridOpen ? 'open' : ''}`}>
                <button className="close-grid" onClick={toggleGrid}>×</button>
                <div className="grid-content">
                    {artworks.map((art, index) => (
                        <div
                            key={art.id || index}
                            className="grid-item"
                            onClick={() => handleGridSelect(index)}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <img src={art.image} alt={art.title} />
                            <span className="grid-title">{art.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InteractiveSketchbook;
