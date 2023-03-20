import { ApproxStructure, RealKeys, StructAssert } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.keyboard.EnterKeyAnchorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const setup = (editor: Editor, html: string, elementPath: number[], offset: number) => {
    editor.setContent(html);
    TinySelections.setCursor(editor, elementPath, offset);
  };

  const enterKey = async () => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('Enter') ]);
  };

  const addGeckoBr = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, children: StructAssert[]) => {
    if (PlatformDetection.detect().browser.isFirefox()) {
      return [ ...children, s.element('br', { attrs: { 'data-mce-bogus': str.is('1') }}) ];
    } else {
      return children;
    }
  };

  it('Enter at start of anchor zwsp', async () => {
    const editor = hook.editor();
    setup(editor, '<p><a href="#">' + Zwsp.ZWSP + 'a</a></p>', [ 0, 0, 0 ], 1);
    await enterKey();
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('br', {
                  attrs: {
                    'data-mce-bogus': str.is('1')
                  }
                })
              ]
            }),
            s.element('p', {
              children: addGeckoBr(s, str, [
                s.element('a', {
                  attrs: {
                    'data-mce-href': str.is('#'),
                    'href': str.is('#')
                  },
                  children: [
                    s.text(str.is(Zwsp.ZWSP + 'a'))
                  ]
                })
              ])
            })
          ]
        });
      })
    );
    TinyAssertions.assertSelection(editor, [ 1, 0, 0 ], 1, [ 1, 0, 0 ], 1);
  });

  it('Enter at end of anchor zwsp', async () => {
    const editor = hook.editor();
    setup(editor, '<p><a href="#">a' + Zwsp.ZWSP + '</a></p>', [ 0, 0, 0 ], 2);
    await enterKey();
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: addGeckoBr(s, str, [
                s.element('a', {
                  attrs: {
                    'data-mce-href': str.is('#'),
                    'href': str.is('#')
                  },
                  children: [
                    s.text(str.is('a' + Zwsp.ZWSP))
                  ]
                })
              ])
            }),
            s.element('p', {
              children: [
                s.element('br', {
                  attrs: {
                    'data-mce-bogus': str.is('1')
                  }
                })
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
  });

  it('Enter at start of anchor zwsp with adjacent content', async () => {
    const editor = hook.editor();
    setup(editor, '<p>a<a href="#">' + Zwsp.ZWSP + 'b</a>c</p>', [ 0, 1, 0 ], 1);
    await enterKey();
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('a')),
                s.element('a', {
                  attrs: {
                    'data-mce-href': str.is('#'),
                    'href': str.is('#')
                  }
                })
              ]
            }),
            s.element('p', {
              children: [
                s.element('a', {
                  attrs: {
                    'data-mce-href': str.is('#'),
                    'href': str.is('#')
                  },
                  children: [
                    s.text(str.is(Zwsp.ZWSP + 'b'))
                  ]
                }),
                s.text(str.is('c'))
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertSelection(editor, [ 1, 0, 0 ], 1, [ 1, 0, 0 ], 1);
  });

  it('Enter at end of anchor zwsp with adjacent content', async () => {
    const editor = hook.editor();
    setup(editor, '<p>a<a href="#">b' + Zwsp.ZWSP + '</a>c</p>', [ 0, 1, 0 ], 1);
    await enterKey();
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('a')),
                s.element('a', {
                  attrs: {
                    'data-mce-href': str.is('#'),
                    'href': str.is('#')
                  },
                  children: [
                    s.text(str.is('b'))
                  ]
                })
              ]
            }),
            s.element('p', {
              children: [
                s.text(str.is('c'))
              ]
            })
          ]
        });
      })
    );
    TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
  });
});
