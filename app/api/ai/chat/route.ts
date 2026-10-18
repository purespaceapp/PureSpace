
import "server-only";

import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 3000;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to use the assistant." },
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "The AI assistant is not configured yet." },
        { status: 503 }
      );
    }

    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("messages" in body) ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0 ||
      body.messages.length > MAX_MESSAGES
    ) {
      return NextResponse.json(
        { error: "Invalid message history." },
        { status: 400 }
      );
    }

    const messages = body.messages as ChatMessage[];

    if (
      messages.some(
        (message) =>
          !message ||
          typeof message !== "object" ||
          !["user", "assistant"].includes(message.role) ||
          typeof message.content !== "string" ||
          !message.content.trim() ||
          message.content.length > MAX_MESSAGE_LENGTH
      ) ||
      messages[messages.length - 1]?.role !== "user"
    ) {
      return NextResponse.json(
        { error: "Messages must contain valid text." },
        { status: 400 }
      );
    }

    const roleInstructions =
      session.role === "office"
        ? "The user is an authenticated PureSpace Office Staff member. Help with cleaning operations, schedules, inventory, property reports, invoices, and communication. Do not claim to have accessed or changed company records unless an authorized tool actually did so."
        : "The user is an authenticated PureSpace Property Owner. Help with property operations, cleaning reports, inventory, maintenance, and billing. Never reveal another owner's information. Do not claim to have accessed or changed property records unless an authorized tool actually did so.";

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are PureSpace AI Assistant, a professional and friendly assistant for a property cleaning business. " +
            "Reply in the same language as the user's latest message, especially English or Spanish. " +
            "Be concise, practical, and honest about your capabilities. " +
            "You currently have no tools to read or change company records, send messages, assign cleaners, or perform billing actions. " +
            "Never invent bookings, prices, inventory counts, reports, or completed actions. " +
            "Routine advice is fine, but real system changes require an authorized workflow. " +
            roleInstructions,
        },
        ...messages,
      ],
      max_completion_tokens: 700,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "The assistant could not generate a reply." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(
      "AI chat request failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "Unable to process your message right now." },
      { status: 500 }
    );
  }
}
