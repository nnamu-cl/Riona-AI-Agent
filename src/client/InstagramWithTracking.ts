import { Browser, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import UserAgent from "user-agents";
import { Server } from "proxy-chain";
import { IGpassword, IGusername } from "../secret";
import logger from "../config/logger";
import { Instagram_cookiesExist, loadCookies, saveCookies } from "../utils";
import { runAgent } from "../Agent";
import { getInstagramCommentSchema } from "../Agent/schema";
import { ActivityLogger } from "../services/ActivityLogger";
import { shouldStop } from "../app";

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());
puppeteer.use(
    AdblockerPlugin({
        // Optionally enable Cooperative Mode for several request interceptors
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    })
);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface AgentConfig {
    max_posts?: number;
    delay_ms?: number;
    comment_enabled?: boolean;
    like_enabled?: boolean;
}

export async function runInstagramWithTracking(agentId: string, config: AgentConfig = {}) {
    // Default config
    const defaultConfig = {
        max_posts: 50,
        delay_ms: 5000,
        comment_enabled: true,
        like_enabled: true
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    await ActivityLogger.logActivity(agentId, 'session_started', true, {
        config: finalConfig,
        timestamp: new Date().toISOString()
    });

    // Use dynamic port to avoid conflicts
    const proxyPort = 8000 + Math.floor(Math.random() * 1000);
    const server = new Server({ port: proxyPort });
    await server.listen();
    const proxyUrl = `http://localhost:${proxyPort}`;
    const browser = await puppeteer.launch({
        headless: false,
        args: [`--proxy-server=${proxyUrl}`],
    });

    const page = await browser.newPage();
    const cookiesPath = "./cookies/Instagramcookies.json";

    try {
        const checkCookies = await Instagram_cookiesExist();
        logger.info(`Checking cookies existence: ${checkCookies}`);

        if (checkCookies) {
            const cookies = await loadCookies(cookiesPath);
            await page.setCookie(...cookies);
            logger.info('Cookies loaded and set on the page.');

            // Navigate to Instagram to verify if cookies are valid
            await page.goto("https://www.instagram.com/", { waitUntil: 'networkidle2' });

            // Check if login was successful by verifying page content (e.g., user profile or feed)
            const isLoggedIn = await page.$("a[href='/direct/inbox/']");
            if (isLoggedIn) {
                logger.info("Login verified with cookies.");
                await ActivityLogger.logActivity(agentId, 'login_verified', true, {
                    method: 'cookies'
                });
            } else {
                logger.warn("Cookies invalid or expired. Logging in again...");
                await loginWithCredentials(page, browser, agentId);
            }
        } else {
            // If no cookies are available, perform login with credentials
            await loginWithCredentials(page, browser, agentId);
        }

        // Optionally take a screenshot after loading the page
        await page.screenshot({ path: "logged_in.png" });

        // Navigate to the Instagram homepage
        await page.goto("https://www.instagram.com/");

        // Interact with posts based on config
        await interactWithPostsTracked(page, agentId, finalConfig);

    } catch (error) {
        await ActivityLogger.logActivity(agentId, 'session_error', false, {
            error_message: (error as Error).message
        });
        logger.error('Instagram agent error:', error);
    } finally {
        await browser.close();
        await server.close(true);
        await ActivityLogger.logActivity(agentId, 'session_ended', true, {
            timestamp: new Date().toISOString()
        });
    }
}

const loginWithCredentials = async (page: any, browser: Browser, agentId: string) => {
    try {
        await page.goto("https://www.instagram.com/accounts/login/");
        await page.waitForSelector('input[name="username"]');

        // Fill out the login form
        await page.type('input[name="username"]', IGusername);
        await page.type('input[name="password"]', IGpassword);
        await page.click('button[type="submit"]');

        // Wait for navigation after login
        await page.waitForNavigation();

        // Save cookies after login
        const cookies = await browser.cookies();
        await saveCookies("./cookies/Instagramcookies.json", cookies);
        
        await ActivityLogger.logActivity(agentId, 'login_success', true, {
            method: 'credentials'
        });
    } catch (error) {
        await ActivityLogger.logActivity(agentId, 'login_failed', false, {
            method: 'credentials',
            error_message: (error as Error).message
        });
        logger.error("Error logging in with credentials:", error);
    }
}

async function interactWithPostsTracked(page: any, agentId: string, config: AgentConfig) {
    let postIndex = 1;
    const maxPosts = config.max_posts || 50;

    while (postIndex <= maxPosts && !shouldStop()) {
        try {
            const postSelector = `article:nth-of-type(${postIndex})`;

            // Check if the post exists
            if (!(await page.$(postSelector))) {
                await ActivityLogger.logActivity(agentId, 'no_more_posts', true, {
                    posts_processed: postIndex - 1
                });
                console.log("No more posts found. Ending iteration...");
                return;
            }

            await ActivityLogger.logActivity(agentId, 'post_discovered', true, {
                post_index: postIndex
            });

            // Like the post if enabled
            if (config.like_enabled) {
                await handleLikeAction(page, postSelector, postIndex, agentId);
            }

            // Extract caption
            const caption = await extractCaption(page, postSelector, postIndex, agentId);

            // Comment on the post if enabled
            if (config.comment_enabled && caption) {
                await handleCommentAction(page, postSelector, postIndex, caption, agentId);
            }

            // Wait before moving to the next post
            const waitTime = config.delay_ms || 5000;
            await ActivityLogger.logActivity(agentId, 'waiting', true, {
                wait_time_ms: waitTime,
                post_index: postIndex
            });
            
            console.log(`Waiting ${waitTime / 1000} seconds before moving to the next post...`);
            await delay(waitTime);

            // Scroll to the next post
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });

            postIndex++;
        } catch (error) {
            await ActivityLogger.logActivity(agentId, 'post_interaction_error', false, {
                post_index: postIndex,
                error_message: (error as Error).message
            });
            console.error(`Error interacting with post ${postIndex}:`, error);
            break;
        }
    }

    if (shouldStop()) {
        await ActivityLogger.logActivity(agentId, 'session_stopped_by_user', true, {
            posts_processed: postIndex - 1
        });
    }
}

async function handleLikeAction(page: any, postSelector: string, postIndex: number, agentId: string) {
    try {
        const likeButtonSelector = `${postSelector} svg[aria-label="Like"]`;
        const likeButton = await page.$(likeButtonSelector);
        const ariaLabel = await likeButton?.evaluate((el: Element) =>
            el.getAttribute("aria-label")
        );

        if (ariaLabel === "Like") {
            console.log(`Liking post ${postIndex}...`);
            await likeButton.click();
            await page.keyboard.press("Enter");
            
            await ActivityLogger.logActivity(agentId, 'like_post', true, {
                post_index: postIndex,
                already_liked: false
            });
            
            console.log(`Post ${postIndex} liked.`);
        } else if (ariaLabel === "Unlike") {
            await ActivityLogger.logActivity(agentId, 'like_post', true, {
                post_index: postIndex,
                already_liked: true
            });
            console.log(`Post ${postIndex} is already liked.`);
        } else {
            await ActivityLogger.logActivity(agentId, 'like_post', false, {
                post_index: postIndex,
                error_message: 'Like button not found'
            });
            console.log(`Like button not found for post ${postIndex}.`);
        }
    } catch (error) {
        await ActivityLogger.logActivity(agentId, 'like_post', false, {
            post_index: postIndex,
            error_message: (error as Error).message
        });
    }
}

async function extractCaption(page: any, postSelector: string, postIndex: number, agentId: string): Promise<string> {
    try {
        const captionSelector = `${postSelector} div.x9f619 span._ap3a div span._ap3a`;
        const captionElement = await page.$(captionSelector);

        let caption = "";
        if (captionElement) {
            caption = await captionElement.evaluate((el: HTMLElement) => el.innerText);
            console.log(`Caption for post ${postIndex}: ${caption}`);
        } else {
            console.log(`No caption found for post ${postIndex}.`);
        }

        // Check if there is a '...more' link to expand the caption
        const moreLinkSelector = `${postSelector} div.x9f619 span._ap3a span div span.x1lliihq`;
        const moreLink = await page.$(moreLinkSelector);
        if (moreLink) {
            console.log(`Expanding caption for post ${postIndex}...`);
            await moreLink.click();
            const expandedCaption = await captionElement.evaluate(
                (el: HTMLElement) => el.innerText
            );
            console.log(`Expanded Caption for post ${postIndex}: ${expandedCaption}`);
            caption = expandedCaption;
        }

        await ActivityLogger.logActivity(agentId, 'caption_extracted', true, {
            post_index: postIndex,
            caption_preview: caption.substring(0, 100),
            caption_length: caption.length
        });

        return caption;
    } catch (error) {
        await ActivityLogger.logActivity(agentId, 'caption_extracted', false, {
            post_index: postIndex,
            error_message: (error as Error).message
        });
        return "";
    }
}

async function handleCommentAction(page: any, postSelector: string, postIndex: number, caption: string, agentId: string) {
    try {
        const commentBoxSelector = `${postSelector} textarea`;
        const commentBox = await page.$(commentBoxSelector);
        
        if (commentBox) {
            console.log(`Commenting on post ${postIndex}...`);
            
            // Generate comment using AI
            const prompt = `Craft a thoughtful, engaging, and mature reply to the following post: "${caption}". Ensure the reply is relevant, insightful, and adds value to the conversation. It should reflect empathy and professionalism, and avoid sounding too casual or superficial. also it should be 300 characters or less. and it should not go against instagram Community Standards on spam. so you will have to try your best to humanize the reply`;
            const schema = getInstagramCommentSchema();
            
            const startTime = Date.now();
            const result = await runAgent(schema, prompt);
            const generationTime = Date.now() - startTime;
            
            const comment = result[0]?.comment;
            const viralRate = result[0]?.viralRate;
            
            await ActivityLogger.logActivity(agentId, 'comment_generated', true, {
                post_index: postIndex,
                comment: comment,
                viral_rate: viralRate,
                generation_time_ms: generationTime,
                caption_preview: caption.substring(0, 50)
            });

            // Type the comment
            await commentBox.type(comment);

            // Find and click the post button
            const postButton = await page.evaluateHandle(() => {
                const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
                return buttons.find(button => button.textContent === 'Post' && !button.hasAttribute('disabled'));
            });

            if (postButton) {
                console.log(`Posting comment on post ${postIndex}...`);
                await postButton.click();
                
                await ActivityLogger.logActivity(agentId, 'comment_posted', true, {
                    post_index: postIndex,
                    comment: comment
                });
                
                console.log(`Comment posted on post ${postIndex}.`);
            } else {
                await ActivityLogger.logActivity(agentId, 'comment_posted', false, {
                    post_index: postIndex,
                    error_message: 'Post button not found'
                });
                console.log("Post button not found.");
            }
        } else {
            await ActivityLogger.logActivity(agentId, 'comment_posted', false, {
                post_index: postIndex,
                error_message: 'Comment box not found'
            });
            console.log("Comment box not found.");
        }
    } catch (error) {
        await ActivityLogger.logActivity(agentId, 'comment_action_error', false, {
            post_index: postIndex,
            error_message: (error as Error).message
        });
    }
}