import * as React from 'react';
import { WsConnection } from './WsConnection';
import { Avatar } from 'material-ui';
import { getImageSrc } from './Base64Image';
import { PendingImage } from './PendingImage';

interface Props {
    type?: 'avatar' | 'img';
    alt?: string;
    height?: number;
    className?: string;
    image: PendingImage;
    connection: WsConnection;
}

interface State {
    src: string;
}

export default class FetchedImage extends React.Component<Props, State> {

    static defaultProps: Partial<Props> = {
        type: 'img',
        alt: '',
        height: 600,
        className: ''
    };

    constructor(props: Props) {
        super(props);

        // init state
        this.state = {
            src: '//:0'
        };

    }

    async componentDidMount() {

        // reqest data from connection
        const image = await this.props.connection.getImage(this.props.image.uri);
        this.setState({ src: getImageSrc(image) });
    }

    render() {
        if (this.props.type === 'avatar') {
            return <Avatar className={this.props.className} alt={this.props.alt} src={this.state.src} />;
        } else {
            return (
                <img
                    className={this.props.className}
                    alt={this.props.alt}
                    src={this.state.src}
                    height={this.props.height}
                />
            );
        }
    }
}
