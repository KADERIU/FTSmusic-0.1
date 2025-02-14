import fetch from 'cross-fetch';

import { XMLParser } from 'fast-xml-parser';

const youtubeAPI = (() => {
    // Configuration et helpers
    const CPN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const currentVersion = 1.0;
    let hasError = false;

    const generateClientPlaybackNonce = (length) =>
        Array.from({ length }, () => CPN_CHARS[Math.floor(Math.random() * CPN_CHARS.length)]).join('');

    // Configuration des payloads
    const payloads = {
        ios: {
            data: () => ({
                cpn: generateClientPlaybackNonce(16),
                contentCheckOk: true,
                racyCheckOk: true,
                context: {
                    client: {
                        clientName: 'IOS',
                        clientVersion: '19.228.1',
                        deviceMake: 'Apple',
                        deviceModel: 'iPhone16,2',
                        platform: 'MOBILE',
                        osName: 'iOS',
                        osVersion: '17.5.1.21F90',
                        hl: 'en',
                        gl: 'US',
                        utcOffsetMinutes: -240
                    },
                    request: { internalExperimentFlags: [], useSsl: true },
                    user: { lockedSafetyMode: false }
                }
            }),
            agent: 'com.google.ios.youtube/19.228.1(iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X; en_US)'
        },
        android: {
            data: () => ({
                cpn: generateClientPlaybackNonce(16),
                contentCheckOk: true,
                racyCheckOk: true,
                context: {
                    client: {
                        clientName: 'ANDROID',
                        clientVersion: '19.30.36',
                        platform: 'MOBILE',
                        osName: 'Android',
                        osVersion: '14',
                        androidSdkVersion: '34',
                        hl: 'en',
                        gl: 'US',
                        utcOffsetMinutes: -240
                    },
                    request: { internalExperimentFlags: [], useSsl: true },
                    user: { lockedSafetyMode: false }
                }
            }),
            agent: 'com.google.android.youtube/19.30.36 (Linux; U; Android 14; en_US) gzip'
        }
    };

    // Core Player Functions
    const player = {
        async getData(videoId, isRaw = false, payloadType = 'android') {
            const payloadConfig = payloads[payloadType] || payloads.android;
            const payload = { videoId, ...payloadConfig.data() };

            const query = new URLSearchParams({
                prettyPrint: false,
                t: generateClientPlaybackNonce(12),
                id: videoId
            });

            try {
                const response = await fetch(`https://youtubei.googleapis.com/youtubei/v1/player?${query}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': payloadConfig.agent,
                        'X-Goog-Api-Format-Version': '2'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    hasError = true;
                    await this.checkUpdate();
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return isRaw ? data : this.parseFormats(data);
            } catch (error) {
                console.error('Player error:', error);
                return null;
            }
        },

        parseFormats(response) {
            return [
                ...(response?.streamingData?.formats || []),
                ...(response?.streamingData?.adaptiveFormats || [])
            ];
        },

        filter(formats, filterType, options = {}) {
            return formats.filter(format => {
                if (filterType === 'bestaudio') {
                    return format.mimeType.includes(options.codec) && format.bitrate >= options.minBitrate;
                }
                return true;
            });
        },

        async checkUpdate() {
            try {
                const response = await fetch('https://st.onvo.me/config.json');
                const json = await response.json();

                if (json.version !== currentVersion) {
                    if ((json.data && hasError) || json.forceUpdate) {
                        payloads.android.data = () => ({
                            cpn: generateClientPlaybackNonce(16),
                            ...json.data
                        });
                    }
                    if ((json.agent && hasError) || json.forceUpdate) {
                        payloads.android.agent = json.agent;
                    }
                }
            } catch (e) {
                console.error('Update check failed:', e);
            }
        }
    };

    // Scraping Functions
    const scraper = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',

        async fetchPage(url, agentType = 'chrome') {
            const agents = {
                chrome: { 'User-Agent': this.userAgent },
                ios: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1' },
                android: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0' }
            };

            return fetch(url, { headers: agents[agentType], redirect: 'follow' });
        },

        async getVideoId(query, isYouTube = true) {
            try {
                const url = `https://${isYouTube ? 'www' : 'music'}.youtube.com/results?search_query=${encodeURIComponent(query)}`;
                const response = await this.fetchPage(url);
                const html = await response.text();
                return this.extractVideoId(html);
            } catch (error) {
                console.error('Scraping error:', error);
                return null;
            }
        },

        extractVideoId(html) {
            const ytInitialDataMatch = html.match(/var ytInitialData = (.*?);<\/script>/s);
            if (ytInitialDataMatch && ytInitialDataMatch[1]) {
                try {
                    const ytInitialData = JSON.parse(ytInitialDataMatch[1]);
                    const videoId = ytInitialData.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents[0]?.videoRenderer?.videoId;
                    return videoId || { error: 'No video ID found' };
                } catch (parseError) {
                    console.error('Error parsing ytInitialData:', parseError);
                    return { error: 'Error parsing ytInitialData' };
                }
            }
            return { error: 'No data found' };
        },

        async getSubtitles(videoId) {
            try {
                const response = await this.fetchPage(`https://www.youtube.com/watch?v=${videoId}`);
                const html = await response.text();
                const json = this.extractSubtitles(html);

                if (json.error) {
                    throw new Error(json.error);
                }

                if (json && json.captions) {
                    const captionsResponse = await this.fetchPage(json.captions, 'chrome');
                    if (!captionsResponse.ok) {
                        throw new Error(`HTTP error! status: ${captionsResponse.status}`);
                    }
                    const xmlData = await captionsResponse.text();

                    // Parsing XML avec fast-xml-parser
                    const parser = new XMLParser({
                        trimValues: true,
                        ignoreAttributes: false,
                        attributeNamePrefix: ''
                    });
                    
                    const parsed = parser.parse(xmlData);
                    const textElements = parsed?.transcript?.text;

                    // Conversion vers le format compatible
                    let textArray = [];
                    if (textElements) {
                        textArray = Array.isArray(textElements) ? textElements : [textElements];
                        return textArray.map(text => ({
                            _: text['#text'],
                            $: Object.fromEntries(
                                Object.entries(text).filter(([k]) => k !== '#text')
                            )
                        }));
                    }
                    return [];
                }
                return [];
            } catch (error) {
                console.error('Subtitles error:', error);
                return null;
            }
        },

        extractSubtitles(html) {
            const match = html.match(/var ytInitialPlayerResponse\s*=\s*(\{.*?\})\s*;/s);
            if (match && match[1]) {
                try {
                    const ytInitialPlayerResponse = JSON.parse(match[1]);
                    const captions = ytInitialPlayerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks?.[0]?.baseUrl;
                    return { captions };
                } catch (parseError) {
                    console.error('Error parsing ytInitialPlayerResponse:', parseError);
                    return { error: 'Error parsing subtitles data' };
                }
            }
            return { error: 'No subtitles found' };
        }
    };

    // Music API Functions
    const music = {
        async search(query, type = 'songs') {
            try {
                const body = {
                    context: {
                        client: {
                            clientName: "WEB_REMIX",
                            clientVersion: "1.20241111.01.00",
                            timeZone: "Etc/GMT-2"
                        }
                    },
                    query,
                    params: this.getSearchParams(type)
                };

                const response = await fetch('https://music.youtube.com/youtubei/v1/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': scraper.userAgent
                    },
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    throw new Error(`Music search HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return this.filterSearchResults(data, type);
            } catch (error) {
                console.error('Music search error:', error);
                return [];
            }
        },

        getSearchParams(type) {
            const paramsMap = {
                songs: 'Eg-KAQwIAhABGAE%3D',
                videos: 'Eg-KAQwIAhABGAE%3D',
                albums: 'Eg-KAQwIAhABGAI%3D',
                playlists: 'Eg-KAQwIAhABGAM%3D',
                artists: 'Eg-KAQwIAhABGAQ%3D'
            };
            return paramsMap[type] || paramsMap.songs;
        },

        filterSearchResults(data, type) {
            const results = data?.contents?.twoColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
            if (!results) return [];

            let filteredResults = [];

            results.forEach(section => {
                const items = section.itemSectionRenderer?.contents;
                if (items) {
                    items.forEach(item => {
                        if (type === 'songs' && item.musicResponsiveListItemRenderer) {
                            filteredResults.push(item.musicResponsiveListItemRenderer);
                        }
                    });
                }
            });

            return filteredResults;
        },

        async getPlaylist(id) {
            try {
                const response = await scraper.fetchPage(`https://music.youtube.com/playlist?list=${id}`);
                const html = await response.text();
                return this.parsePlaylist(html);
            } catch (error) {
                console.error('Playlist error:', error);
                return null;
            }
        },

        parsePlaylist(html) {
            const videoIds = [];
            const regex = /"videoId":"(.*?)"/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                videoIds.push(match[1]);
            }
            return videoIds;
        }
    };

    // Expose public API
    return {
        player,
        scraper,
        music,
        utils: {
            generateNonce: generateClientPlaybackNonce,
            currentVersion
        }
    };
})();

export default youtubeAPI;