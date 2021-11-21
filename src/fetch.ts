import axios from 'axios'
import cheerio from 'cheerio'
import { readFile, writeFile } from "fs/promises"
import { GoalieSeason, Results, Season, SkaterSeason } from "./common"

function parseSeason($cells: cheerio.Cheerio): Season {
    const season = $cells.eq(0).text().trim()
    const injured = $cells.eq(0).find("i.fa-injured").length > 0
    const team = $cells.eq(1).find("a").text().trim()
    const league = $cells.eq(2).text().trim()
    const gamesPlayed = parseInt($cells.eq(3).text().trim(), 10)

    return {
        season, injured, team, league, gamesPlayed
    }
}

function parseGoalieSeason($item: cheerio.Cheerio): GoalieSeason {
    const $cells = $item.find('td')

    const goalsAvg = $cells.eq(5).text().trim()
    const savePct = $cells.eq(6).text().trim()
    const shutout = parseInt($cells.eq(9).text().trim(), 10) || 0
    const record = $cells.eq(10).text().trim()

    return {
        ...parseSeason($cells),
        goalsAvg, savePct, shutout, record
    }
}

function parseSkaterSeason($item: cheerio.Cheerio): SkaterSeason {
    const $cells = $item.find('td')

    const goals = parseInt($cells.eq(4).text().trim(), 10)
    const assists = parseInt($cells.eq(5).text().trim(), 10)
    const points = parseInt($cells.eq(6).text().trim(), 10)
    const plusMinus = parseInt($cells.eq(8).text().trim(), 10)

    return {
        ...parseSeason($cells),
        goals, assists, points, plusMinus,
    }
}

function parseCardItem($item: cheerio.Cheerio) {
    return $item.find('div').eq(1).text().trim()
}

async function parsePage(url: string, results: Results) {
    console.log(`Getting page ${url}...`)
    const resp = await axios.get(url)
    const $ = cheerio.load(resp.data)

    const name = $("h1.ep-entity-header__name").text().trim()
    console.log(`Player ${name}`)

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
    } else {
        const seasons = $seasons.toArray().map(($item) => parseGoalieSeason($($item)))
        results.goalies.push({
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
    }

    await writeFile("output.json", JSON.stringify(results, null, 2));
}

main()
