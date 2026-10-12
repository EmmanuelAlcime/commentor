// State for the comment, reply and edit forms
export type CommentFormState =
    | { status: 'idle' }
    // `at` changes on every success, so a form can react to each one
    | { status: 'success'; at: number }
    // Echoes the text back so the form keeps what the user typed
    | { status: 'error'; error: string; content: string };

export const initialCommentFormState: CommentFormState = { status: 'idle' };

export type CommentActionResult = { ok: true } | { ok: false; error: string };
