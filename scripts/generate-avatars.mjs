// Generates the Frieda people avatars into public/frieda/avatars.
// Run with: node scripts/generate-avatars.mjs
// Style: DiceBear "Avataaars" by Pablo Stanley (free for personal and commercial use).
import { mkdirSync, writeFileSync } from "node:fs"
import { createAvatar } from "@dicebear/core"
import { avataaars } from "@dicebear/collection"

const base = {
  eyes: ["happy"],
  eyebrows: ["defaultNatural"],
  mouth: ["smile"],
  accessoriesProbability: 0,
  facialHairProbability: 0,
  clothing: ["shirtCrewNeck"],
}

const people = {
  frieda: { top: ["curvy"], hairColor: ["2c1b18"], skinColor: ["d08b5b"], clothesColor: ["262e33"] },
  imane: { top: ["hijab"], hatColor: ["e6e6e6"], skinColor: ["edb98a"], accessories: ["prescription02"], accessoriesProbability: 100, clothesColor: ["929598"] },
  carlos: { top: ["shortWaved"], hairColor: ["d6b370"], skinColor: ["ffdbb4"], accessories: ["round"], accessoriesProbability: 100, clothesColor: ["65c9ff"] },
  hafsa: { top: ["hijab"], hatColor: ["ff5c5c"], skinColor: ["edb98a"], accessories: ["round"], accessoriesProbability: 100, clothesColor: ["ff5c5c"] },
  danny: { top: ["shortFlat"], hairColor: ["2c1b18"], skinColor: ["ae5d29"], eyes: ["wink"], clothesColor: ["3c4f5c"] },
  sarah: { top: ["hat"], hatColor: ["ffdeb5"], skinColor: ["edb98a"], clothesColor: ["e6e6e6"] },
  dana: { top: ["shortCurly"], hairColor: ["4a312c"], skinColor: ["ffdbb4"], accessories: ["round"], accessoriesProbability: 100, clothesColor: ["a7ffc4"] },
  samantha: { top: ["hat"], hatColor: ["ffdeb5"], skinColor: ["ffdbb4"], clothesColor: ["ffafb9"] },
  "ann-matic": { top: ["winterHat02"], hatColor: ["ffdeb5"], skinColor: ["edb98a"], clothesColor: ["ffffb1"] },
  "ahmed-halici": { top: ["turban"], hatColor: ["e6e6e6"], skinColor: ["d08b5b"], facialHair: ["beardMedium"], facialHairProbability: 100, facialHairColor: ["2c1b18"], accessories: ["prescription02"], accessoriesProbability: 100, clothesColor: ["262e33"] },
  "arnold-barzan": { top: ["hat"], hatColor: ["929598"], skinColor: ["ffdbb4"], facialHair: ["moustacheFancy"], facialHairProbability: 100, facialHairColor: ["724133"], accessories: ["round"], accessoriesProbability: 100, clothesColor: ["25557c"] },
  "brandon-philips": { top: ["shortWaved"], hairColor: ["d6b370"], skinColor: ["ffdbb4"], accessories: ["prescription01"], accessoriesProbability: 100, clothesColor: ["5199e4"] },
  "bella-samaan": { top: ["straight01"], hairColor: ["f59797"], skinColor: ["edb98a"], accessories: ["round"], accessoriesProbability: 100, clothesColor: ["ff488e"] },
  "chaimae-mahfoud": { top: ["hijab"], hatColor: ["ff5c5c"], skinColor: ["ffdbb4"], accessories: ["prescription01"], accessoriesProbability: 100, clothesColor: ["ff5c5c"] },
  "chad-asmeer": { top: ["shortFlat"], hairColor: ["2c1b18"], skinColor: ["614335"], clothesColor: ["e6e6e6"] },
  "chris-bumford": { top: ["shortRound"], hairColor: ["c93305"], skinColor: ["ffdbb4"], facialHair: ["beardLight"], facialHairProbability: 100, facialHairColor: ["c93305"], accessories: ["round"], accessoriesProbability: 100, clothesColor: ["3c4f5c"] },
  "david-osei": { top: ["shortCurly"], hairColor: ["2c1b18"], skinColor: ["614335"], clothesColor: ["ffffb1"] },
  "diana-ruiz": { top: ["longButNotTooLong"], hairColor: ["724133"], skinColor: ["edb98a"], clothesColor: ["b1e2ff"] },
  "elias-karam": { top: ["theCaesar"], hairColor: ["4a312c"], skinColor: ["d08b5b"], facialHair: ["beardLight"], facialHairProbability: 100, facialHairColor: ["4a312c"], clothesColor: ["262e33"] },
  "eva-lindt": { top: ["bob"], hairColor: ["ecdcbf"], skinColor: ["ffdbb4"], clothesColor: ["ffafb9"] },
  "farah-nasser": { top: ["bigHair"], hairColor: ["2c1b18"], skinColor: ["d08b5b"], clothesColor: ["a7ffc4"] },
  "felix-wong": { top: ["shortFlat"], hairColor: ["2c1b18"], skinColor: ["f8d25c"], accessories: ["wayfarers"], accessoriesProbability: 100, clothesColor: ["929598"] },
  "hana-sato": { top: ["straight02"], hairColor: ["2c1b18"], skinColor: ["f8d25c"], clothesColor: ["ff488e"] },
  "karim-bennani": { top: ["shortRound"], hairColor: ["2c1b18"], skinColor: ["d08b5b"], facialHair: ["beardMedium"], facialHairProbability: 100, facialHairColor: ["2c1b18"], clothesColor: ["5199e4"] },
  "lara-voss": { top: ["miaWallace"], hairColor: ["2c1b18"], skinColor: ["ffdbb4"], clothesColor: ["262e33"] },
  "mona-adel": { top: ["curly"], hairColor: ["724133"], skinColor: ["ae5d29"], clothesColor: ["ffffb1"] },
  "omar-faris": { top: ["sides"], hairColor: ["4a312c"], skinColor: ["d08b5b"], facialHair: ["beardMajestic"], facialHairProbability: 100, facialHairColor: ["4a312c"], clothesColor: ["25557c"] },
  "sofia-marin": { top: ["straightAndStrand"], hairColor: ["b58143"], skinColor: ["edb98a"], clothesColor: ["65c9ff"] },
  "tom-becker": { top: ["shaggy"], hairColor: ["b58143"], skinColor: ["ffdbb4"], clothesColor: ["3c4f5c"] },
  "yara-haddad": { top: ["frida"], hairColor: ["2c1b18"], skinColor: ["d08b5b"], clothesColor: ["ff5c5c"] },
  "zane-cooper": { top: ["dreads01"], hairColor: ["2c1b18"], skinColor: ["614335"], clothesColor: ["a7ffc4"] },
}

const out = new URL("../public/frieda/avatars/", import.meta.url)
mkdirSync(out, { recursive: true })

for (const [id, traits] of Object.entries(people)) {
  const svg = createAvatar(avataaars, { seed: id, ...base, ...traits }).toString()
  writeFileSync(new URL(`${id}.svg`, out), svg)
}

console.log(`Generated ${Object.keys(people).length} avatars`)
