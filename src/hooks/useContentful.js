import { useState, useEffect } from 'react';
import { createClient } from 'contentful';

const SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

const useContentful = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // DEBUG: Check if keys exist
        console.log("[Contentful Debug] Checking Keys:", {
            spaceId: SPACE_ID ? `${SPACE_ID.substring(0, 3)}...` : 'MISSING',
            token: ACCESS_TOKEN ? 'PRESENT' : 'MISSING'
        });

        if (!SPACE_ID || !ACCESS_TOKEN) {
            console.warn("[Contentful Debug] Missing keys in .env file");
            setLoading(false);
            return;
        }

        const client = createClient({
            space: SPACE_ID,
            accessToken: ACCESS_TOKEN,
        });

        const fetchEntries = async () => {
            try {
                console.log("[Contentful Debug] Fetching ASSETS with tag: 'sketchbookEntry'...");

                // Fetch Assets (Images) directly that have the tag 'sketchbookEntry'
                const response = await client.getAssets({
                    'metadata.tags.sys.id[in]': 'sketchbookEntry',
                    order: '-sys.createdAt', // Newest uploads first
                });

                console.log("[Contentful Debug] Raw Response:", response);

                if (response.items.length === 0) {
                    console.warn("[Contentful Debug] No assets found. Check if:");
                    console.warn("1. You uploaded images to 'Media' tab.");
                    console.warn("2. You created a Tag named 'sketchbookEntry' (Settings -> Tags).");
                    console.warn("3. You tagged the images with 'sketchbookEntry'.");
                    console.warn("4. You Published the images.");
                }

                const sanitizedData = response.items.map((asset) => {
                    // Use the built-in Title and Description from the Asset
                    const { title, description, file } = asset.fields;

                    return {
                        id: asset.sys.id,
                        title: title || "Untitled Sketch",
                        description: description || "No description provided.",
                        image: file?.url ? `https:${file.url}` : null,
                    };
                }).filter(item => item.image); // Only keep valid images

                setData(sanitizedData);
                setLoading(false);
            } catch (err) {
                console.error("[Contentful Debug] Error fetching data:", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchEntries();
    }, []);

    return { data, loading, error };
};

export default useContentful;
