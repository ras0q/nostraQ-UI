// @ts-check
;(() => {
  /**
   * @type {import('/@/types/config').Config}
   */
  const config = {
    services: [
      {
        label: 'Repository',
        iconPath: 'github.svg',
        appLink: 'https://github.com/ras0q/nostr_traQ_S-UI'
      }
    ],
    isRootChannelSelectableAsParentChannel: false,
    tooLargeFileMessage: '大きい%sの共有にはDriveを使用してください'
  }

  self.traQConfig = config
})()
