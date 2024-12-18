import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'
import elementEnLocale from '@geip/basic-components/lib/locale/lang/en'
import elementZhLocale from '@geip/basic-components/lib/locale/lang/zh-CN'
import enLocale from './en'
import zhLocale from './zh'
import GCPDesignProLocale from '@geip/basic-components/lib/locale'

// 启用 Vue I18n：使其可以在 Vue 应用中使用。
Vue.use(VueI18n)

// 定义翻译信息： 创建一个名为 messages 的对象，其中包含不同语言的翻译信息。每个语言都由一个键值对表示，包括自定义的应用文本翻译
const messages = {
  en: {
    message: 'hello',
    ...elementEnLocale,
    ...enLocale
  },
  zh: {
    message: '你好',
    ...elementZhLocale,
    ...zhLocale
  }
}

// 确定用户语言偏好： 定义名为 getLanguage 的函数，根据用户选择的语言和浏览器语言设置来确定应该使用的语言。如果用户未选择语言或浏览器语言无匹配项，则默认使用英语。
export function getLanguage() {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) return chooseLanguage
  const language = (navigator.language || navigator.browserLanguage).toLowerCase()
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }
  return 'en'
}

// 创建 Vue I18n 实例
const i18n = new VueI18n({
  locale: 'zh', // 设置默认语言
  // locale: getLanguage(),
  messages
})

GCPDesignProLocale.i18n((key, value) => i18n.t(key, value))

export default i18n
