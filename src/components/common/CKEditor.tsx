import React from 'react';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import { trpc } from '../../utils/trpc';
import { useSession } from 'next-auth/react';
import { FileLoader } from '@ckeditor/ckeditor5-upload/src/filerepository';

const CKEdit = ({
	content,
	onUpdateContent,
}: {
	content: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onUpdateContent: (e: any, editor: Editor) => void;
}) => {
	const getSignedS3UrlMutation = trpc.imageUpload.getUploadLink.useMutation();
	const { data: session } = useSession();

	function MyUploadAdapterPlugin(editor: any) {
		editor.plugins.get('FileRepository').createUploadAdapter = (
			loader: any
		) => {
			return new MyUploadAdapter(loader);
		};
	}

	// THE ckEDITOR VERSION ISNTALLED HAS IMG REMOVAR PLUGIN, KEEP TESTING OR REMOVE IT

	class MyUploadAdapter {
		loader: FileLoader;

		constructor(props: FileLoader) {
			this.loader = props;
		}

		upload() {
			return new Promise((resolve, reject) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				this.loader.file.then(async (data: any) => {
					if (data.size > 2000000) {
						reject('The size of the uploaded file has to be less than 2MB');
						return;
					}

					let userId = '';
					if (session && session.user && session.user.id) {
						userId = session.user.id;
					}

					const signedUrlObj = await getSignedS3UrlMutation.mutateAsync({
						userId: userId,
						imageType: data.type,
						imgExtension: '.' + data.type.split('/')[1],
					});

					try {
						const uploadedImageUrl = await fetch(signedUrlObj.signedUrl, {
							method: 'PUT',
							headers: {
								'Content-Type': 'multipart/form-data',
							},
							body: data,
						});
						const url: string | undefined = uploadedImageUrl.url.split('?')[0];
						resolve({ default: url });
					} catch (error) {
						console.log(error);
						reject(error);
					}
				});
				// resolve({ default: 'https://i.stack.imgur.com/uC6qN.png' });
			});
		}

		abort() {
			///
		}
	}

	// Editor.create(document.querySelector('#editor'), {
	// 	//...
	// 	imageRemoveEvent: {
	// 		additionalElementTypes: null, // Add additional element types to invoke callback events. Default is null and it's not required. Already included ['image','imageBlock','inlineImage']
	// 		// additionalElementTypes: ['image', 'imageBlock', 'inlineImage'], // Demo to write additional element types
	// 		callback: (imagesSrc, nodeObjects) => {
	// 			// note: imagesSrc is array of src & nodeObjects is array of nodeObject
	// 			// node object api: https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_node-Node.html

	// 			console.log('callback called', imagesSrc, nodeObjects);
	// 		},
	// 	},
	// 	// ...
	// });

	return (
		<CKEditor
			editor={Editor}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			config={{ extraPlugins: [MyUploadAdapterPlugin] }}
			data={content}
			onChange={onUpdateContent}
		/>
	);
};

// const CKEdit = () => {
// 	return <div> CKEditor </div>;
// };

export default CKEdit;
