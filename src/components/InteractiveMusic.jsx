import React, { useState, useEffect, useRef } from 'react';
import './InteractiveSketchbook.css';
import './InteractiveMusic.css';
import useYouTube from '../hooks/useYouTube';

const InteractiveMusic = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGridOpen, setIsGridOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Player State
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const playerRef = useRef(null);
    const progressInterval = useRef(null);

    // Fetch YouTube Data
    const { data: youtubeData, loading } = useYouTube();

    // Fallback data if API fails or loads
    const fallbackData = [{
        id: 'dQw4w9WgXcQ',
        title: 'Loading...',
        artist: 'Vibrissa',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop'
    }];

    const artworks = (youtubeData && youtubeData.length > 0) ? youtubeData : fallbackData;
    const currentArt = artworks[currentIndex] || fallbackData[0];

    // Initialize YouTube IFrame API
    useEffect(() => {
        // Load API script
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Init Player when API is ready
        window.onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player('youtube-player-hidden', {
                height: '0',
                width: '0',
                videoId: currentArt.id,
                playerVars: {
                    'playsinline': 1,
                    'controls': 0
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        };

        return () => {
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
        };
    }, []);

    // Helper: Load new video when index changes
    useEffect(() => {
        if (playerRef.current && playerRef.current.loadVideoById) {
            // If was playing, keep playing new track
            if (isPlaying) {
                playerRef.current.loadVideoById(currentArt.id);
            } else {
                playerRef.current.cueVideoById(currentArt.id);
            }
        }
    }, [currentIndex, currentArt.id]);

    const onPlayerReady = (event) => {
        setDuration(event.target.getDuration());
    };

    const onPlayerStateChange = (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDuration(playerRef.current.getDuration());
            startProgressTimer();
        } else {
            setIsPlaying(false);
            stopProgressTimer();
        }

        // Auto-next logic
        if (event.data === window.YT.PlayerState.ENDED) {
            handleNext();
        }
    };

    const startProgressTimer = () => {
        stopProgressTimer();
        progressInterval.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime());
            }
        }, 500);
    };

    const stopProgressTimer = () => {
        if (progressInterval.current) clearInterval(progressInterval.current);
    };

    const handleSeek = (e) => {
        if (!playerRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.min(Math.max(x / rect.width, 0), 1);
        const newTime = percentage * duration;

        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    const togglePlay = (e) => {
        if (e) e.stopPropagation();
        if (!playerRef.current || !playerRef.current.playVideo) return;

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    // Format Time (mm:ss)
    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // 3D Tilt Logic
    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;
        currentTarget.style.setProperty('--rotateY', `${x * 10}deg`);
        currentTarget.style.setProperty('--rotateX', `${-y * 10}deg`);
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.setProperty('--rotateY', '0deg');
        e.currentTarget.style.setProperty('--rotateX', '0deg');
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
    const handleGridSelect = (index) => { setCurrentIndex(index); setIsGridOpen(false); };

    return (
        <div className="sketchbook-section music-mode">
            <div className="glass-backdrop" />

            {/* Hidden Player */}
            <div id="youtube-player-hidden" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}></div>

            <div className="sketchbook-container">
                {/* Left Panel: Description & Playlist Info */}
                <div className={`description-panel ${isExpanded ? 'visible' : ''}`}>
                    <div className="header-decoration">
                        <span className="edition-badge">Vibrissa Sound</span>
                        <span className="date-stamp">Vol. 01</span>
                    </div>

                    <h3 className="sketch-title">{currentArt.title}</h3>
                    <p className="sketch-artist">{currentArt.artist}</p>
                    <p className="sketch-description" style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                        {currentIndex + 1} of {artworks.length} | {currentArt.description || 'Featured Track'}
                    </p>

                    <button className="view-grid-btn" onClick={toggleGrid} style={{ marginBottom: '30px' }}>
                        View Library
                    </button>

                    {/* Player Controls (Desktop Only - Left Side) */}
                    <div className="player-controls-container desktop-controls-only" style={{ width: '100%', padding: '0' }}>
                        <div className="player-ui">
                            <div className="progress-bar" onClick={handleSeek}>
                                <div
                                    className="progress-fill"
                                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                ></div>
                            </div>
                            <div className="time-stamps">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="interactive-controls" style={{ justifyContent: 'flex-start', gap: '30px' }}>
                            <button className="control-btn" onClick={handlePrev}>⏮</button>
                            <button className={`control-btn play-main ${isPlaying ? 'active' : ''}`} onClick={togglePlay}>
                                {isPlaying ? (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                ) : (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}><path d="M8 5v14l11-7z" /></svg>
                                )}
                            </button>
                            <button className="control-btn" onClick={handleNext}>⏭</button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Album Art & Controls */}
                <div className={`sketchbook-wrapper ${isExpanded ? 'expanded' : ''}`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="music-center-column">
                        <div className="sketchbook">
                            <img
                                src={currentArt.image}
                                alt={currentArt.title}
                                className="sketch-image main-artwork square"
                            />

                            {/* Play Overlay: Click background to Open Library */}
                            <div className="play-overlay" onClick={toggleGrid}>
                                {/* Play Button: Click to Play/Pause (Stops bubbling) */}
                                <div className={`play-btn ${isPlaying ? 'playing' : ''}`} onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                                    {isPlaying ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </div>
                            </div>

                            {/* Paper Texture Overlay */}
                            <div className="paper-texture"></div>
                        </div>

                        {/* Player Controls (Mobile Only - Bottom of Work) */}
                        <div className="player-controls-container mobile-controls-only">
                            <div className="player-ui">
                                <div className="progress-bar" onClick={handleSeek}>
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="time-stamps">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="interactive-controls">
                                <button className="control-btn" onClick={handlePrev}>⏮</button>
                                <button className={`control-btn play-main ${isPlaying ? 'active' : ''}`} onClick={togglePlay}>
                                    {isPlaying ? (
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    ) : (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </button>
                                <button className="control-btn" onClick={handleNext}>⏭</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Grid (Gallery) */}
            <div className={`grid-overlay music-grid ${isGridOpen ? 'open' : ''}`}>
                <button className="close-grid" onClick={toggleGrid}>×</button>
                <div className="grid-content">
                    {loading && <p>Loading Playlist...</p>}
                    {artworks.map((art, index) => (
                        <div
                            key={art.id || index}
                            className="grid-item"
                            onClick={() => handleGridSelect(index)}
                        >
                            <img src={art.image} alt={art.title} className="loaded" />
                            <div className="play-icon-overlay">▶</div>
                            <span className="grid-title">{art.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InteractiveMusic;
