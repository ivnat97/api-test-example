import { expect } from 'chai';
import * as chai from 'chai';
import * as faker from 'faker';
import AuthController from '../controller/auth.controller';
import AccountController from '../controller/account.controller';
import PhotoController from '../controller/photo.controller';
import ProfileController from '../controller/profile.controller';
import { messages, files } from '../fixtures/data';
import assertErrorResponse from './common/assertions';
import IRegistration from '../model/registration.model';
import IAccount from '../model/account.model';
import EGender from '../model/gender.enum';
import IPhoto from '../model/photo.model';
import IProfile from '../model/profile.model';

chai.use(assertErrorResponse);
/* eslint-disable func-names, prefer-arrow-callback */
describe('Registration validations', function () {
  let photo: IPhoto;
  let photoSecond: IPhoto;
  let avatar: IPhoto;
  let profile: IProfile;
  let account: IAccount;

  before(async function () {
    const authController = new AuthController(this);
    await authController.login();

    const accountController = new AccountController(this);
    const resp = await accountController.getMyAccount();
    account = resp.data;
  });

  after(async function () {
    const accountController = new AccountController(this);
    const resp = await accountController.deleteAccount(account.id);

    expect(resp.status).to.eq(200);
    expect(resp.data).to.be.true;
  });

  describe('POST /photo/upload', function () {
    it('uploads new .jpg photo - #smoke', async function () {
      const photoController = new PhotoController(this);
      const resp = await photoController.uploadPhoto();

      expect(resp.status).to.eq(201);
      expect(resp.data).to.have.keys('id', 'accountID', 'isAdult', 'createdAt', 'key');
      expect(resp.data.accountID).to.eq(account.id);
      expect(resp.data.id).to.be.a('number');
      expect(resp.data.isAdult).to.be.a('boolean');
      expect(resp.data.createdAt).to.be.a('number');
      photo = resp.data;
    });

    it('allows uploading multiple photos for one profile - #smoke', async function () {
      const photoController = new PhotoController(this);
      let resp = await photoController.uploadPhoto();
      photoSecond = resp.data;

      expect(resp.status).to.eq(201);
      expect(resp.data).to.have.keys('id', 'accountID', 'isAdult', 'createdAt', 'key');

      const profileController = new ProfileController(this);
      resp = await profileController.getProfile(account.id);
      profile = resp.data;

      expect(resp.status).to.eq(200);
      expect(profile.photos).to.have.lengthOf(2);
      expect(profile.photos).to.deep.equal([photo, photoSecond]);
    });

    it('returns error for other than image type', async function () {
      const photoController = new PhotoController(this);
      const resp = await photoController.uploadPhoto(files.txtFile);

      expect(resp.status).to.eq(400);
      expect(resp.data).to.be.badRequest(messages.photo.nonImageType);
    });

    it('returns error for empty file', async function () {
      const photoController = new PhotoController(this);
      const resp = await photoController.uploadEmpty();

      expect(resp.status).to.eq(400);
      expect(resp.data).to.be.badRequest(messages.photo.emptyFile);
    });

    it('returns error for image size bigger than 2Mb', async function () {
      this.timeout(5000);
      const photoController = new PhotoController(this);
      const resp = await photoController.uploadPhoto(files.largeImage);

      expect(resp.status).to.eq(413);
    });
  });

  describe('PUT /profile/avatar/:id', function () {
    it('sets new profile avatar - #smoke', async function () {
      const profileController = new ProfileController(this);
      let resp = await profileController.setAvatar(photo.id);
      avatar = resp.data;

      expect(resp.status).to.eq(200);
      expect(resp.data).to.have.keys('id', 'accountID', 'isAdult', 'createdAt', 'key');
      expect(resp.data.id).to.be.a('number');
      expect(resp.data.isAdult).to.be.a('boolean');
      expect(resp.data.createdAt).to.be.a('number');
      expect(avatar.accountID).to.eq(account.id);

      resp = await profileController.getProfile(account.id);
      profile = resp.data;

      expect(resp.status).to.eq(200);
      expect(profile.avatar).to.deep.equal(avatar.key);
    });

    it('updates profile avatar - #smoke', async function () {
      const profileController = new ProfileController(this);
      let resp = await profileController.setAvatar(photoSecond.id);
      avatar = resp.data;

      expect(resp.status).to.eq(200);
      expect(resp.data).to.have.keys('id', 'accountID', 'isAdult', 'createdAt', 'key');
      expect(avatar.accountID).to.eq(account.id);

      resp = await profileController.getProfile(account.id);
      profile = resp.data;

      expect(resp.status).to.eq(200);
      expect(profile.avatar).to.deep.equal(avatar.key);
    });

    it('returns error for non-existing photoId', async function () {
      const profileController = new ProfileController(this);
      const resp = await profileController.setAvatar(faker.random.number({ min: 1000, max: 9999 }));

      expect(resp.data).to.be.forbidden(messages.photo.wrongPhotoId);
    });
  });

  describe('POST /account/complete-registration', function () {
    it('completes account registration - #smoke', async function () {
      const accountController = new AccountController(this);
      const req: IRegistration = {
        fullName: `${faker.name.firstName(1)} ${faker.name.lastName(1)}`,
        gender: EGender.female,
        preferredGender: EGender.undefined,
      };
      let resp = await accountController.completeRegistration(req);
      expect(resp.status).to.eq(201);

      account = resp.data;
      expect(account.info.isRegistrationCompleted).to.be.true;
      expect(account.fullName).to.deep.equal(req.fullName);
      expect(account.preferences.gender).to.deep.equal(req.gender);
      expect(account.preferences.genderPreferences).to.deep.equal(req.preferredGender);
      expect(account.avatar).to.deep.equal(avatar.key);

      const profileController = new ProfileController(this);
      resp = await profileController.getProfile(account.id);
      profile = resp.data;

      expect(resp.status).to.eq(200);
      expect(profile.isRegistrationCompleted).to.be.true;
      expect(profile.gender).to.eq(req.gender);
    });

    it('returns errors for empty values', async function () {
      const accountController = new AccountController(this);
      const req = {
        fullName: '',
        gender: '',
        preferredGender: '',
      };
      const resp = await accountController.post(accountController.REGISTR_ENDPOINT, req);

      expect(resp.data).to.be.badRequest([
        messages.registration.fullNameEmpty,
        messages.registration.genderEmpty,
        messages.registration.preferredGenderEmpty,
      ]);
    });

    it('returns errors for invalid types', async function () {
      const accountController = new AccountController(this);
      const req = {
        fullName: 345,
        gender: 3,
        preferredGender: 0,
      };
      const resp = await accountController.post(accountController.REGISTR_ENDPOINT, req);

      expect(resp.data).to.be.badRequest([
        messages.registration.fullNameType,
        messages.registration.genderType,
        messages.registration.preferredGenderType,
      ]);
    });

    it('returns errors for empty body', async function () {
      const accountController = new AccountController(this);
      const resp = await accountController.post(accountController.REGISTR_ENDPOINT, {});

      expect(resp.data).to.be.badRequest([
        messages.registration.fullNameType,
        messages.registration.fullNameEmpty,
        messages.registration.genderType,
        messages.registration.genderEmpty,
        messages.registration.preferredGenderType,
        messages.registration.preferredGenderEmpty,
      ]);
    });

    it('returns error for second complete-registration request', async function () {
      const accountController = new AccountController(this);
      const req: IRegistration = {
        fullName: `${faker.name.firstName(1)} ${faker.name.lastName(1)}`,
        gender: EGender.female,
        preferredGender: EGender.male,
      };
      const resp = await accountController.completeRegistration(req);

      expect(resp.data).to.be.badRequest(messages.registration.alreadyCompleted);
    });
  });
});
