import { execaCommand } from 'execa'
import { copyFile, cp, readdir, rm } from 'node:fs/promises'
import path, { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const REPOSITORY = 'https://github.com/web-platform-tests/wpt'
const COMMIT = '061018e46c85c11dc32d339a4f7380b76c7b7298'

const getTestName = (line) => {
  return (
    'web-platform-tests-' +
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
  const dirents = await readdir(folder, {
    recursive: true,
  })
  const allTests = []
  for (const dirent of dirents) {
    if (!dirent.endsWith('.html')) {
      continue
    }
    const filePath = `${folder}/${dirent}`
    const name = getTestName(dirent)
    const destinationPath = join(root, 'test', 'cases', name)
    allTests.push({ filePath, destinationPath })
  }
  return allTests
}

const main = async () => {
  process.chdir(root)
  // await rm(`${root}/.tmp`, { recursive: true, force: true })
  // await execaCommand(`git clone ${REPOSITORY} .tmp/wpt`, {
  //   stdio: 'inherit',
  // })
  process.chdir(`${root}/.tmp/wpt`)
  await execaCommand(`git checkout ${COMMIT}`)
  process.chdir(root)
  await cp(`${root}/.tmp/wpt/html`, `${root}/.tmp/wpt-2-cases`, {
    recursive: true,
  })
  const allTests = await getAllTests(`${root}/.tmp/wpt-2-cases`)
  for (const test of allTests) {
    await copyFile(test.filePath, test.destinationPath)
  }
}

main()
