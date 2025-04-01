import { NextResponse } from 'next/server';

// Mock translation function (replace with actual implementation)
async function translateQuery(query) {
    console.log(`Translating query: ${query}`);
    // Simulate translation delay
    await new Promise(resolve => setTimeout(resolve, 100));
    // Basic mock: just append "-translated"
    // In reality, detect language and translate to the other (EN <-> ZH)
    const isChinese = /\p{Script=Han}/u.test(query);
    if (isChinese) {
        return { original: query, translated: `${query}-en` }; // Mock English translation
    } else {
        return { original: query, translated: `${query}-zh` }; // Mock Chinese translation
    }
}

// Mock scraper function (replace with actual implementations per site)
async function scrapeSite(siteName, query) {
    console.log(`Scraping ${siteName} for: ${query}`);
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

    // Return mock data structure for this site
    // TODO: Implement actual scraping logic for each site
    // This will involve fetching the site's search results page, parsing HTML, handling pagination etc.
    const mockItems = Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
        id: `${siteName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        name: `${siteName} Dataset for ${query} ${i + 1}`,
        description: `Mock description for item ${i + 1} from ${siteName}.`,
        link: `#mock-link-to-${siteName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`
    }));

    return {
        database: siteName,
        count: mockItems.length > 0 ? Math.floor(Math.random() * 150 + mockItems.length) : 0, // Mock total count
        items: mockItems, // Mock first few items
    };
}

export async function POST(request) {
    try {
        const body = await request.json();
        const query = body.query;

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return NextResponse.json({ error: 'Invalid query provided' }, { status: 400 });
        }

        const trimmedQuery = query.trim();
        console.log(`API received search query: ${trimmedQuery}`);

        // --- Step 1: Translate Query ---
        // TODO: Implement robust translation (e.g., using a translation API)
        const { original, translated } = await translateQuery(trimmedQuery);
        const queries = [original];
        if (translated && translated !== original) {
            queries.push(translated);
        }

        console.log(`Effective queries: ${queries.join(', ')}`);

        // --- Step 2: Define Target Sites ---
        // TODO: Get this list from a configuration or constant
        const targetSites = [
            'Hugging Face',
            'Kaggle',
            'ModelScope',
            'OpenDataLab',
            'Google Dataset Search' // Add more as needed
        ];

        // --- Step 3: Scrape Each Site ---
        // Run scrapers in parallel for efficiency
        // TODO: Implement actual scrapers for each site in scrapeSite function
        const scrapingPromises = targetSites.flatMap(siteName =>
            queries.map(q => scrapeSite(siteName, q))
        );

        const results = await Promise.allSettled(scrapingPromises);

        // --- Step 4: Aggregate Results ---
        const aggregatedResults = {};
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                const siteData = result.value;
                const dbName = siteData.database;

                if (!aggregatedResults[dbName]) {
                    aggregatedResults[dbName] = {
                        database: dbName,
                        count: 0,
                        items: new Map() // Use a Map for easier deduplication by item ID
                    };
                }

                // Add items to the map (automatically handles duplicates by ID)
                siteData.items.forEach(item => {
                    if (!aggregatedResults[dbName].items.has(item.id)) {
                        aggregatedResults[dbName].items.set(item.id, item);
                    }
                });

                // Update count - be careful how counts are aggregated if scrapers return total counts vs item counts
                // This mock adds the mock counts together. Real implementation might need refinement.
                aggregatedResults[dbName].count += siteData.count;

            } else if (result.status === 'rejected') {
                console.error('Scraping failed for one query/site:', result.reason);
                // Optionally add error info to the response for specific sites
                // const siteName = result.reason?.config?.siteName || 'Unknown Site'; // Example: Get site name if possible
                // if (!aggregatedResults[siteName]) {
                //   aggregatedResults[siteName] = { database: siteName, error: 'Failed to fetch results', items: [], count: 0 };
                // }
            }
        });

        // Convert aggregated results object back to an array, converting Map to array
        const finalResults = Object.values(aggregatedResults).map(dbResult => ({
            ...dbResult,
            items: Array.from(dbResult.items.values())
        }));

        console.log('API sending results:', finalResults);

        // --- Step 5: Return Results ---
        return NextResponse.json(finalResults, { status: 200 });

    } catch (error) {
        console.error('[API /api/dataset-search] Error:', error);
        // Distinguish between client JSON parse error and other server errors
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 