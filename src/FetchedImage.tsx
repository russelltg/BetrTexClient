import * as React from 'react';
import { WsConnection } from './WsConnection';
import { Avatar } from 'material-ui';
import { Base64Image, getImageSrc } from './Base64Image';

interface Props {
    type?: 'avatar' | 'img';
    alt?: string;
    width?: number;
    className?: string;
    image: string;
    connection: WsConnection;
}

interface State {
    image: Base64Image;
}

export default class FetchedImage extends React.Component<Props, State> {

    static defaultProps: Partial<Props> = {
        type: 'img',
        alt: '',
        width: 100,
        className: ''
    };

    constructor(props: Props) {
        super(props);

        // init state
        this.state = {
            image: {
                base64_data: '',
                mime_type: ''
            }
        };

    }

    componentDidMount() {

        // reqest data from connection
        this.props.connection.getImage(this.props.image, (image: Base64Image) => {
            this.setState({ image });
        });
    }

    render() {
        if (this.props.type === 'avatar') {
            return <Avatar className={this.props.className} alt={this.props.alt} src={getImageSrc(this.state.image)} />;
        } else {
            return (
                <img
                    className={this.props.className}
                    alt={this.props.alt}
                    src={getImageSrc(this.state.image)}
                    width={this.props.width}
                />
            );
        }
    }
}
