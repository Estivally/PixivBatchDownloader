// 保存和初始化设置项
// 只有部分设置会被保存
import { EVT } from './EVT'
import { SettingsForm } from './Settings.d'

interface XzSetting {
  multipleImageWorks: number
  firstFewImages: number
  downType0: boolean
  downType1: boolean
  downType2: boolean
  ugoiraSaveAs: 'webm' | 'gif' | 'zip'
  needTag: string
  notNeedTag: string
  quietDownload: boolean
  downloadThread: number
  userSetName: string
  tagNameToFileName: boolean
  alwaysFolder: boolean
  showOptions: boolean
  postDate: boolean
  postDateStart: string
  postDateEnd: string
  previewResult: boolean
  favNumSwitch: boolean
  setFavNum: string
  setWHSwitch: boolean
  setWidthAndOr: '&' | '|'
  setWidth: string
  setHeight: string
  ratioSwitch: boolean
  ratio: '1' | '2' | '3'
  userRatio: string
  idRangeSwitch: boolean
  needTagSwitch: boolean
  notNeedTagSwitch: boolean
}

interface SettingChangeData {
  name: keyof XzSetting
  value: string | number | boolean
}

class SaveSettings {
  constructor(form: SettingsForm) {
    this.form = form
    this.restoreOption()
    this.bindOptionEvent()

    window.addEventListener(
      EVT.events.settingChange,
      (event: CustomEventInit) => {
        const data = event.detail.data as SettingChangeData
        if (Reflect.has(this.optionDefault, data.name)) {
          // 持久化保存设置
          ;(this.options[data.name] as any) = data.value
          localStorage.setItem(this.storeName, JSON.stringify(this.options))
        }
      }
    )
  }

  private form: SettingsForm

  // 本地存储中使用的 name
  private readonly storeName = 'xzSetting'

  // 需要持久化保存的设置的默认值
  private readonly optionDefault: XzSetting = {
    multipleImageWorks: 0,
    firstFewImages: 1,
    downType0: true,
    downType1: true,
    downType2: true,
    ugoiraSaveAs: 'webm',
    needTag: '',
    notNeedTag: '',
    quietDownload: true,
    downloadThread: 5,
    userSetName: '{id}',
    tagNameToFileName: true,
    alwaysFolder: true,
    showOptions: true,
    postDate: false,
    postDateStart: '',
    postDateEnd: '',
    previewResult: true,
    favNumSwitch: false,
    setFavNum: '0',
    setWHSwitch: false,
    setWidthAndOr: '&',
    setWidth: '0',
    setHeight: '0',
    ratioSwitch: false,
    ratio: '1',
    userRatio: '1.4',
    idRangeSwitch: false,
    needTagSwitch: false,
    notNeedTagSwitch: false
  }

  // 需要持久化保存的设置
  private options: XzSetting = this.optionDefault

  // 恢复值是 Boolean 的设置项
  // 给复选框使用
  private restoreBoolean(name: keyof XzSetting) {
    // 优先使用用户设置的值
    if (this.options[name] !== undefined) {
      this.form[name].checked = this.options[name]
    } else {
      // 否则使用默认值
      this.form[name].checked = this.optionDefault[name]
    }
    // 这里不能简单的使用“或”符号来处理，考虑如下情况：
    // this.options[name] || this.optionDefault[name]
    // 用户设置为 false，默认值为 true，使用 || 的话就恒为 true 了
  }

  // 恢复值是 string 的设置项
  // 给单选按钮和文本框使用
  private restoreString(name: keyof XzSetting) {
    // 优先使用用户设置的值
    if (this.options[name] !== undefined) {
      this.form[name].value = this.options[name].toString()
    } else {
      // 否则使用默认值
      this.form[name].value = this.optionDefault[name].toString()
    }
  }

  // 从持久化设置，缺省使用默认值，恢复下载区域的设置
  private restoreOption() {
    const savedOption = localStorage.getItem(this.storeName)
    // 读取保存的设置
    if (savedOption) {
      this.options = JSON.parse(savedOption)
    } else {
      // 如果没有保存过，则不做处理
      return
    }

    // 设置是否显示选项区域
    EVT.fire(EVT.events.toggleForm, this.options.showOptions)

    // 多图作品设置
    this.restoreString('multipleImageWorks')

    // 设置作品张数
    this.restoreString('firstFewImages')

    // 设置下载的作品类型
    this.restoreBoolean('downType0')
    this.restoreBoolean('downType1')
    this.restoreBoolean('downType2')

    // 设置动图格式选项
    this.restoreString('ugoiraSaveAs')

    // 设置收藏数量选项
    this.restoreBoolean('favNumSwitch')

    // 设置收藏数量数值
    this.restoreString('setFavNum')

    // 设置宽高条件
    this.restoreBoolean('setWHSwitch')
    this.restoreString('setWidthAndOr')
    this.restoreString('setWidth')
    this.restoreString('setHeight')

    // 设置宽高比例
    this.restoreBoolean('ratioSwitch')
    this.restoreString('ratio')
    this.restoreString('userRatio')

    // 设置 id 范围开关
    this.restoreBoolean('idRangeSwitch')

    // 设置必须的 tag
    this.restoreBoolean('needTagSwitch')
    this.restoreString('needTag')

    // 设置排除的 tag
    this.restoreBoolean('notNeedTagSwitch')
    this.restoreString('notNeedTag')

    // 设置投稿时间
    this.restoreBoolean('postDate')
    this.restoreString('postDateStart')
    this.restoreString('postDateEnd')

    // 设置自动下载
    this.restoreBoolean('quietDownload')

    // 设置下载线程
    this.restoreString('downloadThread')

    // 设置文件命名规则
    this.restoreString('userSetName')

    // 设置是否添加标记名称
    this.restoreBoolean('tagNameToFileName')

    // 设置是否始终建立文件夹
    this.restoreBoolean('alwaysFolder')

    // 设置预览搜索结果
    this.restoreBoolean('previewResult')
  }

  // 处理输入框： change 时直接保存 value
  private saveTextInput(name: keyof XzSetting) {
    const el = this.form[name] as HTMLInputElement
    el.addEventListener('change', () => {
      this.emitChange(name, el.value)
    })
  }

  // 处理复选框： click 时直接保存 checked
  private saveCheckBox(name: keyof XzSetting) {
    const el = this.form[name] as HTMLInputElement
    el.addEventListener('click', () => {
      this.emitChange(name, el.checked)
    })
  }

  // 处理单选框： click 时直接保存 value
  private saveRadio(name: string) {
    const radios = this.form[name]
    for (const radio of radios) {
      radio.addEventListener('click', () => {
        this.emitChange(name, radio.value)
      })
    }
  }

  // 绑定所有选项的事件，当选项变动触发 settingChange 事件
  // 只可执行一次，否则事件会重复绑定
  private bindOptionEvent() {
    // 保存是否显示选项区域
    window.addEventListener(EVT.events.toggleForm, (event: CustomEventInit) => {
      const boolean = event.detail.data
      this.emitChange('showOptions', boolean)
    })

    // 保存下载的作品类型
    this.saveCheckBox('downType0')
    this.saveCheckBox('downType1')
    this.saveCheckBox('downType2')

    // 保存多图作品设置
    this.saveRadio('multipleImageWorks')

    // 保存作品张数
    this.saveTextInput('firstFewImages')

    // 保存动图格式选项
    this.saveRadio('ugoiraSaveAs')

    // 保存收藏数量选项
    this.saveCheckBox('favNumSwitch')

    // 保存收藏数量数值
    this.saveTextInput('setFavNum')

    // 保存宽高条件
    this.saveCheckBox('setWHSwitch')
    this.saveRadio('setWidthAndOr')
    this.saveTextInput('setWidth')
    this.saveTextInput('setHeight')

    // 保存宽高比例
    this.saveCheckBox('ratioSwitch')
    this.saveRadio('ratio')
    this.saveTextInput('userRatio')

    // 保存 id 范围
    this.saveRadio('idRange')

    // 保存投稿时间
    this.saveCheckBox('postDate')
    this.saveTextInput('postDateStart')
    this.saveTextInput('postDateEnd')

    // 保存 id 范围开关
    this.saveCheckBox('idRangeSwitch')

    // 保存必须的 tag 设置
    this.saveCheckBox('needTagSwitch')
    this.saveTextInput('needTag')

    // 保存排除的 tag 设置
    this.saveCheckBox('notNeedTagSwitch')
    this.saveTextInput('notNeedTag')

    // 保存命名规则
    const userSetNameInput = this.form.userSetName
    ;['change', 'focus'].forEach(ev => {
      userSetNameInput.addEventListener(ev, () => {
        this.emitChange('userSetName', userSetNameInput.value)
      })
    })

    // 保存是否添加标记名称
    this.saveCheckBox('tagNameToFileName')

    // 保存是否始终建立文件夹
    this.saveCheckBox('alwaysFolder')

    // 保存自动下载
    this.saveCheckBox('quietDownload')

    // 保存下载线程
    this.saveTextInput('downloadThread')

    // 保存预览搜索结果
    this.saveCheckBox('previewResult')

    window.addEventListener(EVT.events.resetOption, () => {
      this.form.reset()
      this.reset()
    })
  }

  private emitChange(name: string, value: string | number | boolean) {
    EVT.fire(EVT.events.settingChange, { name: name, value: value })
  }

  // 重设选项
  private reset() {
    // 将保存的选项恢复为默认值
    this.options = this.optionDefault
    // 覆写本地存储里的设置为默认值
    localStorage.setItem(this.storeName, JSON.stringify(this.options))
    // 重设选项
    this.restoreOption()
  }
}

export { SaveSettings }
