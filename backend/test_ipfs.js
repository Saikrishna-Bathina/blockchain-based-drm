const axios = require('axios');

const testIPFS = async () => {
    const cid = 'QmRYL1qAQsarzSQMVcmEoAToVhbAHnLRmwfEbF92Ao6YuZ';
    const gateways = [
        `https://gateway.pinata.cloud/ipfs/${cid}`,
        `https://ipfs.io/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`
    ];

    for (const url of gateways) {
        console.log(`Testing gateway: ${url}`);
        try {
            const res = await axios.get(url, { timeout: 10000 });
            console.log(`✅ Success! Status: ${res.status}, Length: ${res.headers['content-length']}`);
            break;
        } catch (e) {
            console.error(`❌ Failed: ${e.message}`);
        }
    }
};

testIPFS();
