import axios from 'axios'
import cheerio from 'cheerio'
import { readFile } from "fs/promises"

interface Season {
    season: string
    team: string
    league: string
    gamesPlayed: number
}
interface SkaterSeason extends Season {
    goals: number
    assists: number
    points: number
    plusMinus: number
}

interface GoalieSeason extends Season {
    savePct: string
    goalsAvg: string
}

interface Player<S extends Season> {
    id: number
    name: string
    dateOfBirth: string
    position: string
    height: string
    weight: string
    shoots: string
    seasons: S[]
}

interface Results {
    skaters: Player<SkaterSeason>[]
    goalies: Player<GoalieSeason>[]
}

function parseSkaterSeason($item: cheerio.Cheerio): SkaterSeason {
    const $cells = $item.find('td')
    const season = $cells.eq(0).text().trim()
    const team = $cells.eq(1).find("a").text().trim()
    const league = $cells.eq(2).text().trim()
    const gamesPlayed = parseInt($cells.eq(3).text().trim(), 10)
    const goals = parseInt($cells.eq(4).text().trim(), 10)
    const assists = parseInt($cells.eq(5).text().trim(), 10)
    const points = parseInt($cells.eq(6).text().trim(), 10)
    const plusMinus = parseInt($cells.eq(8).text().trim(), 10)

    return {
        season, team, league, gamesPlayed, goals, assists, points, plusMinus,
    }
}

function parseCardItem($item: cheerio.Cheerio) {
    return $item.find('div').eq(1).text().trim()
}

async function parsePage(url: string, results: Results) {
    const resp = await axios.get(url)
    const $ = cheerio.load(resp.data)

    const name = $("h1.ep-entity-header__name").text().trim()

    const $card = $('div.ep-card__body div.ep-list > div')
    const dateOfBirth = parseCardItem($card.eq(0))
    const position = parseCardItem($card.eq(1))
    const height = parseCardItem($card.eq(3))
    const weight = parseCardItem($card.eq(5))
    const shoots = parseCardItem($card.eq(7))

    const player = {
        id: -1,
        name,
        dateOfBirth,
        position,
        height,
        weight,
        shoots,
    }

    const $seasons = $('table.table.player-stats').eq(0).find('tbody tr')

    if (position !== 'G') {
        const seasons = $seasons.toArray().map(($item) => parseSkaterSeason($($item)))
        results.skaters.push({
            ...player,
            seasons,
        })
    }
}

async function main() {
    const rawData = await readFile("links.txt", { encoding: 'utf-8' })
    const links = rawData.split(/[\r\n]+/g).filter(x => x.length > 0)

    const results: Results = {
        skaters: [],
        goalies: [],
    }

    for (const link of links) {
        await parsePage(link, results)
        break
    }

    console.log(results)
}

main()
