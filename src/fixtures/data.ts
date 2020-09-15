export const testData = {
  phone: '380968607970',
  code: 1111,
};

export const files = {
  defaultAvatar: 'avatar.jpg',
  largeImage: 'big_size_image.jpg',
  txtFile: 'wrong_type_file.txt',
};

export const messages = {
  auth: {
    invalidConfirmation: 'verification_request_not_found',
    invalidPhone: 'phone must be a valid phone number',
    nonJWTRefreshToken: 'refreshToken must be a jwt string',
    nonJWTToken: 'token must be a jwt string',
    refreshTokenInvalid: 'refresh_token_is_not_valid',
  },
  photo: {
    emptyFile: 'photo_object_is_required',
    nonImageType: 'non_image_uploading',
    wrongPhotoId: 'you_can_use_only_yours_photos',
  },
  registration: {
    fullNameType: 'fullName must be a string',
    fullNameEmpty: 'fullName should not be empty',
    genderType: 'gender must be a string',
    genderEmpty: 'gender should not be empty',
    preferredGenderType: 'preferredGender must be a string',
    preferredGenderEmpty: 'preferredGender should not be empty',
    alreadyCompleted: 'registration_is_already_completed',
  },
};
