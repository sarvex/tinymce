import { PlatformDetection } from '@ephox/sand';

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import * as NodeType from '../dom/NodeType';
import * as InsertNewLine from '../newline/InsertNewLine';
import { endTypingLevelIgnoreLocks } from '../undo/TypingState';

const handleEnterKeyEvent = (editor: Editor, event: EditorEvent<KeyboardEvent>) => {
  if (event.isDefaultPrevented()) {
    return;
  }

  event.preventDefault();

  endTypingLevelIgnoreLocks(editor.undoManager);
  editor.undoManager.transact(() => {
    InsertNewLine.insert(editor, event);
  });
};

const isSafari = PlatformDetection.detect().browser.isSafari();

const setup = (editor: Editor): void => {
  let bookmark = editor.selection.getBookmark();
  let shouldOverride = false;

  editor.on('keydown', (event: EditorEvent<KeyboardEvent>) => {
    if (event.keyCode === VK.ENTER) {
      const rng = editor.selection.getRng();
      shouldOverride = isSafari && rng.collapsed && NodeType.isText(rng.commonAncestorContainer);
      if (shouldOverride) {
        bookmark = editor.selection.getBookmark();
        editor.undoManager.add();
      } else {
        handleEnterKeyEvent(editor, event);
      }
    }
  });

  editor.on('keyup', (event: EditorEvent<KeyboardEvent>) => {
    if (event.keyCode === VK.ENTER && shouldOverride) {
      editor.undoManager.undo();
      editor.selection.moveToBookmark(bookmark);
      handleEnterKeyEvent(editor, event);
      shouldOverride = false;
    }
  });
};

export {
  setup
};
