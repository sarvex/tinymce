import { PlatformDetection } from '@ephox/sand';

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
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
  editor.on('keydown', (event: EditorEvent<KeyboardEvent>) => {
    if (event.keyCode === VK.ENTER) {
      if (isSafari) {
        bookmark = editor.selection.getBookmark();
        editor.undoManager.add();
      } else {
        handleEnterKeyEvent(editor, event);
      }
    }
  });

  editor.on('keyup', (event: EditorEvent<KeyboardEvent>) => {
    if (isSafari && event.keyCode === VK.ENTER) {
      editor.undoManager.undo();
      editor.selection.moveToBookmark(bookmark);
      handleEnterKeyEvent(editor, event);
    }
  });
};

export {
  setup
};
