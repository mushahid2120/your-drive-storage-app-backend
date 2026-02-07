import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const cloudfrontDistributionDomain = "https://d24gtp8x4ffd63.cloudfront.net";
const privateKey = Buffer.from(
  process.env.CLOUDFRONT_KEY,
  "base64"
).toString("utf-8");

const keyPairId = "K1WWF25J0YVIQ7";
const dateLessThan = new Date((Math.floor(Date.now() / 1000) + 15 * 60) * 1000).toISOString();

const cloudfrontSignedUrl = (s3ObjectKey, filename, download = false) => {
  const url = `${cloudfrontDistributionDomain}/${s3ObjectKey}?download=${download}&filename=${encodeURIComponent(filename)}`;

  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
  });
  return signedUrl;
};

export default cloudfrontSignedUrl;