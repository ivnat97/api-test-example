import EGender from './gender.enum';

export default interface IRegistration {
    fullName: string,
    gender: EGender,
    preferredGender: EGender
}
