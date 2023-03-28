import { RealKeys } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.textpatterns.TriggerInlinePatternBeginningTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ ], true);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  it('TBA: enter after first * in *a*', async () => {
    const editor = hook.editor();
    editor.setContent('<p>*a*</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('Enter') ]);
    TinyAssertions.assertContent(editor, '<p>*</p><p>a*</p>');
  });

  it('TBA: enter after first * in *b*', async () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>a</strong>*b*</p>');
    TinySelections.setCursor(editor, [ 0, 1 ], 1);
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('Enter') ]);
    TinyAssertions.assertContent(editor, '<p><strong>a</strong>*</p><p>b*</p>');
  });
});
