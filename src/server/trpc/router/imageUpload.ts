import { z } from 'zod';
import { t } from '../trpc';
import AWS from 'aws-sdk';
import { env } from '../../../env/server.mjs';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
	accessKeyId: env.S3_KEY,
	secretAccessKey: env.S3_SECRET,
	region: env.S3_REGION,
});

export const imageRouter = t.router({
	getUploadLink: t.procedure
		.input(
			z.object({
				userId: z.string(),
				imageType: z.string(),
				imgExtension: z.string(),
			})
		)

		.mutation(async ({ input, ctx }) => {
			///
			const key = `${input.userId}/${uuidv4()}${input.imgExtension}`;
			const s3Params = {
				Bucket: 'dinodevkenbanimgstore',
				Key: key,
				ContentType: input.imageType,
			};

			const signedUrl: string = await new Promise((resolve, reject) => {
				s3.getSignedUrl('putObject', s3Params, (err, url) => {
					resolve(url);
				});
			});

			const returnObj: {
				key: string;
				signedUrl: string;
			} = {
				signedUrl: signedUrl,
				key: key,
			};

			return returnObj;
		}),
});
