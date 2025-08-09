export type AddOn = {
  legacy_addon_id: string
  title: string
  description: string
  version_id: number
  version_string: string
  dev: string
  dev_url: string
  faq_url: string
  support_url: string
  extra_urls: Record<string, string>
  require: {
    php: [string, string]
    XF: [number, string]
  }
  icon: string
}
export type BuildJson = {
  additional_files?: string[]
  minify?: string[]
}

interface ProjectConfig {
  exclude?: string[]
}
