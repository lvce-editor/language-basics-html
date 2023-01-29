import { execaCommand } from 'execa'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const COMMIT = '24592e00aadd00e35c5fb40ce1f79dbbe2ccd380'

const getTestName = (line) => {
  return (
    'codemirror-' +
    line
      .toLowerCase()
      .slice(1)
      .trim()
      .replaceAll(' ', '-')
      .replaceAll('/', '-')
      .replace(/\{.*$/, '')
  )
}

const getTestContent = (lines) => {
  return lines.join('\n').trim() + '\n'
}

const parseFile = (content) => {
  const tests = []
  const lines = content.split('\n')
  let state = 'top'
  let testName = ''
  let testLines = []
  for (const line of lines) {
    switch (state) {
      case 'top':
        if (line.startsWith('#')) {
          testName = getTestName(line)
          state = 'content'
        } else {
          // ignore
        }
        break
      case 'content':
        if (line.startsWith('==>')) {
          tests.push({ testName, testContent: getTestContent(testLines) })
          state = 'top'
          testName = ''
          testLines = []
        } else {
          testLines.push(line)
        }
        break
      default:
        break
    }
  }
  return tests
}

const getAllTests = async (folder) => {
  const dirents = await readdir(folder)
  const allTests = []
  for (const dirent of dirents) {
    const filePath = `${folder}/${dirent}`
    const fileContent = await readFile(filePath, 'utf8')
    const parsed = parseFile(fileContent)
    allTests.push(...parsed)
  }
  return allTests
}

const main = async () => {
  process.chdir(root)
  await rm(`${root}/.tmp`, { recursive: true, force: true })
  await execaCommand(
    `git clone https://github.com/lezer-parser/html .tmp/code-mirror-html`
  )
  process.chdir(`${root}/.tmp/code-mirror-html`)
  await execaCommand(`git checkout ${COMMIT}`)
  process.chdir(root)
  await cp(
    `${root}/.tmp/code-mirror-html/test`,
    `${root}/.tmp/code-mirror-cases`,
    { recursive: true }
  )
  await rm(`${root}/.tmp/code-mirror-cases/test-html.js`)
  await rm(`${root}/.tmp/code-mirror-cases/test-incremental.js`)
  await rm(`${root}/.tmp/code-mirror-cases/vue.txt`)
  const allTests = await getAllTests(`${root}/.tmp/code-mirror-cases`)
  for (const test of allTests) {
    await writeFile(
      `${root}/test/cases/${test.testName}.html`,
      test.testContent
    )
  }
}

main()
