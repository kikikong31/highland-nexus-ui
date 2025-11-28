import { createI18n } from 'vue-i18n'
import zh from './zh-CN.json'
import en from './en-US.json'

const messages = {
  'zh-CN': zh,
  'en-US': en
}

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
})

export default i18n

