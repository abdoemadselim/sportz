import {Router} from "express";
import zod from "zod"
import {createMatchSchema, listMatchesQuerySchema} from "../validation/matches.js";
import {db} from "../db/db.js";
import {matches} from "../db/schema.js";
import {getMatchStatus} from "../utils/match-status.js";
import {desc} from "drizzle-orm";

const matchesRouter = Router()

const MAX_MATCHES_QUERY_LIMIT = 100

matchesRouter.get("/", async (req, res) => {
    const parsedData = listMatchesQuerySchema.safeParse(req.query)

    if(!parsedData.success){
        res.status(400).json({error: "Invalid query", details: parsedData.error.issues})
    }

    const limit = Math.min(parsedData.data.limit, MAX_MATCHES_QUERY_LIMIT)

    try {
        const result = await db.select().from(matches).orderBy(desc(matches.startTime)).limit(limit)

        res.status(200).json(result)
    }catch(err){
        res.status(500).json({details: parsedData.error.issues, error: "Failed to fetch matches"})
    }
})

matchesRouter.post("/", async (req, res) => {
    const parsedData = createMatchSchema.safeParse(req.body)

    if(!parsedData.success){
        res.status(400).json({error: "Invalid payload", details: parsedData.error.issues})
    }

    const {data:{startTime, endTime, homeScore, awayScore}} = parsedData

    try{
        const [event] = await db.insert(matches).values([
            {
                ...parsedData.data,
                status: getMatchStatus(startTime, endTime),
                homeScore: homeScore ?? 0,
                awayScore: awayScore ?? 0,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
            }
        ]).returning()

        res.status(201).json({data: event})
    }catch(err){
        res.status(500).json({details: {error: err}, error: "Failed to create match"})
    }
})

export default matchesRouter;