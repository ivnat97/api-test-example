import { expect } from 'chai';
import * as chai from 'chai';
import * as faker from 'faker';
import * as store from 'store';
import * as njwt from 'njwt';
import * as secureRandom from 'secure-random';
import AuthController from '../controller/auth.controller';
import AccountController from '../controller/account.controller';
import { messages, testData } from '../fixtures/data';
import { wait } from './common/test.utils';
import assertErrorResponse from './common/assertions';
import IAuth from '../model/auth.model';

chai.use(assertErrorResponse);
/* eslint-disable func-names, prefer-arrow-callback */

describe('Login validations', function () {
  let confirmationId;
  let accountId;
  let authData: IAuth;

  after(async function () {
    const accountController = new AccountController(this);
    const resp = await accountController.deleteAccount(accountId);

    expect(resp.status).to.eq(200);
    expect(resp.data).to.be.true;
  });

  describe('POST /auth/phone', function () {
    it('returns confirmation id - #smoke', async function () {
      const authController = new AuthController(this);
      const resp = await authController.sendPhoneNumber();
      confirmationId = resp.data.confirmation_id;

      expect(resp.status).to.eq(201);
      expect(resp.data).to.have.property('confirmation_id');
      expect(resp.data.confirmation_id).to.be.a('number');
    });

    it('accepts num with + symbol', async function () {
      const authController = new AuthController(this);
      const resp = await authController.sendPhoneNumber(`+${testData.phone}`);

      expect(resp.status).to.eq(201);
      expect(resp.data).to.have.property('confirmation_id');
      expect(resp.data.confirmation_id).to.be.a('number');
    });

    it('returns error for non-UA number', async function () {
      const authController = new AuthController(this);
      const resp = await authController.sendPhoneNumber('238345234511');

      expect(resp.status).to.eq(400);
      expect(resp.data).to.be.badRequest([messages.auth.invalidPhone]);
    });

    it('returns error for non-number format', async function () {
      const authController = new AuthController(this);
      const resp = await authController.sendPhoneNumber('abcd');

      expect(resp.status).to.eq(400);
      expect(resp.data).to.be.badRequest([messages.auth.invalidPhone]);
    });
  });

  describe('POST /auth/phone/confirm', function () {
    it('returns tokens for valid code - #smoke', async function () {
      const authController = new AuthController(this);
      const resp = await authController.confirmLogin(confirmationId, testData.code);

      expect(resp.status).to.eq(201);
      expect(resp.data).to.have.keys('token', 'refreshToken', 'expireIn');
      expect(resp.data.token).to.be.a('string');
      expect(resp.data.refreshToken).to.be.a('string');
      expect(resp.data.expireIn).to.be.a('number');

      authData = resp.data;
      store.set('token', authData.token);
    });

    it('returns error when the same code & confirmationId were used second time', async function () {
      const authController = new AuthController(this);
      const resp = await authController.confirmLogin(confirmationId, testData.code);

      expect(resp.status).to.eq(400);
      expect(resp.data).to.be.badRequest(messages.auth.invalidConfirmation);
    });

    it('returns error for invalid code', async function () {
      const authController = new AuthController(this);
      const randomCode = faker.random.number({ min: 1112, max: 9999 });
      const resp = await authController.confirmLogin(confirmationId, randomCode);

      expect(resp.status).to.eq(400);
      expect(resp.data).to.be.badRequest(messages.auth.invalidConfirmation);
    });

    it('returns error for invalid confirmationId', async function () {
      const authController = new AuthController(this);
      const resp = await authController.confirmLogin(faker.random.number({ min: 1000, max: 9999 }), testData.code);

      expect(resp.status).to.eq(400);
      expect(resp.data).to.be.badRequest(messages.auth.invalidConfirmation);
    });

    it('creates an empty account on first login - #smoke', async function () {
      const accountController = new AccountController(this);
      const resp = await accountController.getMyAccount();

      expect(resp.status).to.eq(200);
      expect(resp.data.id).to.be.a('number');
      accountId = resp.data.id;
    });
  });

  describe('POST /auth/refresh', function () {
    beforeEach(function () {
      store.remove('token');
    });

    it('returns new token and refreshToken - #smoke', async function () {
      await wait(1000);
      const authController = new AuthController(this);
      let resp = await authController.refreshToken(authData);

      expect(resp.status).to.eq(201);
      expect(resp.data.token).to.not.eq(authData.token);
      expect(resp.data.refreshToken).to.not.eq(authData.refreshToken);
      expect(resp.data.expireIn).to.eq(86400);
      store.set('token', resp.data.token);

      const accountController = new AccountController(this);
      resp = await accountController.getMyAccount();

      expect(resp.status).to.eq(200);
      expect(resp.data.id).to.eq(accountId);
    });

    it('has fixed expiration time', async function () {
      const req: IAuth = {
        token: authData.token,
        refreshToken: authData.refreshToken,
        expireIn: 106400,
      };
      const authController = new AuthController(this);
      const resp = await authController.refreshToken(req);

      expect(resp.status).to.eq(201);
      expect(resp.data.expireIn).to.eq(86400);
    });

    it('returns error for empty refresh token', async function () {
      const req = {
        token: authData.token,
      };
      const authController = new AuthController(this);
      const resp = await authController.post(authController.REFRESH_ENDPOINT, req);

      expect(resp.data).to.be.badRequest([messages.auth.nonJWTRefreshToken]);
    });

    it('returns error for empty token', async function () {
      const req = {
        refreshToken: authData.refreshToken,
      };
      const authController = new AuthController(this);
      const resp = await authController.post(authController.REFRESH_ENDPOINT, req);

      expect(resp.data).to.be.badRequest([messages.auth.nonJWTToken]);
    });

    it('returns error for a random string token', async function () {
      const req: IAuth = {
        token: faker.internet.password(400, false, /[0-9A-Za-z]/),
        refreshToken: faker.internet.password(420, false, /[0-9A-Za-z]/),
      };
      const authController = new AuthController(this);
      const resp = await authController.refreshToken(req);

      expect(resp.data).to.be.badRequest([
        messages.auth.nonJWTToken,
        messages.auth.nonJWTRefreshToken,
      ]);
    });

    it('returns error for a fake tokens', async function () {
      const jwt = njwt.create({
        id: accountId,
        name: null,
        type: 0,
      }, secureRandom(256, { type: 'Buffer' })).compact();
      const refreshJWT = njwt.create({
        id: accountId,
        type: 1,
        generalToken: jwt,
      }, secureRandom(256, { type: 'Buffer' })).compact();

      const req: IAuth = {
        token: jwt,
        refreshToken: refreshJWT,
      };
      const authController = new AuthController(this);
      const resp = await authController.refreshToken(req);

      expect(resp.data).to.forbidden(messages.auth.refreshTokenInvalid);
    });
  });
});
