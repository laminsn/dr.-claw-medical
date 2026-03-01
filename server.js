/**
 * ============================================================
 * server.js — Backend API Server for AI Conversation
 * ============================================================
 *
 * WHY DO WE NEED THIS SERVER?
 * ----------------------------
 * API keys (Deepgram, OpenAI, Tavus) must stay SECRET on the server.
 * If we put them in the browser code, anyone could steal them and
 * rack up charges on your accounts. This server acts as a secure
 * middleman between the browser (frontend) and the AI APIs.
 *
 * WHAT DOES IT DO?
 * ----------------
 * 1. /api/deepgram/key     → Gives the frontend a Deepgram API key
 *                             so it can connect to Deepgram's WebSocket
 *                             for real-time speech-to-text.
 *
 * 2. /api/chat              → Receives a user message, sends it to
 *                             OpenAI GPT-4o-mini, and returns the
 *                             AI's response.
 *
 * 3. /api/tavus/conversation → Creates a new Tavus CVI (Conversational
 *                              Video Interface) session and returns
 *                              an embed URL for the talking avatar.
 *
 * 4. /api/health             → Quick check to see which API keys are
 *                              configured and working.
 *
 * HOW TO RUN:
 * -----------
 * 1. Fill in your API keys in the .env file (see .env.example)
 * 2. Run: node server.js
 * 3. The server starts on http://localhost:3001
 * 4. In a separate terminal, run: npm run dev (for the React frontend)
 * 5. The frontend (port 8080) auto-proxies API calls to this server
 *
 * ============================================================
 */

// ─── IMPORTS ─────────────────────────────────────────────────
// "import" is the modern way to load packages in JavaScript (ESM modules)

import 'dotenv/config';   // Loads your .env file so process.env.* works
import express from 'express';    // Express = the most popular Node.js web server framework
import cors from 'cors';          // CORS = allows the frontend (port 8080) to talk to this server (port 3001)
import OpenAI from 'openai';      // Official OpenAI SDK for calling GPT-4o-mini

// ─── CREATE THE SERVER ───────────────────────────────────────
const app = express();

// ─── MIDDLEWARE ──────────────────────────────────────────────
// Middleware = functions that run on every request before your route handler

app.use(cors());           // Allow cross-origin requests (frontend ↔ server on different ports)
app.use(express.json());   // Automatically parse JSON in request bodies

// ─── INITIALIZE OPENAI CLIENT ────────────────────────────────
// This creates a reusable OpenAI client that all requests can share.
// The API key comes from your .env file.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// ═══════════════════════════════════════════════════════════════
// ENDPOINT 1: GET DEEPGRAM API KEY
// ═══════════════════════════════════════════════════════════════
//
// WHAT: Returns the Deepgram API key to the frontend.
// WHY:  The frontend needs this key to open a WebSocket connection
//       directly to Deepgram for real-time speech-to-text.
// HOW:  The key stays in your .env file. The frontend requests it
//       when the user clicks the microphone button.
//
// SECURITY NOTE FOR PRODUCTION:
// In a real production app, you'd create short-lived temporary
// keys using Deepgram's key management API instead of sharing
// the main key. For learning purposes, this approach works fine.
// ═══════════════════════════════════════════════════════════════
app.get('/api/deepgram/key', (req, res) => {
  const key = process.env.DEEPGRAM_API_KEY;

  // If the key isn't set, tell the developer what's wrong
  if (!key) {
    return res.status(500).json({
      error: 'DEEPGRAM_API_KEY is not set. Add it to your .env file.',
    });
  }

  res.json({ key });
});


// ═══════════════════════════════════════════════════════════════
// ENDPOINT 2: CHAT WITH OPENAI GPT-4o-mini
// ═══════════════════════════════════════════════════════════════
//
// WHAT: Receives the full conversation history from the frontend,
//       sends it to OpenAI's GPT-4o-mini model, and returns the
//       AI's response.
//
// WHY SEND THE FULL HISTORY?
// GPT-4o-mini doesn't remember previous messages on its own.
// Each API call is independent. By sending the full conversation
// history every time, the AI can maintain context and give
// relevant responses (e.g., "As I mentioned earlier...").
//
// REQUEST BODY FORMAT:
// {
//   "messages": [
//     { "role": "user", "content": "What causes headaches?" },
//     { "role": "assistant", "content": "Headaches can be caused by..." },
//     { "role": "user", "content": "What about migraines?" }
//   ]
// }
// ═══════════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  try {
    // Extract the conversation messages from the request body
    const { messages } = req.body;

    // Validate that messages were provided
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Request body must include a "messages" array.',
      });
    }

    // Call OpenAI's Chat Completions API
    // This is the core AI interaction — the "brain" of the app
    const completion = await openai.chat.completions.create({
      // ── Model Selection ──
      // gpt-4o-mini is fast, affordable, and smart enough for most tasks
      model: 'gpt-4o-mini',

      // ── Messages Array ──
      // The first message is the "system prompt" — it sets the AI's personality
      // Then we include the full conversation history from the frontend
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful, friendly AI medical assistant for Dr. Claw Medical. ' +
            'You help patients with general health questions, appointment scheduling, ' +
            'and understanding their symptoms. Always recommend consulting a real ' +
            'doctor for serious concerns or emergencies. Keep responses concise, ' +
            'caring, and professional. If the patient describes an emergency, ' +
            'tell them to call 911 immediately.',
        },
        // Spread (...) the user's conversation history after the system prompt
        ...messages,
      ],

      // ── Response Settings ──
      max_tokens: 500,       // Limit response length (1 token ≈ 4 characters)
      temperature: 0.7,      // 0 = very precise, 1 = very creative. 0.7 = balanced
    });

    // Extract the AI's reply text from OpenAI's response object
    const reply = completion.choices[0].message.content;

    // Send it back to the frontend
    res.json({ reply });

  } catch (error) {
    // Log the full error for debugging (visible in your terminal)
    console.error('OpenAI API error:', error.message);

    // Send a user-friendly error to the frontend
    res.status(500).json({
      error: 'Failed to get AI response. Check that OPENAI_API_KEY is valid.',
    });
  }
});


// ═══════════════════════════════════════════════════════════════
// ENDPOINT 3: CREATE A TAVUS CVI CONVERSATION
// ═══════════════════════════════════════════════════════════════
//
// WHAT IS TAVUS CVI?
// Tavus "Conversational Video Interface" creates a real-time
// AI-powered video avatar. The avatar is a digital replica of
// a real person that talks with natural lip-sync and expressions.
//
// HOW IT WORKS:
// 1. We call Tavus's API to create a new "conversation"
// 2. Tavus returns a conversation_url
// 3. The frontend embeds this URL in an <iframe>
// 4. The avatar appears and can interact with the user
//
// WHAT YOU NEED:
// - TAVUS_API_KEY:    Your Tavus account API key
// - TAVUS_REPLICA_ID: The ID of the video avatar (replica) to use
// - TAVUS_PERSONA_ID: The ID of the persona (personality/behavior) to use
//
// You get these from https://platform.tavus.io
// ═══════════════════════════════════════════════════════════════
app.post('/api/tavus/conversation', async (req, res) => {
  try {
    // Check that Tavus credentials are configured
    if (!process.env.TAVUS_API_KEY) {
      return res.status(500).json({
        error: 'TAVUS_API_KEY is not set. Add it to your .env file.',
      });
    }

    // Call the Tavus API to create a new conversation
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.TAVUS_API_KEY,   // Auth header for Tavus
      },
      body: JSON.stringify({
        // replica_id = which avatar face/appearance to use
        replica_id: process.env.TAVUS_REPLICA_ID,

        // persona_id = which personality/behavior the avatar uses
        persona_id: process.env.TAVUS_PERSONA_ID,

        // A friendly name for this conversation session (for your records)
        conversation_name: `Dr. Claw Session — ${new Date().toISOString()}`,
      }),
    });

    // Handle Tavus API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavus API error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Failed to create Tavus conversation. Check your API key, replica_id, and persona_id.',
      });
    }

    // Parse the successful response
    const data = await response.json();

    // Send the conversation details back to the frontend
    // The frontend will use conversation_url to display the avatar in an iframe
    res.json({
      conversationId: data.conversation_id,
      conversationUrl: data.conversation_url,
    });

  } catch (error) {
    console.error('Tavus API error:', error.message);
    res.status(500).json({
      error: 'Failed to create Tavus conversation. Is the Tavus API reachable?',
    });
  }
});


// ═══════════════════════════════════════════════════════════════
// ENDPOINT 4: HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
//
// A simple endpoint to verify:
// - The server is running
// - Which API keys are configured (true/false, never the actual keys)
//
// Visit http://localhost:3001/api/health in your browser to check
// ═══════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Conversation API server is running!',
    // Show which keys are set (true/false) — never expose the actual keys!
    services: {
      deepgram: !!process.env.DEEPGRAM_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      tavus: !!process.env.TAVUS_API_KEY,
      tavus_replica: !!process.env.TAVUS_REPLICA_ID,
      tavus_persona: !!process.env.TAVUS_PERSONA_ID,
    },
  });
});


// ═══════════════════════════════════════════════════════════════
// START THE SERVER
// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('');
  console.log('=========================================');
  console.log('  AI Conversation API Server');
  console.log('=========================================');
  console.log(`  Running at:    http://localhost:${PORT}`);
  console.log(`  Health check:  http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('  API Key Status:');
  console.log(`    Deepgram:    ${process.env.DEEPGRAM_API_KEY ? 'SET' : 'MISSING — add to .env'}`);
  console.log(`    OpenAI:      ${process.env.OPENAI_API_KEY ? 'SET' : 'MISSING — add to .env'}`);
  console.log(`    Tavus:       ${process.env.TAVUS_API_KEY ? 'SET' : 'MISSING — add to .env'}`);
  console.log(`    Replica ID:  ${process.env.TAVUS_REPLICA_ID ? 'SET' : 'MISSING — add to .env'}`);
  console.log(`    Persona ID:  ${process.env.TAVUS_PERSONA_ID ? 'SET' : 'MISSING — add to .env'}`);
  console.log('');
  console.log('  Next: run "npm run dev" in another terminal for the frontend');
  console.log('=========================================');
  console.log('');
});
