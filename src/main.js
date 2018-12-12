document.addEventListener("DOMContentLoaded", function(event) {

  var workingNote;

  var componentManager = new ComponentManager();

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
    if(note.isMetadataUpdate || !window.simplemde) {
      return;
    }

    if(note.content.text !== lastValue) {
      ignoreTextChange = true;
      window.simplemde.value(note.content.text);
      ignoreTextChange = false;
    }

    if(initialLoad) {
      initialLoad = false;
      window.simplemde.codemirror.getDoc().clearHistory();
      if(window.simplemde.isPreviewActive()) {
        window.simplemde.togglePreview();
      }
    }
  });

  window.simplemde = new SimpleMDE({
     element: document.getElementById("editor"),
     spellChecker: false,
     status: false,
     toolbar:[
           "heading", "bold", "italic", "strikethrough",
           "|", "quote", "code",
           "|", "unordered-list", "ordered-list",
           "|", "clean-block",
           "|", "link", "image",
           "|", "table",
           "|", "preview", "side-by-side", "fullscreen"
           ],
   });

   // Some sort of issue on Mobile RN where this causes an exception (".className is not defined")
   try {
     window.simplemde.toggleFullScreen();
   } catch (e) {}

  window.simplemde.codemirror.on("change", function() {

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
          lastValue = window.simplemde.value();

          var html = window.simplemde.options.previewRender(window.simplemde.value());
          var strippedHtml = truncateString(strip(html));

          note.content.preview_plain = strippedHtml;
          note.content.preview_html = null;
          note.content.text = lastValue;
        });

      }
    }
  });
});
