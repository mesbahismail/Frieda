// Copies the template's CSS into registry.json so `shadcn add` writes it into
// the user's globals.css. Runs before `shadcn build` (see package.json).
//
// - theme item: Frieda tokens (cssVars) and component classes (css)
// - chat item:  chatcn's theme variables plus the keyframes its classes expect.
//   Upstream chatcn ships its css as one string, which the shadcn CLI rejects
//   ("css: expected record"), so this is the fixed version.

import { readFileSync, writeFileSync } from "node:fs"
import postcss from "postcss"

const root = new URL("..", import.meta.url)
const read = (path) => readFileSync(new URL(path, root), "utf8")

// shadcn's own tokens. They are already in every shadcn project's @theme block.
const shadcnTheme = new Set([
  "font-heading",
  "radius-sm",
  "radius-md",
  "radius-lg",
  "radius-xl",
  "radius-2xl",
  "radius-3xl",
  "radius-4xl",
])
const isShadcnColor = (name) =>
  /^color-(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|chart-\d|sidebar)/.test(name)

/** postcss nodes → the nested record format of registry-item.json "css" */
function toRecord(nodes, into = {}) {
  for (const node of nodes) {
    if (node.type === "decl") into[node.prop] = node.value
    if (node.type === "rule") into[node.selector] = toRecord(node.nodes, into[node.selector] ?? {})
    if (node.type === "atrule") {
      const key = `@${node.name} ${node.params}`.trim()
      into[key] = toRecord(node.nodes ?? [], into[key] ?? {})
    }
  }
  return into
}

const isChat = (node) =>
  (node.type === "rule" && node.selector.split(",").every((s) => s.trim().startsWith(".chat-"))) ||
  (node.type === "atrule" && node.name === "keyframes" && node.params.startsWith("chat-")) ||
  (node.type === "atrule" && node.name === "media" && node.nodes.every(isChat))

const globals = postcss.parse(read("src/app/globals.css"))
const theme = { cssVars: { theme: {}, light: {}, dark: {} }, css: {} }
const chatFixes = []

globals.each((node) => {
  if (node.type === "comment") return
  if (node.type === "atrule" && ["import", "custom-variant"].includes(node.name)) return

  if (node.type === "atrule" && node.name === "theme") {
    node.each((child) => {
      if (child.type === "decl") {
        const name = child.prop.replace(/^--/, "")
        if (!shadcnTheme.has(name) && !isShadcnColor(name)) theme.cssVars.theme[name] = child.value
      }
      if (child.type === "atrule" && child.name === "keyframes") toRecord([child], theme.css)
    })
    return
  }

  if (node.type === "rule" && node.selector.replace(/\s/g, "") === ":root,.dark") {
    node.each((decl) => {
      if (decl.type !== "decl") return
      if (decl.prop === "color-scheme") {
        theme.css["@layer base"] = { ...theme.css["@layer base"], ":root": { "color-scheme": decl.value } }
        return
      }
      const name = decl.prop.replace(/^--/, "")
      theme.cssVars.light[name] = decl.value
      theme.cssVars.dark[name] = decl.value
    })
    return
  }

  if (node.type === "atrule" && node.name === "layer" && node.params === "base") {
    const base = node.clone()
    base.each((rule) => {
      // shadcn's base layer already sets these two.
      if (rule.type === "rule" && ["*", "html"].includes(rule.selector)) rule.remove()
    })
    toRecord([base], theme.css)
    return
  }

  if (isChat(node)) chatFixes.push(node)
  else toRecord([node], theme.css)
})

const chatcn = postcss.parse(read("src/components/ui/chat/chatcn.css"))
const chatCss = toRecord(chatcn.nodes.filter((n) => n.type !== "comment"))
toRecord(chatFixes, chatCss)

const registryPath = new URL("registry.json", root)
const registry = JSON.parse(readFileSync(registryPath, "utf8"))
for (const item of registry.items) {
  if (item.name === "theme") Object.assign(item, theme)
  if (item.name === "chat") item.css = chatCss
}
writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`)

console.log(
  `registry.json: theme (${Object.keys(theme.cssVars.light).length} vars, ${Object.keys(theme.css).length} css blocks), chat (${Object.keys(chatCss).length} css blocks)`
)
