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
    const [isExpanded, setIsExpanded] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGridOpen, setIsGridOpen] = useState(false);

    // Swipe-to-Dismiss State
    const [swipeState, setSwipeState] = useState({
        isSwiping: false,
        startX: 0,
        currentX: 0,
        targetElement: null
    });

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

    // Lock Body Scroll when Grid is Open
    useEffect(() => {
        if (isGridOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isGridOpen]);

    // Dynamic Progressive Blur (Mobile Only)
    useEffect(() => {
        if (!isGridOpen || window.innerWidth > 768) return;

        const gridContent = document.querySelector('.grid-content');
        const gridItems = document.querySelectorAll('.grid-item');

        const updateBlur = () => {
            const stickyTop = 100; // Matches CSS sticky top value

            gridItems.forEach((item, index) => {
                const rect = item.getBoundingClientRect();
                const distanceFromTop = rect.top - stickyTop;

                // Calculate blur amount (0px when at sticky point, max 4px deeper in stack)
                // Cards above the sticky point: no blur
                // Cards at sticky point: no blur
                // Cards below: progressive blur based on distance
                let blurAmount = 0;
                let opacity = 1;

                if (distanceFromTop > 0) {
                    // Card is below focal point - apply progressive blur
                    // Use gentler curve: sqrt for smoother progression
                    const normalizedDistance = Math.min(distanceFromTop / 100, 10);
                    blurAmount = Math.sqrt(normalizedDistance) * 0.95; // Max ~3px blur
                    opacity = Math.max(1 - (distanceFromTop / 500), 0.95); // Slight fade
                }

                item.style.filter = blurAmount > 0.1 ? `blur(${blurAmount}px)` : 'none';
                item.style.opacity = opacity;
            });
        };

        // Update on scroll (throttled with rAF)
        let rafId;
        const handleScroll = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateBlur);
        };

        gridContent?.addEventListener('scroll', handleScroll, { passive: true });
        updateBlur(); // Initial render

        return () => {
            gridContent?.removeEventListener('scroll', handleScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isGridOpen]);

    // Swipe-to-Dismiss Handlers (Mobile Only)
    const handleTouchStart = (e, element) => {
        if (window.innerWidth > 768) return; // Desktop: disabled

        const touch = e.touches[0];
        setSwipeState({
            isSwiping: true,
            startX: touch.clientX,
            currentX: touch.clientX,
            targetElement: element
        });

        element.classList.add('swiping');
    };

    const handleTouchMove = (e) => {
        if (!swipeState.isSwiping || window.innerWidth > 768) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - swipeState.startX;
        const rotation = deltaX * 0.1; // Subtle rotation

        // Apply transform live
        swipeState.targetElement.style.transform =
            `translateX(${deltaX}px) rotate(${rotation}deg)`;

        setSwipeState(prev => ({ ...prev, currentX: touch.clientX }));
    };

    const handleTouchEnd = () => {
        if (!swipeState.isSwiping || window.innerWidth > 768) return;

        const deltaX = swipeState.currentX - swipeState.startX;
        const threshold = 120; // Minimum swipe distance

        if (Math.abs(deltaX) > threshold) {
            // Dismiss: Fly off screen
            const direction = deltaX > 0 ? 1 : -1;
            swipeState.targetElement.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease';
            swipeState.targetElement.style.transform =
                `translateX(${direction * window.innerWidth}px) rotate(${direction * 45}deg)`;
            swipeState.targetElement.style.opacity = '0';

            // Remove from DOM after animation
            setTimeout(() => {
                swipeState.targetElement.remove();
            }, 400);
        } else {
            // Snap back
            swipeState.targetElement.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            swipeState.targetElement.style.transform = '';
        }

        swipeState.targetElement.classList.remove('swiping');
        setSwipeState({ isSwiping: false, startX: 0, currentX: 0, targetElement: null });
    };


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
        } else {
            // If already expanded, clicking opens the grid
            toggleGrid();
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
                            onTouchStart={(e) => handleTouchStart(e, e.currentTarget)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
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
