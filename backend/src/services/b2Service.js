import B2 from 'backblaze-b2';

class B2Service {
  constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.B2_KEY_ID,
      applicationKey: process.env.B2_APPLICATION_KEY,
    });
    this.bucketName = process.env.B2_BUCKET_NAME;
    this.bucketId = null;
    this.authToken = null;
    this.uploadUrl = null;
  }

  async authorize() {
    if (!this.authToken) {
      await this.b2.authorize();
      this.authToken = this.b2.authorizationToken;
      
      const buckets = await this.b2.listBuckets();
      const bucket = buckets.data.buckets.find(b => b.bucketName === this.bucketName);
      this.bucketId = bucket.bucketId;
    }
  }

  async getUploadUrl() {
    if (!this.uploadUrl) {
      await this.authorize();
      const response = await this.b2.getUploadUrl({ bucketId: this.bucketId });
      this.uploadUrl = response.data.uploadUrl;
      this.uploadAuthToken = response.data.authorizationToken;
    }
    return { uploadUrl: this.uploadUrl, authToken: this.uploadAuthToken };
  }

  async uploadFile(fileBuffer, fileName, contentType = 'application/pdf') {
    const { uploadUrl, authToken } = await this.getUploadUrl();
    
    const response = await this.b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authToken,
      fileName,
      data: fileBuffer,
      info: {
        'Content-Type': contentType,
      },
    });

    return response.data;
  }

  async downloadFile(fileName) {
    console.log('B2Service: Downloading file:', fileName);
    await this.authorize();
    
    try {
      const response = await this.b2.downloadFileByName({
        bucketName: this.bucketName,
        fileName,
      });
      console.log('B2Service: File downloaded successfully, size:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('B2Service: Download failed:', error.message);
      throw error;
    }
  }

  async deleteFile(fileName) {
    await this.authorize();
    const fileInfo = await this.b2.getFileInfo({ fileName });
    await this.b2.deleteFileVersion({
      fileId: fileInfo.data.fileId,
      fileName,
    });
  }
}

export default new B2Service();