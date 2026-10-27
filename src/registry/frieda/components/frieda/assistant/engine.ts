import { savings, transactions, TODAY } from "@/registry/frieda/lib/data"
import { monthLabel } from "@/registry/frieda/lib/format"

/** Rich attachments an assistant reply can carry. */
export type AssistantWidget =
  | { type: "balance"; value: number; change: number; spark: number[] }
  | { type: "document"; name: string; size: string }
  | { type: "budget"; spent: number; limit: number; label: string }
  | { type: "spending"; months: { label: string; value: number }[]; change: number }
  | { type: "transactions"; ids: string[] }

export type AssistantReply = { text: string; widget?: AssistantWidget; topic: string }

const lastMonth = monthLabel(new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1))

/**
 * Mock replies so the template runs without an API key.
 * Swap this for your model call (for example the AI SDK's streamText).
 */
export function reply(input: string): AssistantReply {
  const q = input.toLowerCase()

  if (/balance|how much (money|do i have)/.test(q)) {
    return {
      topic: "Finance insights",
      text: "Absolutely! Here it is:",
      widget: { type: "balance", value: savings.value, change: 3.2, spark: savings.spark },
    }
  }
  if (/ahmed/.test(q)) {
    const ids = transactions.filter((t) => t.personId === "ahmed-halici").map((t) => t.id)
    return {
      topic: "Transactions with Ahmed",
      text: `You and Ahmed have ${ids.length} transactions this year. You sent him $500 and received $640 back, so you’re $140 ahead.`,
      widget: { type: "transactions", ids },
    }
  }
  if (/transaction|statement|document|pdf|export/.test(q)) {
    return {
      topic: "Finance insights",
      text: "Here’s your document:",
      widget: { type: "document", name: `${lastMonth} Transactions.pdf`, size: "0.9 MB" },
    }
  }
  if (/budget|shopping|groceries|afford/.test(q)) {
    return {
      topic: "Budget planning",
      text: "This week’s shopping budget is $350. You’ve spent $212.90 so far, which leaves $137.10 until Sunday. Groceries are your biggest category this week.",
      widget: { type: "budget", spent: 212.9, limit: 350, label: "Weekly shopping" },
    }
  }
  if (/increase|3 months|three months|trend/.test(q)) {
    return {
      topic: "Spending report",
      text: "Yes, a little. Your spending rose 8% over the last 3 months, mostly from money transfers and a one-off electricity bill in October.",
      widget: {
        type: "spending",
        change: 8,
        months: [
          { label: "Aug", value: 4800 },
          { label: "Sep", value: 5050 },
          { label: "Oct", value: 5190 },
        ],
      },
    }
  }
  if (/report|6 months|six months|spending/.test(q)) {
    return {
      topic: "Spending report",
      text: "Here’s your spending for the last 6 months. May was the peak at $7.3k; since then you’ve held steady around $5k a month.",
      widget: {
        type: "spending",
        change: -3.2,
        months: [
          { label: "Jun", value: 4800 },
          { label: "Jul", value: 5200 },
          { label: "Aug", value: 4800 },
          { label: "Sep", value: 5050 },
          { label: "Oct", value: 5190 },
          { label: "Nov", value: 1210 },
        ],
      },
    }
  }
  if (/thank/.test(q)) {
    return { topic: "Finance insights", text: "You’re welcome! Ask me anything else about your money, any time." }
  }
  if (/save|saving|goal/.test(q)) {
    return {
      topic: "Savings goal",
      text: `You’ve saved $${savings.value.toLocaleString("en-US")} so far and have $${savings.leftToGoal.toLocaleString("en-US")} left to reach your goal. Moving $500 a week would get you there by next autumn.`,
    }
  }
  if (/2024|crypto|ai|future|news/.test(q)) {
    return {
      topic: "Finance insights",
      text: "In 2024, digital currencies and AI-driven financial tools are revolutionizing personal finance management.",
    }
  }
  return {
    topic: input.length > 28 ? `${input.slice(0, 28).trim()}…` : input,
    text: "I can check your balance, build spending reports, plan budgets and find transactions with anyone in your recipients. What would you like to look at?",
  }
}
