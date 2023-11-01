import axios, { AxiosRequestConfig } from 'axios';
import crypto from 'crypto';

export class FileStorage {

  backblaze2_base_url = 'https://api.backblazeb2.com';
  keyId = 'fa3ebef5962d';
  key = '005d7f574b555fa87a7677fba9899f64f423e6ebfc';
  bucket = {
    name: 'guardly-ev',
    id: '8fdae3cecbce3f1589b6021d'
  };

  identifier: string;
  
  constructor(id: string) {
    this.identifier = id;
  }

  async authorize_account() {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${this.backblaze2_base_url}/b2api/v2/b2_authorize_account`,
      headers: { 
        'Authorization': `Basic ${btoa(`${this.keyId}:${this.key}`)}`
      }
    } as AxiosRequestConfig;

    const response = await axios.request(config)
    if (response.status !== 200) {
      throw new Error(`failed to get backblaze base api details`)
    }

    const data = response.data
    return { 
      apiUrl: data.apiUrl,
      token: data.authorizationToken,
      downloadUrl: data.downloadUrl,
      s3ApiUrl: data.s3ApiUrl
    }
  }

  async get_upload_url() {
    const { apiUrl, token } = await this.authorize_account()

    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      timeout: 30000,
      url: `${apiUrl}/b2api/v2/b2_get_upload_url?bucketId=${this.bucket.id}`,
      headers: { 
        'Authorization': token
      }
    } as AxiosRequestConfig;

    const response = await axios.request(config)
    if (response.status !== 200) {
      throw new Error(`failed to get backblaze upload url`)
    }

    const data = response.data
    
    return {
      uploadUrl: data.uploadUrl,
      token: data.authorizationToken
    }
  }

  async upload_file(filename: string, mimetype: string, file: unknown) {
    const { uploadUrl, token } = await this.get_upload_url()

    const sha1sum = crypto.createHash('sha1').update(file as DataView).digest("hex");

    // TODO: based on mimetype, upload to respective folders - images / audio / video / log
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: uploadUrl,
      timeout: 30000,
      headers: { 
        'Authorization': token,
        'X-Bz-File-Name': encodeURIComponent(`${this.identifier}/${filename}`),
        'Content-Type': mimetype,
        'Content-Length': Buffer.byteLength(file),
        'X-Bz-Content-Sha1': sha1sum,
      },
      data: file
    } as unknown as AxiosRequestConfig;

    const response = await axios.request(config)
    if (response.status !== 200) {
      throw new Error(`failed to get backblaze upload url`)
    }

    const data = response.data

    return {
      fileName: data.fileName,
      fileId: data.fileId,
      buckeId: data.bucketId,
      action: data.action
    }
  }

  async upload_log(filename: string, mimetype: string, file: unknown, event: string) {
    const { uploadUrl, token } = await this.get_upload_url()

    const sha1sum = crypto.createHash('sha1').update(file as DataView).digest("hex");

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: uploadUrl,
      timeout: 30000,
      headers: { 
        'Authorization': token,
        'X-Bz-File-Name': encodeURIComponent(`${this.identifier}/logs/${event}/${filename}`),
        'Content-Type': mimetype,
        'Content-Length': Buffer.byteLength(file),
        'X-Bz-Content-Sha1': sha1sum,
      },
      data: file
    } as unknown as AxiosRequestConfig;

    const response = await axios.request(config)
    if (response.status !== 200) {
      throw new Error(`failed to get backblaze upload url`)
    }

    const data = response.data

    return {
      fileName: data.fileName,
      fileId: data.fileId,
      buckeId: data.bucketId,
      action: data.action
    }
  }

  async upload_audio_files(filename: string, mimetype: string, file: unknown) {
    const { uploadUrl, token } = await this.get_upload_url()

    const sha1sum = crypto.createHash('sha1').update(file as DataView).digest("hex");

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: uploadUrl,
      timeout: 30000,
      headers: { 
        'Authorization': token,
        'X-Bz-File-Name': encodeURIComponent(`${this.identifier}/audio/${filename}`),
        'Content-Type': mimetype,
        'Content-Length': Buffer.byteLength(file),
        'X-Bz-Content-Sha1': sha1sum,
      },
      data: file
    } as unknown as AxiosRequestConfig;

    const response = await axios.request(config)
    if (response.status !== 200) {
      throw new Error(`failed to get backblaze upload url`)
    }

    const data = response.data

    return {
      fileName: data.fileName,
      fileId: data.fileId,
      buckeId: data.bucketId,
      action: data.action
    }
  }

  async load_files() {
    const { apiUrl, token } = await this.authorize_account()

    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      timeout: 30000,
      url: `${apiUrl}/b2api/v2/b2_list_file_names?bucketId=${this.bucket.id}&prefix=${this.identifier}/&maxFileCount=50`,
      headers: { 
        'Authorization': token
      }
    } as AxiosRequestConfig;
    console.log({config})

    const response = await axios.request(config)
    if (response.status !== 200) {
      throw new Error(`failed to get backblaze upload url`)
    }

    const data = response.data

    return {
      files: data.files.map(f => ({
        bucketId: f.bucketId,
        fileId: f.fileId,
        fileName: f.fileName,
        url: `${apiUrl}/file/guardly-ev/${f.fileName}`
      }))
    }
  }

  
}