import express from "express";
import { authMiddleware } from "./middleware";
import { prismaClient } from "db/client";
import cors from "cors";

const app = express();
app.use(express.json());

// Configure CORS with specific options
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['your-production-domain.com'] // Replace with your actual production domain
        : ['http://localhost:3000'], // Frontend development URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// @ts-ignore: Type issues with Express handlers
app.post("/api/v1/website", authMiddleware, async (req, res) => {
    // @ts-ignore: userId added by middleware
    const userId = req.userId!;
    const {url} = req.body;
    
    const website = await prismaClient.website.create({
        data: {
            userId: userId,
            url: url,
        }
    });

    res.status(201).json({
        message: "Website created successfully",
        website: website
    });
    return;
});

// @ts-ignore: Type issues with Express handlers
app.get("/api/v1/website/status", authMiddleware, async (req, res) => {
    const websiteId = req.query.websiteId as string;
    // @ts-ignore: userId added by middleware
    const userId = req.userId!;

    const websiteData = await prismaClient.website.findUnique({
        where: {
            id: websiteId,
            userId: userId,
            disabled: false
        },
        include: {
            ticks: true
        }
    });

    res.json(websiteData);
    return;
});

// @ts-ignore: Type issues with Express handlers
app.get("/api/v1/websites", authMiddleware, async (req, res) => {
    // @ts-ignore: userId added by middleware
    const userId = req.userId!;

    const websites = await prismaClient.website.findMany({
        where: {
            userId: userId,
            disabled: false
        },
        include: {
            ticks: true
        }
    });

    res.json({websites});
    return;
});

// @ts-ignore: Type issues with Express handlers
app.delete("/api/v1/website/:id", authMiddleware, async (req, res) => {
    const websiteId = req.params.id;
    // @ts-ignore: userId added by middleware
    const userId = req.userId!;

    await prismaClient.website.update({
        where: {
            id: websiteId,
            userId: userId
        },
        data: {
            disabled: true
        }
    });

    res.json({message: "Website deleted successfully"});
    return;
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});


