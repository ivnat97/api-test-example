export default interface IAvatar {
  urls: IUrls;
  key?: string;
}

export interface IUrls {
  small: string;
  medium: string;
  swipe: string;
  original: string;
}
