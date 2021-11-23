import { readFile } from "fs/promises"
import { Results, SkaterSeason, Player, Season } from "./common"
import { Table } from "./markdown"

interface Skater {
    player: Player<SkaterSeason>,
    seasons: SkaterSeason[],
}

function seasonFilter(s: Season) {
    return s.season === '2021-22' && s.league != 'NHL' && !/(U18|U20)/.test(s.team)
}

async function main() {
    const rawData = await readFile("output.json", { encoding: 'utf-8' })
    const results: Results = JSON.parse(rawData)

    results.skaters.sort((a, b) => a.name.localeCompare(b.name))
    results.goalies.sort((a, b) => a.name.localeCompare(b.name))

    const skatersTable = new Table("Player", "Age", "Position", "Team", "League", "GP", "Goals", "Assists", "Points", "+/-", "PPG")
    const goaliesTable = new Table("Player", "Age", "Position", "Team", "League", "GP", "GAA", "SV%", "SO", "Record")

    for (const skater of results.skaters) {
        const seasons = skater.seasons.filter(seasonFilter)
        for (const season of seasons) {
            const ppg = season.points / season.gamesPlayed
            skatersTable.addRow(
                skater.name,
                skater.age,
                skater.position,
                season.team,
                season.league,
                season.gamesPlayed?.toString(),
                season.goals?.toString(),
                season.assists?.toString(),
                season.points?.toString(),
                season.plusMinus?.toString(),
                isNaN(ppg) ? '' : ppg.toFixed(2),
            )
        }
    }

    for (const goalie of results.goalies) {
        const seasons = goalie.seasons.filter(seasonFilter)
        for (const season of seasons) {
            goaliesTable.addRow(
                goalie.name,
                goalie.age,
                goalie.position,
                season.team,
                season.league,
                season.gamesPlayed?.toString(),
                season.savePct?.toString(),
                season.goalsAvg?.toString(),
                season.shutout?.toString(),
                season.record?.toString(),
            )
        }
    }

    console.log(skatersTable.render())
    console.log("")
    console.log(goaliesTable.render())
}

main()
