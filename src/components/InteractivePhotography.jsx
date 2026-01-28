import React, { useState, useEffect, useRef } from 'react';
import './InteractiveSketchbook.css'; // Reuse styles
import './InteractivePhotography.css'; // Specific overrides

import useContentful from '../hooks/useContentful';

const localPhotos = [
    { id: 1, title: 'Urban Geometry', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1000&auto=format&fit=crop', description: 'Hidden patterns in the city skyline.' },
    { id: 2, title: 'Golden Hour', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c7dd1?q=80&w=1000&auto=format&fit=crop', description: 'Light breaking through the shadows.' },
    { id: 3, title: 'Neon Nights', image: 'https://images.unsplash.com/photo-1514565131-fce0801e5112?q=80&w=1000&auto=format&fit=crop', description: 'The city that never sleeps.' },
    { id: 4, title: 'Minimalist Structure', image: 'https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?q=80&w=1000&auto=format&fit=crop', description: 'Beauty in simplicity.' },
    { id: 5, title: 'Reflections', image: 'https://images.unsplash.com/photo-1518133529323-96b4ec2b5572?q=80&w=1000&auto=format&fit=crop', description: 'A parallel world in the water.' },
    { id: 6, title: 'Abstract Light', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop', description: 'Painting with photons.' },
];

const InteractivePhotography = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGridOpen, setIsGridOpen] = useState(false);
    const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
    const [showHints, setShowHints] = useState(false);

    // Fetch remote photos with tag 'frames'
    const { data: remotePhotos, loading } = useContentful('frames');

    // Use remote data if available, otherwise fallback to local
    const artworks = (remotePhotos && remotePhotos.length > 0) ? remotePhotos : localPhotos;
    const currentArt = artworks[currentIndex] || localPhotos[0];

    // Reset index if data source changes
    useEffect(() => {
        if (currentIndex >= artworks.length) setCurrentIndex(0);
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

    // Show Onboarding Hints (Every Time)
    useEffect(() => {
        if (!isGridOpen || window.innerWidth > 768) return;
        setShowHints(true);
        const timer = setTimeout(() => setShowHints(false), 4000);
        return () => clearTimeout(timer);
    }, [isGridOpen]);

    // Track Carousel Active Card (Mobile)
    useEffect(() => {
        if (!isGridOpen || window.innerWidth > 768) return;

        const gridContent = document.querySelector('.photography-grid .grid-content');
        if (!gridContent) return;

        const gridItems = gridContent.querySelectorAll('.grid-item');

        const updateActive = () => {
            const container = gridContent.getBoundingClientRect();
            const centerX = container.left + container.width / 2;
            let closestIndex = 0;
            let closestDistance = Infinity;

            gridItems.forEach((item, index) => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const distance = Math.abs(centerX - itemCenterX);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
                if (index === closestIndex) item.classList.add('carousel-active');
                else item.classList.remove('carousel-active');
            });
            setCarouselActiveIndex(closestIndex);
        };

        let rafId;
        const handleScroll = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateActive);
        };

        gridContent.addEventListener('scroll', handleScroll, { passive: true });
        setTimeout(updateActive, 100);
        return () => {
            gridContent.removeEventListener('scroll', handleScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isGridOpen]);

    // --- 3D Tilt Logic ---
    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;

        currentTarget.style.setProperty('--rotateY', `${x * 10}deg`); // Harder tilt
        currentTarget.style.setProperty('--rotateX', `${-y * 10}deg`);
        currentTarget.style.setProperty('--sheenX', `${50 + x * 40}%`);
        currentTarget.style.setProperty('--sheenY', `${50 + y * 40}%`);
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.setProperty('--rotateY', '0deg');
        e.currentTarget.style.setProperty('--rotateX', '0deg');
    };

    const toggleGrid = () => setIsGridOpen(!isGridOpen);
    const handleGridSelect = (index) => {
        setCurrentIndex(index);
        setIsGridOpen(false);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % artworks.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
    };

    // Interactive Dot Scrubbing (Mobile)
    const handleDotClick = (index) => {
        if (window.innerWidth > 768) return;
        const gridContent = document.querySelector('.photography-grid .grid-content');
        const targetCard = gridContent?.children[index];
        if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    // Dot Scrubbing Handlers
    const [dotScrubbing, setDotScrubbing] = useState(false);
    const handleDotTouchStart = (e, index) => {
        if (window.innerWidth > 768) return;
        e.stopPropagation();
        setDotScrubbing(true);
        handleDotClick(index);
    };
    const handleDotTouchMove = (e) => {
        if (!dotScrubbing || window.innerWidth > 768) return;
        const touch = e.touches[0];
        const dotElements = document.querySelectorAll('.photography-grid .carousel-dot');
        dotElements.forEach((dot, index) => {
            const rect = dot.getBoundingClientRect();
            if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                handleDotClick(index);
            }
        });
    };
    const handleDotTouchEnd = () => setDotScrubbing(false);

    return (
        <div className="sketchbook-section photography-mode">
            <div className="glass-backdrop" />

            <div className="sketchbook-container">
                {/* Left Panel: Description & Info */}
                <div className={`description-panel ${isExpanded ? 'visible' : ''}`}>
                    <div className="header-decoration">
                        <span className="edition-badge">Vibrissa Lens</span>
                        <span className="date-stamp">2026</span>
                    </div>

                    <h3 className="sketch-title">{currentArt.title}</h3>
                    <p className="sketch-description">{currentArt.description}</p>

                    <div className="meta-data" style={{ marginTop: '20px', marginBottom: '30px' }}>
                        <div className="meta-item">
                            <span className="label">Medium</span>
                            <span className="value">Digital Photography</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Focus</span>
                            <span className="value">Structure & Light</span>
                        </div>
                    </div>

                    <button className="view-grid-btn" onClick={toggleGrid}>
                        View Collection
                    </button>
                </div>

                {/* Right Panel: Photography Frame */}
                <div
                    className={`sketchbook-wrapper ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => !isExpanded && setIsExpanded(true)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div
                        className="sketchbook landscape-orientation"
                        style={{ width: '550px', height: '400px', cursor: 'pointer' }}
                        onClick={toggleGrid}
                    >
                        <img
                            src={currentArt.image}
                            alt={currentArt.title}
                            className="sketch-image main-artwork landscape"
                        />
                        <div className="glass-reflection"></div>
                        <div className="texture-overlay"></div>

                        {/* Controls Overlay on Image (optional, or can be outside) */}
                        <div className="interactive-controls" style={{
                            position: 'absolute',
                            bottom: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <button className="control-btn" onClick={handlePrev}>←</button>
                            <span className="counter" style={{ margin: '0 20px', color: 'rgba(255,255,255,0.6)' }}>{currentIndex + 1} / {artworks.length}</span>
                            <button className="control-btn" onClick={handleNext}>→</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fluid Grid Overlay */}
            <div className={`grid-overlay photography-grid ${isGridOpen ? 'open' : ''}`}>
                <button className="close-grid" onClick={toggleGrid}>×</button>
                <div className="grid-content">
                    {/* Onboarding Hints */}
                    {showHints && window.innerWidth <= 768 && (
                        <>
                            <div className="carousel-hint">👆 Swipe to browse</div>
                            <div className="dots-hint">Tap or drag dots to navigate</div>
                        </>
                    )}

                    {artworks.map((art, index) => (
                        <div
                            key={art.id || index}
                            className="grid-item"
                            onClick={() => handleGridSelect(index)}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <img src={art.image} alt={art.title} className="loaded" />
                            <span className="grid-title">{art.title}</span>
                        </div>
                    ))}
                </div>

                {/* Navigation Dots */}
                {window.innerWidth <= 768 && (
                    <div className="carousel-dots" onTouchMove={handleDotTouchMove} onTouchEnd={handleDotTouchEnd}>
                        {artworks.map((_, index) => (
                            <div
                                key={index}
                                className={`carousel-dot ${index === carouselActiveIndex ? 'active' : ''}`}
                                onClick={() => handleDotClick(index)}
                                onTouchStart={(e) => handleDotTouchStart(e, index)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InteractivePhotography;
