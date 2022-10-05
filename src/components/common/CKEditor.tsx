import React from 'react';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CKEdit = ({
	content,
	onUpdateContent,
}: {
	content: string;
	onUpdateContent: (e: any, editor: any) => void;
}) => {
	return (
		<CKEditor
			editor={ClassicEditor}
			data={content}
			onChange={onUpdateContent}
		/>
	);
};

// const CKEdit = () => {
// 	return <div> CKEditor </div>;
// };

export default CKEdit;
