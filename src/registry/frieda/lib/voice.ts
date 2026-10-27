import { toast } from "sonner"

/** One-shot dictation with the Web Speech API. Calls `onText` with what was heard. */
export function startVoiceInput(onText: (text: string) => void) {
  const Recognition =
    typeof window !== "undefined"
      ? ((window as unknown as Record<string, unknown>).SpeechRecognition ??
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition)
      : undefined
  if (!Recognition) {
    toast("Voice input isn’t supported in this browser")
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the Web Speech API has no TS lib types
  const rec = new (Recognition as any)()
  rec.lang = "en-US"
  rec.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => onText(e.results[0][0].transcript)
  rec.onerror = () => toast.error("Didn’t catch that. Try again.")
  rec.start()
  toast("Listening…", { duration: 2500 })
}
