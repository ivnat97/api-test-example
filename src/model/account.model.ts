import IAvatar from './avatar.model';
import EGender from './gender.enum';

export default interface IAccount {
  id: number;
  fullName?: string;
  avatar: IAvatar;
  online: boolean;
  status: string;
  info: IInfo;
  preferences: IPreferences;
}

export interface IInfo {
  id: number;
  age?: number;
  country?: string;
  location?: string;
  city?: string;
  description?: string;
  workDescription?: string;
  lastSeen: number;
  isRegistrationCompleted: boolean;
}

export interface IPreferences {
  id: number;
  accountID: number;
  gender?: EGender;
  defaultSearchRange: number;
  genderPreferences?: EGender;
  showMenInSearch: boolean;
  showWomenInSearch: boolean;
  showUndefinedInSearch: boolean;
  pushNotifications: boolean;
  ageFrom?: number;
  ageTo?: number;
}
