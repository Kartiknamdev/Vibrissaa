import fetch from 'node-fetch';

const API_KEY = "AIzaSyANh9kxTaRx4vHsDH2R_xasyfvChRUdp8o";
const PLAYLIST_ID = "PLdeagMjdUxSjC7sX34yvihzHFWfNjiyrG";

const testFetch = async () => {
    try {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;
        console.log(`Fetching: ${url}`);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("API Error:", JSON.stringify(data, null, 2));
        } else {
            console.log("Success! Found " + data.items.length + " items.");
            console.log("First item:", data.items[0].snippet.title);
        }
    } catch (err) {
        console.error("Fetch failed:", err);
    }
};

testFetch();
