import IAvatar from './avatar.model';
import IPhoto from './photo.model';
import EGender from './gender.enum';

export default interface IProfile {
    id: number;
    gender?: EGender;
    fullname?: string;
    age?: number;
    country?: string;
    location?: string;
    city?: string;
    description?: string;
    workDescription?: string;
    lastSeen: number;
    isRegistrationCompleted: boolean;
    avatar: IAvatar;
    photos: IPhoto[];
    tags: string[];
}
