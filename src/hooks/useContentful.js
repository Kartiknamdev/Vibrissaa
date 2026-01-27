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
                console.log("[Contentful Debug] Fetching entries for content_type: 'sketchbookEntry'...");
                const response = await client.getEntries({
                    content_type: 'sketchbookEntry',
                });

                console.log("[Contentful Debug] Raw Response:", response);

                if (response.items.length === 0) {
                    console.warn("[Contentful Debug] No items found. Check if:");
                    console.warn("1. Content Type ID is exactly 'sketchbookEntry'");
                    console.warn("2. Entries are currently 'Published' (not Draft)");
                }

                const sanitizedData = response.items.map((item) => {
                    const { title, description, image } = item.fields;
                    // Log each item to see fields
                    console.log("[Contentful Debug] Processing Item:", item.fields);

                    return {
                        id: item.sys.id,
                        title,
                        description,
                        image: image?.fields?.file?.url ? `https:${image.fields.file.url}` : null,
                    };
                }).filter(item => item.image); // Only keep items with valid images

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
