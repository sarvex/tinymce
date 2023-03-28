import { Fun, Optional } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import { Bookmark } from '../bookmark/BookmarkTypes';
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
  let bookmark: Optional<Bookmark> = Optional.none();
  let shouldOverride = false;

  editor.on('keydown', (event: EditorEvent<KeyboardEvent>) => {
    if (event.keyCode === VK.ENTER) {
      const rng = editor.selection.getRng();
      shouldOverride = isSafari && rng.collapsed && NodeType.isText(rng.commonAncestorContainer);
      if (shouldOverride) {
        bookmark = Optional.some(editor.selection.getBookmark());
        editor.undoManager.add();
      } else {
        handleEnterKeyEvent(editor, event);
      }
    }
  });

  editor.on('keyup', (event: EditorEvent<KeyboardEvent>) => {
    if (event.keyCode === VK.ENTER && shouldOverride) {
      editor.undoManager.undo();
      bookmark.fold(Fun.noop, (b) => editor.selection.moveToBookmark(b));
      handleEnterKeyEvent(editor, event);

      shouldOverride = false;
      bookmark = Optional.none();
    }
  });
};

export {
  setup
};
