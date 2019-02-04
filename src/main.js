document.addEventListener("DOMContentLoaded", function(event) {

  var workingNote;

  var componentManager = new ComponentManager(null, () => {
    // on ready
    document.body.classList.add(componentManager.platform);
    document.body.classList.add(componentManager.environment);
  });

  var ignoreTextChange = false;
  var initialLoad = true;
  var lastValue, lastUUID;

  componentManager.streamContextItem((note) => {

    if(note.uuid !== lastUUID) {
      // Note changed, reset last values
      lastValue = null;
      initialLoad = true;
      lastUUID = note.uuid;
    }

    workingNote = note;

     // Only update UI on non-metadata updates.
    if(note.isMetadataUpdate || !window.easymde) {
      return;
    }

    if(note.content.text !== lastValue) {
      ignoreTextChange = true;
      window.easymde.value(note.content.text);
      ignoreTextChange = false;
    }

    if(initialLoad) {
      initialLoad = false;
      window.easymde.codemirror.getDoc().clearHistory();
      if(window.easymde.isPreviewActive()) {
        window.easymde.togglePreview();
      }
    }
  });

  window.easymde = new EasyMDE({
     element: document.getElementById("editor"),
     spellChecker: false,
     status: false,
     shortcuts: {
       toggleSideBySide: "Cmd-Alt-P"
     },
     toolbar:[
           "heading", "bold", "italic", "strikethrough",
           "|", "quote", "code",
           "|", "unordered-list", "ordered-list",
           "|", "clean-block",
           "|", "link", "image",
           "|", "table",
           "|", "preview", "side-by-side"
           ],
   });

   // Some sort of issue on Mobile RN where this causes an exception (".className is not defined")
   try {
     window.easymde.toggleFullScreen();
   } catch (e) {}

   /*
    Can be set to Infinity to make sure the whole document is always rendered, and thus the browser's text search works on it. This will have bad effects on performance of big documents.
    Really bad performance on Safari. Unusable.
    */
  window.easymde.codemirror.setOption("viewportMargin", 100);

  window.easymde.codemirror.on("change", function() {

    function strip(html) {
      var tmp = document.implementation.createHTMLDocument("New").body;
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }

    function truncateString(string, limit = 90) {
      if(string.length <= limit) {
        return string;
      } else {
        return string.substring(0, limit) + "...";
      }
    }

    if(!ignoreTextChange) {
      if(workingNote) {
        // Be sure to capture this object as a variable, as this.note may be reassigned in `streamContextItem`, so by the time
        // you modify it in the presave block, it may not be the same object anymore, so the presave values will not be applied to
        // the right object, and it will save incorrectly.
        let note = workingNote;

        componentManager.saveItemWithPresave(note, () => {
          lastValue = window.easymde.value();

          var html = window.easymde.options.previewRender(window.easymde.value());
          var strippedHtml = truncateString(strip(html));

          note.content.preview_plain = strippedHtml;
          note.content.preview_html = null;
          note.content.text = lastValue;
        });

      }
    }
  });
});
