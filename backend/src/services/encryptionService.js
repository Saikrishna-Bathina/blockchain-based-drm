const crypto = require('crypto');
const fs = require('fs');

const algorithm = 'aes-256-cbc';

exports.encryptFile = (filePath, outputPath) => {
    return new Promise((resolve, reject) => {
        // Generate valid key and iv
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);

        const input = fs.createReadStream(filePath);
        const output = fs.createWriteStream(outputPath);

        const cipher = crypto.createCipheriv(algorithm, key, iv);

        input.pipe(cipher).pipe(output);

        output.on('finish', () => {
            resolve({
                key: key.toString('hex'),
                iv: iv.toString('hex'),
                encryptedPath: outputPath
            });
        });

        output.on('error', (err) => reject(err));
    });
};

exports.decryptFile = (encryptedPath, keyHex, ivHex, outputPath) => {
    return new Promise((resolve, reject) => {
        const key = Buffer.from(keyHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');

        const input = fs.createReadStream(encryptedPath);
        const output = fs.createWriteStream(outputPath);

        const decipher = crypto.createDecipheriv(algorithm, key, iv);

        input.pipe(decipher).pipe(output);

        output.on('finish', () => resolve(outputPath));
        output.on('error', (err) => reject(err));
    });
};
