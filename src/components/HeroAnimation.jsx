import { useEffect, useRef, useState } from 'react';
import './HeroAnimation.css';

const frameCount = 136;
const currentFrame = (index) =>
    `/images/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

const HeroAnimation = () => {
    const canvasRef = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const imagesRef = useRef([]);
    const requestRef = useRef();
    const frameIndexRef = useRef(0);
    const fps = 24; // Target frames per second
    const nowRef = useRef(0);
    const thenRef = useRef(0);
    const interval = 1000 / fps;

    useEffect(() => {
        // Preload images
        const preloadImages = async () => {
            const promises = [];
            for (let i = 1; i <= frameCount; i++) {
                promises.push(
                    new Promise((resolve, reject) => {
                        const img = new Image();
                        img.src = currentFrame(i);
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        imagesRef.current[i - 1] = img;
                    })
                );
            }

            try {
                await Promise.all(promises);
                setImagesLoaded(true);
            } catch (error) {
                console.error("Failed to preload images", error);
            }
        };

        preloadImages();
    }, []);

    const drawFrame = (ctx, img, canvas) => {
        if (!img || !canvas) return;

        // Calculate aspect ratio to cover the canvas (like background-size: cover)
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);

        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw image centered and covering the canvas
        ctx.drawImage(
            img,
            0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
        );
    };

    const updateFrame = () => {
        if (!canvasRef.current || !imagesLoaded || !imagesRef.current.length) return;

        // Calculate scroll progress relative to the hero section (approx 500vh)
        const scrollTop = window.scrollY;
        const maxScroll = window.innerHeight * 4; // 500vh total height - 100vh viewport = 400vh scrollable

        // Clamp progress between 0 and 1
        const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

        // Calculate frame index
        const frameIndex = Math.min(
            Math.floor(progress * (frameCount - 1)),
            frameCount - 1
        );

        if (frameIndex !== frameIndexRef.current) {
            frameIndexRef.current = frameIndex;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = imagesRef.current[frameIndex];
            drawFrame(ctx, img, canvas);
        }

        requestRef.current = requestAnimationFrame(updateFrame);
    };

    // Virtual Scroll Logic
    useEffect(() => {
        if (!imagesLoaded) return;

        const handleWheel = (e) => {
            const scrollY = window.scrollY;
            const isAtTop = scrollY === 0;

            // Only hijack scroll if we are at the top of the page
            if (isAtTop) {
                // Calculate frame delta
                // Sensitivity: 0.1 frame per pixel of scroll
                const sensitivity = 0.2;
                const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100) * sensitivity;

                const newIndex = Math.min(Math.max(frameIndexRef.current + delta, 0), frameCount - 1);

                // Determine lock state
                // Lock if: Not at the end OR (At end and scrolling up)
                const isAnimationActive = frameIndexRef.current < frameCount - 1;
                const isScrollingUpAtEnd = frameIndexRef.current >= frameCount - 1 && e.deltaY < 0;

                if (isAnimationActive || isScrollingUpAtEnd) {
                    e.preventDefault(); // BLOCK SCROLL

                    frameIndexRef.current = newIndex;

                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        const img = imagesRef.current[Math.floor(frameIndexRef.current)];
                        if (img) drawFrame(ctx, img, canvasRef.current);
                    }
                }
            }
        };

        // Passive: false is crucial for preventDefault
        window.addEventListener('wheel', handleWheel, { passive: false });

        // Initial draw
        if (canvasRef.current && imagesRef.current[0]) {
            drawFrame(canvasRef.current.getContext('2d'), imagesRef.current[0], canvasRef.current);
        }

        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [imagesLoaded]);

    // Simple resize handler without loop dependency
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                if (imagesRef.current[Math.floor(frameIndexRef.current)]) {
                    drawFrame(canvasRef.current.getContext('2d'), imagesRef.current[Math.floor(frameIndexRef.current)], canvasRef.current);
                }
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [imagesLoaded]);

    return (
        <div className="hero-animation-container">
            <canvas ref={canvasRef} className="hero-canvas" />
            <div className="hero-overlay"></div>
        </div>
    );
};

export default HeroAnimation;
