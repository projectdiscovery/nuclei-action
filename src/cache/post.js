import { saveCaches } from './cache'

const main = async () => {
  await saveCaches()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})