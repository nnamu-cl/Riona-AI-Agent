import logger from "../config/logger";
// import { handleError } from "../utils"; // handleError might need to be adapted or replaced for OpenRouter
import { InstagramCommentSchema } from "./schema";
import fs from "fs";
import path from "path";
import * as readlineSync from "readline-sync";
import { generateContent as generateContentOpenRouter } from "../services/OpenRouterService";
import { OPENROUTER_DEFAULT_MODEL } from "../secret";

export async function runAgent(schema: InstagramCommentSchema, prompt: string): Promise<any> {
    try {
        // The modelId can be passed explicitly or use the default from secrets
        const modelId = OPENROUTER_DEFAULT_MODEL; // Or allow passing it as a parameter to runAgent

        const data = await generateContentOpenRouter(prompt, modelId, { schema });
        
        if (!data) {
            logger.info("No response received from the AI model via OpenRouter. || Service Unavailable");
            // Consider returning a more specific error or letting the error from generateContentOpenRouter propagate
            return "Service unavailable or no data!";
        }
        
        return data;
    } catch (error) {
        logger.error(`Error in runAgent using OpenRouter: ${(error as Error).message}`);
        // Re-throw the error or return a more structured error object
        // The old handleError was specific to Gemini key rotation, which is not directly applicable here.
        // For now, we'll let the error propagate or return a generic message.
        // Depending on requirements, a new error handling strategy for OpenRouter could be implemented.
        throw error; // Or return an error object: return { error: true, message: (error as Error).message };
    }
}

export function chooseCharacter(): any {
    const charactersDir = (() => {
        const buildPath = path.join(__dirname, "characters");
        if (fs.existsSync(buildPath)) {
            return buildPath;
        } else {
            // Fallback to source directory
            return path.join(process.cwd(), "src", "Agent", "characters");
        }
    })();
    const files = fs.readdirSync(charactersDir);
    const jsonFiles = files.filter(file => file.endsWith(".json"));
    if (jsonFiles.length === 0) {
        throw new Error("No character JSON files found");
    }
    console.log("Select a character:");
    jsonFiles.forEach((file, index) => {
        console.log(`${index + 1}: ${file}`);
    });
    const answer = readlineSync.question("Enter the number of your choice: ");
    const selection = parseInt(answer);
    if (isNaN(selection) || selection < 1 || selection > jsonFiles.length) {
        throw new Error("Invalid selection");
    }
    const chosenFile = path.join(charactersDir, jsonFiles[selection - 1]);
    const data = fs.readFileSync(chosenFile, "utf8");
    const characterConfig = JSON.parse(data);
    return characterConfig;
}

export function initAgent(): any {
    try {
        const character = chooseCharacter();
        console.log("Character selected:", character);
        return character;
    } catch (error) {
        console.error("Error selecting character:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    (() => {
        initAgent();
    })();
}
