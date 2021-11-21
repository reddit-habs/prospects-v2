export class Table {
    private headers: string[]
    private rows: string[][]

    constructor(...headers: string[]) {
        this.headers = headers
        this.rows = []
    }

    addRow(...row: string[]) {
        this.rows.push(row)
    }

    render(): string {
        const header = this.headers.join("|")
        const sep = this.headers.map(_ => "--").join("|")
        const rows = this.rows.map(r => r.join("|"))
        return [header, sep, ...rows].map(l => "|" + l + "|").join("\n")
    }
}
