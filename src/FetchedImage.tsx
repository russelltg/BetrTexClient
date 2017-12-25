import * as React from 'react';
import { WsConnection } from './WsConnection';
import { Avatar } from 'material-ui';
import { Base64Image, getImageSrc } from './Base64Image';
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

    componentDidMount() {

        // reqest data from connection
        this.props.connection.getImage(this.props.image.uri, (image: Base64Image) => {
            this.setState({ src: getImageSrc(image) });
        });
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
