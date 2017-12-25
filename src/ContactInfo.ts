import { PendingImage, defaultPendingImage } from './PendingImage';

interface ContactInfo {
    name: string;
    image: PendingImage;
}

const defaultContactInfo: ContactInfo = {
    name: '',
    image: defaultPendingImage
};

export { ContactInfo, defaultContactInfo };
