import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

export default defineEventHandler(async () => {
  const menusDir = resolve(process.cwd(), 'public/menus')
  const supportedLanguages = ['en', 'vi', 'cn', 'kor', 'rus'] as const

  try {
    const menus = {
      EN: [] as string[],
      VI: [] as string[],
      CN: [] as string[],
      KOR: [] as string[],
      RUS: [] as string[]
    }

    for (const language of supportedLanguages) {
      const languageDir = resolve(menusDir, language)
      let files: Awaited<ReturnType<typeof readdir>>

      try {
        files = await readdir(languageDir, { withFileTypes: true })
      } catch {
        continue
      }

      const imagePaths = files
        .filter((entry) => entry.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(entry.name))
        .sort((a, b) => {
          const aNum = Number.parseInt(a.name.replace(/\D+/g, ''), 10)
          const bNum = Number.parseInt(b.name.replace(/\D+/g, ''), 10)

          if (Number.isFinite(aNum) && Number.isFinite(bNum) && aNum !== bNum) {
            return aNum - bNum
          }

          return a.name.localeCompare(b.name)
        })
        .map((entry) => `/menus/${language}/${entry.name}`)

      menus[language.toUpperCase() as keyof typeof menus] = imagePaths
    }

    return { menus }
  } catch {
    return {
      menus: {
        EN: [],
        VI: [],
        CN: [],
        KOR: [],
        RUS: []
      }
    }
  }
})
