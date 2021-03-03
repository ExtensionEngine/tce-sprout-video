import axios from 'axios';

const PRIVATE_VIDEO_CODE = 0;

export default function upload({ url, file, token }) {
  const headers = {
    'Content-Type': 'multipart/form-data'
  };
  const formData = new FormData();
  formData.append('source_video', file, file.name);
  formData.append('token', token);
  formData.append('privacy', PRIVATE_VIDEO_CODE.toString());
  formData.append('requires_signed_embeds', 'true');
  return axios.post(url, formData, { headers })
    .then(res => res.data);
}
