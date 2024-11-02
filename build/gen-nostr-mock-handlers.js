import fs from 'fs'
import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const handlersDir = path.join(__dirname, '../src/nostr-mocks/handlers')
const outputFilePath = path.join(__dirname, '../src/nostr-mocks/handlers.ts')

/**
 * Read the directory recursively and return an array of file paths
 * @param {string} dir
 * @returns {string[]}
 */
const readdirRecursive = dir => {
  const files = fs.readdirSync(dir, { withFileTypes: true })
  const dirnames = files.map(file => {
    if (file.name === 'index.ts') return [dir]

    if (file.isDirectory()) {
      const res = path.resolve(dir, file.name)
      return readdirRecursive(res)
    }
  })
  return dirnames.flat()
}

/**
 * Generate the output file
 * @param {string[]} files
 */
const generateOutput = files => {
  const imports = files.map((file, index) => {
    const variableName = `handler${index}`
    return `import ${variableName} from '/@/nostr-mocks/handlers/${file}';`
  })

  const handlersArray = files.map((_, index) => `handler${index}`)

  const output = `// DO NOT EDIT!
// This file is generated by build/gen-nostr-mock-handlers.js
// Run 'node build/gen-nostr-mock-handlers.js' to regenerate this file

${imports.join('\n')}

export const handlers = [
  ${handlersArray.join(',\n  ')}
].flat()
`

  fs.writeFileSync(outputFilePath, output)
  console.log('gen-nostr-mock-handlers.js has been generated successfully.')
}

const files = readdirRecursive(handlersDir)
  .map(file => file.replace(handlersDir + '/', ''))
  .map(file => file.replace('.ts', ''))
files.sort((a, b) => b.localeCompare(a))

generateOutput(files)
