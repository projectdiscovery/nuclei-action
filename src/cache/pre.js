import { restoreCaches } from './cache'

const main = async () => {
  await restoreCaches()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})