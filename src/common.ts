export interface Season {
    season: string
    injured: boolean
    team: string
    league: string
    gamesPlayed: number
}

export interface SkaterSeason extends Season {
    goals: number
    assists: number
    points: number
    plusMinus: number
}

export interface GoalieSeason extends Season {
    goalsAvg: string
    savePct: string
    shutout: number
    record: string
}

export interface Player<S extends Season> {
    id: number
    name: string
    dateOfBirth: string
    position: string
    height: string
    weight: string
    shoots: string
    seasons: S[]
}

export interface Results {
    skaters: Player<SkaterSeason>[]
    goalies: Player<GoalieSeason>[]
}
