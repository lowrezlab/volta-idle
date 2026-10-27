/**
 * Import Aseprite-exported hero parts into generated TypeScript (GDD section 7.3).
 *
 *   pnpm tsx tools/art/aseprite-import.ts <export-dir> [--out <generated-dir>] [--sheet <contact-sheet.png>]
 *
 * <export-dir> is what tools/art/aseprite/export.sh wrote (or tools/art/aseprite/placeholder.ts). The generated
 * modules go to packages/wardenwatch/src/art/parts/generated/ by default, replacing every slot directory and
 * index.ts there, and the contact sheet to <export-dir>/contact-sheet.png. Exits 1 and lists every problem when
 * a part fails the contract; nothing is written then.
 */
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ImportError, importExport } from './aseprite/importer'

const args = process.argv.slice(2)
const flag = (name: string): string | undefined => {
  const at = args.indexOf(name)
  if (at === -1) return undefined
  const value = args[at + 1]
  args.splice(at, 2)
  return value
}
const out = flag('--out')
const sheet = flag('--sheet')
const [exportDir] = args
if (!exportDir || args.length !== 1) {
  console.error('usage: pnpm tsx tools/art/aseprite-import.ts <export-dir> [--out <generated-dir>] [--sheet <contact-sheet.png>]')
  process.exit(2)
}

const generatedDir = out ?? resolve(fileURLToPath(import.meta.url), '../../../packages/wardenwatch/src/art/parts/generated')
const sheetPath = sheet ?? resolve(exportDir, 'contact-sheet.png')

try {
  const { parts, files } = importExport(resolve(exportDir), generatedDir, sheetPath)
  for (const part of parts) console.log(`${part.slot.padEnd(9)} ${part.id}${part.tier ? ` (${part.tier})` : ''}: ${Object.keys(part.frames).join(' ')}`)
  console.log(`${parts.length} part${parts.length === 1 ? '' : 's'}, ${files.size} files -> ${generatedDir}`)
  console.log(`contact sheet -> ${sheetPath}`)
} catch (error) {
  if (error instanceof ImportError) {
    console.error(`aseprite-import: ${error.message}`)
    process.exit(1)
  }
  throw error
}
