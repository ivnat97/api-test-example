import IAvatar from './avatar.model';

export default interface IPhoto {
  id: number;
  accountID: number;
  isAdult: boolean;
  createdAt: number;
  key: IAvatar;
}
