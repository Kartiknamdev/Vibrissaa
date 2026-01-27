import { useEffect, useRef, useState } from 'react';
import './HeroAnimation.css';

const frameCount = 136;
const currentFrame = (index) =>
    `/images/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

const HeroAnimation = () => {
    const canvasRef = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const imagesRef = useRef([]);
    const frameIndexRef = useRef(0);
    const requestRef = useRef();

    // Touch handling state
    const touchStartY = useRef(null);

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

        // Calculate aspect ratio to cover
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);

        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
            img,
            0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
        );
    };

    // Main Interaction Logic (Wheel + Touch)
    useEffect(() => {
        if (!imagesLoaded) return;

        const handleInteraction = (deltaY, event) => {
            const scrollY = window.scrollY;
            const isAtTop = scrollY < 5; // Tolerance for mobile bounce

            // Determine if we should hijack the scroll calculation
            const isAnimationRunning = frameIndexRef.current < frameCount - 1;
            const isReversingAtEnd = frameIndexRef.current >= frameCount - 1 && deltaY < 0;

            // Only hijack if we are at the top AND (animating in progress OR user is trying to scroll back up)
            if (isAtTop && (isAnimationRunning || isReversingAtEnd)) {
                // Prevent default page scroll
                if (event.cancelable) event.preventDefault();

                // Sensitivity factor (Touch needs slightly higher sensitivity than wheel sometimes, but consistent is good)
                const sensitivity = 0.25;

                // Calculate new frame index
                // deltaY > 0 means scrolling/swiping DOWN (Progress forward)
                // deltaY < 0 means scrolling/swiping UP (Progress backward)
                const moveAmount = deltaY * sensitivity;

                const newIndex = Math.min(Math.max(frameIndexRef.current + moveAmount, 0), frameCount - 1);

                frameIndexRef.current = newIndex;

                // Draw the new frame
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    const img = imagesRef.current[Math.floor(frameIndexRef.current)];
                    if (img) drawFrame(ctx, img, canvasRef.current);
                }
            }
        };

        const handleWheel = (e) => {
            handleInteraction(e.deltaY, e);
        };

        const handleTouchStart = (e) => {
            if (e.touches.length === 1) {
                touchStartY.current = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e) => {
            if (touchStartY.current === null) return;

            const currentY = e.touches[0].clientY;
            // Calculate delta: Previous Y - Current Y
            // Drag Up (Finger moves up) = currentY < startY = Positive Delta = Scroll Down
            const deltaY = touchStartY.current - currentY;

            handleInteraction(deltaY, e);

            // Update startY for continuous delta calculation
            touchStartY.current = currentY;
        };

        const handleTouchEnd = () => {
            touchStartY.current = null;
        };

        // Attach listeners with passive: false to allow preventDefault
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        // Initial Draw
        if (canvasRef.current && imagesRef.current[0]) {
            drawFrame(canvasRef.current.getContext('2d'), imagesRef.current[0], canvasRef.current);
        }

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [imagesLoaded]);

    // Resize Handler
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
