import { parse } from 'csv-parse/browser/esm';
import { createGameInfo } from '../models/GameInfo';
import type Shelf from '../models/Shelf';

const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRiFWCrZ9GuJicmWG0Ndxb39ZIm0l6xAuO413KFfqgRcONVjp1JwYfJO8EgYvWH5qeAcENrUHdc_fLT/pub?output=csv';

async function getAll(): Promise<Shelf> {
    const response = await fetch(CSV_URL);
    const text = await response.text();

    return new Promise((resolve, reject) => {
        parse(text, { columns: true, skip_empty_lines: true, trim: true }, (err, records) => {
            if (err) return reject(err);

            const genres = new Set<string>();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const gamesInfo = records.map((row: Record<string, string>) => {
                const gameGenres = row.genres
                    ? row.genres.split(',').map((g: string) => g.trim()).filter(Boolean)
                    : [];

                gameGenres.forEach((g: string) => genres.add(g));

                return createGameInfo(
                    Number(row.id),
                    row.title,
                    row.image ?? '',
                    row.platform,
                    gameGenres,
                    row.finished?.toUpperCase() === 'TRUE'
                );
            });

            resolve({ gamesInfo, genres });
        });
    });
}

const gameInfoService = { getAll };
export default gameInfoService;

