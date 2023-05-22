import { execaCommand } from 'execa'
import { copyFile, cp, readdir, rm } from 'node:fs/promises'
import path, { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const REPOSITORY = 'https://github.com/fb55/htmlparser2'
const COMMIT = '7475934d4062d7eb86c534c035ddac6146e15780'

const getTestName = (line) => {
  return (
    'html-parser-2-' +
    line
      .toLowerCase()
      .trim()
      .replaceAll(' ', '-')
      .replaceAll('/', '-')
      .replaceAll('_', '-')
      .replaceAll('.xml', '.html')
  )
}

const getAllTests = async (folder) => {
  const dirents = await readdir(folder)
  const allTests = []
  for (const dirent of dirents) {
    const filePath = `${folder}/${dirent}`
    const name = getTestName(dirent)
    const destinationPath = join(root, 'test', 'cases', name)
    allTests.push({ filePath, destinationPath })
  }
  return allTests
}

const main = async () => {
  process.chdir(root)
  await rm(`${root}/.tmp`, { recursive: true, force: true })
  await execaCommand(`git clone ${REPOSITORY} .tmp/html-parser-2`)
  process.chdir(`${root}/.tmp/html-parser-2`)
  await execaCommand(`git checkout ${COMMIT}`)
  process.chdir(root)
  await cp(
    `${root}/.tmp/html-parser-2/src/__fixtures__/Documents`,
    `${root}/.tmp/html-parser-2-cases`,
    { recursive: true }
  )
  const allTests = await getAllTests(`${root}/.tmp/html-parser-2-cases`)
  for (const test of allTests) {
    await copyFile(test.filePath, test.destinationPath)
  }
}

main()
