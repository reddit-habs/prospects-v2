import axios from 'axios';
import cheerio from 'cheerio';
import { readFile } from "fs/promises"

interface SkaterSeason {
    season: string
    team: string
    league: string
    gamesPlayed: number
    goals: number
    assists: number
    points: number
    plusMinus: number
}

interface Player {
    id: number
    name: string
    dateOfBirth: string
    position: string
    height: string
    weight: string
    shoots: string
}

function parseCardItem($item: cheerio.Cheerio) {
    return $item.find('div').eq(1).text().trim();
}

async function parsePage(url: string): Promise<Player> {
    const resp = await axios.get(url);
    const $ = cheerio.load(resp.data);

    const name = $("h1.ep-entity-header__name").text().trim();

    const $card = $('div.ep-card__body div.ep-list > div');
    const dateOfBirth = parseCardItem($card.eq(0));
    const position = parseCardItem($card.eq(1));
    const height = parseCardItem($card.eq(3));
    const weight = parseCardItem($card.eq(5));
    const shoots = parseCardItem($card.eq(7));

    return {
        id: -1,
        name,
        dateOfBirth,
        position,
        height,
        weight,
        shoots,
    }
}

async function main() {
    const rawData = await readFile("links.txt", { encoding: 'utf-8' });
    const links = rawData.split(/[\r\n]+/g).filter(x => x.length > 0)

    const results = [];
    for (const link of links) {
        results.push(await parsePage(link));
        break;
    }

    console.log(results);
}

main();
