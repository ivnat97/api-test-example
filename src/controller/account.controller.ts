import { AxiosResponse } from 'axios';
import * as store from 'store';
import BaseController from './base.controller';
import IRegistration from '../model/registration.model';

export default class AccountController extends BaseController {
  readonly ACCOUNT_ENDPOINT: string = '/account';

  readonly PREFS_ENDPOINT: string = '/account/preferences';

  readonly REGISTR_ENDPOINT: string = '/account/complete-registration';

  public async getMyAccount(): Promise<AxiosResponse> {
    return this.get(this.ACCOUNT_ENDPOINT);
  }

  public async deleteAccount(id: number): Promise<AxiosResponse> {
    const resp = await this.delete(this.ACCOUNT_ENDPOINT, id);
    store.remove('token');
    return resp;
  }

  public async completeRegistration(body: IRegistration): Promise<AxiosResponse> {
    return this.post(this.REGISTR_ENDPOINT, body);
  }
}
