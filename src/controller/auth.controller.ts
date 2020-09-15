import { AxiosResponse } from 'axios';
import * as store from 'store';
import BaseController from './base.controller';
import IAuth from '../model/auth.model';
import { testData } from '../fixtures/data';

export default class AuthController extends BaseController {
  readonly AUTH_ENDPOINT: string = '/auth/phone';

  readonly CONFIRM_ENDPOINT: string = '/auth/phone/confirm';

  readonly REFRESH_ENDPOINT: string = '/auth/refresh';

  async sendPhoneNumber(phoneNumber: string = testData.phone): Promise<AxiosResponse> {
    return this.post(this.AUTH_ENDPOINT, { phone: phoneNumber });
  }

  async confirmLogin(confirmationId: number, code: number = testData.code): Promise<AxiosResponse> {
    return this.post(this.CONFIRM_ENDPOINT, {
      confirmation_id: confirmationId,
      code,
    });
  }

  async login(phoneNumber: string = testData.phone): Promise<IAuth> {
    const respFirstStep = await this.sendPhoneNumber(phoneNumber);
    const respConfirmation = await this.confirmLogin(respFirstStep.data.confirmation_id);
    const respSecondStep: IAuth = respConfirmation.data;
    store.set('token', respSecondStep.token);
    return respSecondStep;
  }

  async refreshToken(body: IAuth): Promise<AxiosResponse> {
    return this.post(this.REFRESH_ENDPOINT, body);
  }
}
