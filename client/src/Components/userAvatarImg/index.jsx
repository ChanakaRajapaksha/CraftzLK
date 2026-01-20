import React, { useEffect } from 'react';

const UserAvatarImgComponent = (props) => {
    
    useEffect(() => {
        console.log('UserAvatarImgComponent - Received props:', {
            img: props.img,
            userName: props.userName,
            hasValidImage: props.img && typeof props.img === 'string' && props.img.length > 0
        });
    }, [props.img, props.userName]);
    
    const hasValidImage = props.img && typeof props.img === 'string' && props.img.length > 0;
    const [imageError, setImageError] = React.useState(false);
    
    // Reset error state when image URL changes
    React.useEffect(() => {
        setImageError(false);
    }, [props.img]);
    
    return (
        <div className={`userImg ${props.lg === true ? 'lg' : ''}`}>
            <span className="rounded-circle">
                {hasValidImage && !imageError ? (
                    <img 
                        src={props.img} 
                        alt="User avatar"
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        onError={(e) => {
                            console.log('Image failed to load:', props.img);
                            setImageError(true);
                        }}
                        onLoad={() => {
                            console.log('Image loaded successfully:', props.img);
                        }}
                    />
                ) : (
                    <span>{props?.userName && props?.userName !== "" ? props?.userName?.charAt(0) : "U"}</span>
                )}
            </span>
        </div>
    )
}

export default UserAvatarImgComponent;