
interface Base64Image {
    base64_data: string;
    mime_type: string;

}

const getImageSrc = (i: Base64Image) => {
    return i.mime_type + ', ' + i.base64_data;
};

export { Base64Image, getImageSrc };
