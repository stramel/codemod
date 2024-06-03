import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteHandler,
  RouteHandlerMethod,
} from "fastify";
import { codemodService } from "~/services/CodemodService.js";
import type { UserDataPopulatedRequest } from "../plugins/authPlugin.js";
import { parseGetCodemodLatestVersionQuery } from "../schemata/schema.js";
import { environment } from "../util.js";

export type GetCodemodDownloadLinkResponse = { link: string };

export const getCodemodDownloadLink: RouteHandler<{
  Reply: GetCodemodDownloadLinkResponse;
}> = async (request: UserDataPopulatedRequest) => {
  const { name } = parseGetCodemodLatestVersionQuery(request.query);

  const userId = request.user!.id;

  if (!userId) {
    return codemodService.getCodemodDownloadLink(name, null, []);
  }

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: environment.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: environment.AWS_SECRET_ACCESS_KEY ?? "",
    },
    region: "us-west-1",
  });

  const generateSignedUrl = async (
    bucket: string,
    uploadKey: string,
    expireTimeout?: number,
  ) => {
    return getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: bucket, Key: uploadKey }),
      { expiresIn: expireTimeout ?? 30 },
    );
  };

  return codemodService.getCodemodDownloadLink(
    name,
    generateSignedUrl,
    request?.allowedNamespaces,
  );
};
