import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const PLAYLIST_ID = import.meta.env.VITE_YOUTUBE_PLAYLIST_ID;

const useYouTube = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!API_KEY || !PLAYLIST_ID) {
            console.warn("[YouTube Debug] Missing API Key or Playlist ID");
            setLoading(false);
            return;
        }

        const fetchPlaylist = async () => {
            try {
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`
                );

                if (!response.ok) {
                    throw new Error(`YouTube API Error: ${response.statusText}`);
                }

                const result = await response.json();

                const sanitizedData = result.items.map(item => {
                    const snippet = item.snippet;
                    return {
                        id: snippet.resourceId.videoId,
                        // Clean up title (remove common music video suffixes like "Official Video")
                        title: snippet.title.replace(/(\(.*?\)|\[.*?\])/g, '').trim(),
                        // Use channel title as artist for now, or fallback to a standard string
                        artist: snippet.videoOwnerChannelTitle || snippet.channelTitle || "Unknown Artist",
                        description: "Featured Track", // API doesn't give short descriptions suitable for this UI
                        image: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url
                    };
                }).filter(track => track.title !== 'Private video' && track.title !== 'Deleted video');

                setData(sanitizedData);
                setLoading(false);
            } catch (err) {
                console.error("[YouTube Debug] Error fetching playlist:", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchPlaylist();
    }, []);

    return { data, loading, error };
};

export default useYouTube;
