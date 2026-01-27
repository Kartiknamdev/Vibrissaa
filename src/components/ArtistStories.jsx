import React from 'react';
import './ArtistStories.css';

const artists = [
    {
        id: 1,
        name: "Leonardo da Vinci",
        era: "Renaissance",
        quote: "Simplicity is the ultimate sophistication.",
        shortDesc: "The architect of curiosity.",
        fullStory: "Leonardo believed that art and science were not separate disciplines, but two wings of the same bird. His notebooks reveals that true genius lies in the relentless observation of nature's smallest details—from the flow of water to the structure of a bird's wing. He teaches us that to create something timeless, one must first understand how the world truly works.",
        bgLast: "Da Vinci"
    },
    {
        id: 2,
        name: "Gustav Klimt",
        era: "Art Nouveau",
        quote: "Truth is like fire; to tell the truth means to glow and burn.",
        shortDesc: "The master of gold.",
        fullStory: "Klimt proved that ornamentation isn't just decoration—it's a spiritual layer that elevates the human form to divinity. During his Golden Phase, he used actual gold leaf to create shimmering, mosaic-like patterns that enveloped his subjects. He inspires us to embrace opulence not as excess, but as a way to honor the sacredness of beauty.",
        bgLast: "Klimt"
    },
    {
        id: 3,
        name: "Georgia O'Keeffe",
        era: "Modernism",
        quote: "I found I could say things with color and shapes that I couldn't say any other way.",
        shortDesc: "The visionary of form.",
        fullStory: "O'Keeffe taught us to look closer. By enlarging flowers to monumental proportions, she forced the busy world to stop and see what she saw. Her work stripped away the unnecessary, leaving only pure emotion and form. She reminds us that sometimes, the boldest statement is made by simply focusing on one beautiful thing.",
        bgLast: "O'Keeffe"
    }
];

const ArtistStories = () => {
    const [selectedArtist, setSelectedArtist] = React.useState(null);

    return (
        <div className="artist-stories">
            <div className="container">
                <div className="section-header">
                    <p className="section-subtitle">The Giants We Stand On</p>
                    <h2 className="section-title">Legends of the Craft</h2>
                    <p className="hero-description" style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
                        We honor the visionaries who paved the way.
                    </p>
                </div>

                <div className="artist-grid">
                    {artists.map((artist) => (
                        <div
                            key={artist.id}
                            className="artist-card"
                            onClick={() => setSelectedArtist(artist)}
                        >
                            {/* Background Decorative Text */}
                            <div className="card-bg-accent">{artist.bgLast.charAt(0)}</div>

                            <div>
                                <span className="artist-era">{artist.era}</span>
                                <h3 className="artist-name">{artist.name}</h3>
                                <p className="artist-quote">"{artist.quote}"</p>
                            </div>

                            <div className="discover-btn">
                                Read Story <span>→</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Story Modal */}
                {selectedArtist && (
                    <div className="story-modal-overlay" onClick={() => setSelectedArtist(null)}>
                        <div className="story-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="close-modal" onClick={() => setSelectedArtist(null)}>×</button>

                            <span className="modal-era">{selectedArtist.era}</span>
                            <h2 className="modal-title">{selectedArtist.name}</h2>
                            <div className="modal-divider"></div>

                            <p className="modal-story">
                                <span className="drop-cap">{selectedArtist.fullStory.charAt(0)}</span>
                                {selectedArtist.fullStory.slice(1)}
                            </p>

                            <p className="modal-quote">"{selectedArtist.quote}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtistStories;
