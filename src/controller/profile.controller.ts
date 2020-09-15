import { AxiosResponse } from 'axios';
import BaseController from './base.controller';

export default class ProfileController extends BaseController {
  readonly PROFILE_ENDPOINT = '/profile';

  readonly AVATAR_ENDPOINT = '/profile/avatar';

  public async setAvatar(id: number): Promise<AxiosResponse> {
    return this.put(this.AVATAR_ENDPOINT, id);
  }

  public async getProfile(id: number): Promise<AxiosResponse> {
    return this.get(this.PROFILE_ENDPOINT, id);
  }
}
