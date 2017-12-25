
interface PendingImage {
    uri: string;
    width: number;
    height: number;
}

const defaultPendingImage: PendingImage = {
    uri: '',
    width: 0,
    height: 0
};

export { PendingImage, defaultPendingImage };
