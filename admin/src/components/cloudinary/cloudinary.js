import axios from 'axios';

import {v2 as cloudinary} from 'cloudinary';
          
// cloudinary.config({ 
//   cloud_name: 'dvyozjjma', 
//   api_key: '561367263211135', 
//   api_secret: '1NMWYXwRSE_g8xn4RiY3i1MT1i4' 
// });

export const uploadCloudinary=async(file, formData)=>{
    formData.append("images",file);
    formData.append("upload_preset","dvyozjjma");
    const {data} = await axios.post("https://api.cloudinary.com/v1_1/dvyozjjma/image/upload", formData);

    return {publicId: data?.public_id, url: data?.secure_url, formData}
}
